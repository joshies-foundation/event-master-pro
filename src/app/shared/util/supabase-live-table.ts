import {
  PostgrestResponse,
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import type { GenericSchema } from '@supabase/supabase-js/src/lib/types';

type ID = string | number;

export type LiveRow = Record<string, unknown> & {
  id: ID;
  created_at: string;
  updated_at: string | null;
};

export type LiveTableCallback<LiveRow> = (
  err: Error | undefined,
  records: readonly LiveRow[],
) => void;

// Filters available with Supabase Realtime Postgres Changes, according to the docs:
// https://supabase.com/docs/guides/realtime/postgres-changes#available-filters
export type FilterOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in';

type TDatabase = {
  public: GenericSchema;
};

type TTable<Database extends TDatabase> = keyof Database['public']['Tables'] &
  string;

type TColumn<
  Database extends TDatabase,
  Table extends TTable<Database>,
> = keyof Database['public']['Tables'][Table]['Row'] & string;

type TRow<
  Database extends TDatabase,
  Table extends TTable<Database>,
> = Database['public']['Tables'][Table]['Row'] & LiveRow;

export type RealtimeFilter<
  Database extends TDatabase,
  Table extends TTable<Database>,
> = `${TColumn<Database, Table>}=${FilterOperator}.${string}`;

export type LiveTableParams<
  Database extends TDatabase,
  Table extends TTable<Database>,
  Row extends TRow<Database, Table>,
> = {
  table: Table;
  filter?: RealtimeFilter<Database, Table>;
  callback: LiveTableCallback<Row>;
  schema?: string;
  channelName?: string;
};

export function liveTable<
  Database extends TDatabase,
  Table extends TTable<Database>,
  Row extends TRow<Database, Table>,
>(
  supabase: SupabaseClient<Database>,
  params: LiveTableParams<Database, Table, Row>,
): RealtimeChannel {
  const parseTimestamp = (timestamp: string) => new Date(timestamp).getTime();
  const liveTable = new LiveTable<Row>(parseTimestamp);

  const {
    table,
    filter,
    callback,
    channelName = `${table}-${filter}`,
    schema = 'public',
  } = params;

  return (
    supabase
      .channel(channelName)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<Row>) => {
          const timestamp = payload.commit_timestamp;
          switch (payload.eventType) {
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT: {
              liveTable.processEvent({
                type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
                record: payload.new,
                timestamp,
              });
              break;
            }
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE: {
              liveTable.processEvent({
                type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
                record: payload.new,
                timestamp,
              });
              break;
            }
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE: {
              liveTable.processEvent({
                type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE,
                record: payload.old,
                timestamp,
              });
              break;
            }
          }
          callback(undefined, liveTable.records);
        },
      )
      .subscribe((status) => {
        const ERROR_STATES: `${REALTIME_SUBSCRIBE_STATES}`[] = [
          REALTIME_SUBSCRIBE_STATES.TIMED_OUT,
          REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR,
        ];
        if (ERROR_STATES.includes(status)) {
          callback(new Error(`SUBSCRIPTION: ${status}`), []);
        }
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .on('system', {}, (payload) => {
        if (payload.extension === REALTIME_LISTEN_TYPES.POSTGRES_CHANGES) {
          let snapshot: PromiseLike<PostgrestResponse<Row>>;

          if (filter) {
            const [, filterColumn, filterOperator, filterValue] =
              filter.match(/^(.+)=([^.]+)\.(.+)$/)!;

            snapshot = supabase
              .from(table)
              .select('*')
              .filter(filterColumn, filterOperator, filterValue)
              .overrideTypes<Row[], { merge: false }>();
          } else {
            snapshot = supabase
              .from(table)
              .select('*')
              .overrideTypes<Row[], { merge: false }>();
          }

          snapshot.then(({ error, data }) => {
            if (error) {
              callback(new Error(error.message), []);
            } else {
              liveTable.processSnapshot(data);
              callback(undefined, liveTable.records);
            }
          });
        }
      })
  );
}

type Insert<Row extends LiveRow> = {
  type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT;
  record: Row;
  timestamp: string;
};

type Update<Row extends LiveRow> = {
  type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE;
  record: Partial<Row>;
  timestamp: string;
};

type Delete<Row extends LiveRow> = {
  type: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE;
  record: Partial<Row>;
  timestamp: string;
};

export type LiveTableEvent<Row extends LiveRow> =
  | Insert<Row>
  | Update<Row>
  | Delete<Row>;

export type ILiveTable<Row extends LiveRow> = {
  processSnapshot(records: readonly Row[]): void;
  processEvent(event: LiveTableEvent<Row>): void;
  readonly records: readonly Row[];
};

export type ParseTimestamp = (timestamp: string) => number;

export class LiveTable<Row extends LiveRow> implements ILiveTable<Row> {
  private readonly recordById = new Map<ID, Row>();
  private readonly bufferedEvents: LiveTableEvent<Row>[] = [];

  private snapshotTimestamp: number | undefined;

  constructor(private readonly parseTimestamp: ParseTimestamp) {}

  public processEvent(event: LiveTableEvent<Row>) {
    if (this.snapshotTimestamp === undefined) {
      this.bufferedEvents.push(event);
      return;
    }

    const eventTimestamp = this.parseTimestamp(event.timestamp);
    if (eventTimestamp < this.snapshotTimestamp) {
      // This event is older than the snapshot, so we can ignore it
      return;
    }

    const { type, record } = validate(event);
    switch (type) {
      case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT: {
        if (this.recordById.has(record.id)) {
          const existing = this.recordById.get(record.id)!;
          // If the timestamp of the existing record is the same as the event timestamp, we'll ignore this event
          const recordTimestamp = this.parseTimestamp(
            record.updated_at || record.created_at,
          );
          const existingTimestamp = this.parseTimestamp(
            existing?.updated_at || existing?.created_at,
          );
          if (recordTimestamp === existingTimestamp) {
            return;
          }

          throw new Error(
            `Conflicting insert. We already have ${JSON.stringify(
              existing,
            )} from a snapshot. Cannot insert ${JSON.stringify(record)}`,
          );
        }
        this.recordById.set(record.id, record);
        break;
      }
      case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE: {
        const id = record.id;
        if (!id) {
          throw new Error(
            `Cannot update. Record has no id: ${JSON.stringify(record)}`,
          );
        }
        const oldRecord = this.recordById.get(id);
        if (oldRecord === undefined) {
          throw new Error(
            `Cannot update. Record does not exist: ${JSON.stringify(record)}`,
          );
        }
        this.recordById.set(id, { ...oldRecord, ...record });
        break;
      }
      case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE: {
        const id = record.id;
        if (!id) {
          throw new Error(
            `Cannot delete. Record has no id: ${JSON.stringify(record)}`,
          );
        }
        this.recordById.delete(id);
        break;
      }
    }
  }

  processSnapshot(records: readonly Row[]) {
    this.snapshotTimestamp = 0;
    for (const record of records) {
      const recordTimestamp = this.parseTimestamp(
        record.updated_at || record.created_at,
      );
      if (recordTimestamp > this.snapshotTimestamp) {
        this.snapshotTimestamp = recordTimestamp;
      }
      this.recordById.set(record.id, record);
    }
    for (const event of this.bufferedEvents) {
      this.processEvent(event);
    }
  }

  /**
   * Returns the replica of the table as an array of records.
   * The records are not sorted, and there is no guarantee of order.
   */
  get records(): readonly Row[] {
    return [...this.recordById.values()];
  }
}

function validate<Row extends LiveRow>(
  event: LiveTableEvent<Row>,
): LiveTableEvent<Row> {
  const { timestamp, record, type } = event;
  const eventTimestamp = new Date(timestamp);
  if (type === REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE) {
    // Delete events don't have timestamps on the record - just the id
    return event;
  }
  if (!record.created_at) {
    throw new Error(
      `Record has no created_at. Event: ${JSON.stringify(event)}`,
    );
  }
  const recordTimestamp = new Date(record.updated_at || record.created_at);
  if (eventTimestamp < recordTimestamp) {
    throw new Error(
      `Event timestamp ${timestamp} is older than record timestamp ${recordTimestamp}`,
    );
  }
  return event;
}
