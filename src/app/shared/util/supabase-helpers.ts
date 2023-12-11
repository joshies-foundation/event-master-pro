import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import { from, map, Observable, scan, startWith, switchMap } from 'rxjs';
import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from './error-helpers';

export function realtimeUpdatesFromTable<Model extends { id: string | number }>(
  tableName: string,
  supabase: SupabaseClient,
): Observable<Model[]> {
  const initialValue$: Observable<Model[]> = from(
    supabase.from(tableName).select('*'),
  ).pipe(map((response) => response.data as Model[]));

  const changes$ = new Observable<RealtimePostgresChangesPayload<Model>>(
    (subscriber) => ({
      unsubscribe: supabase
        .channel(`${tableName}-table-changes`)
        .on<Model>(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
            schema: 'public',
            table: tableName,
          },
          (payload) => subscriber.next(payload),
        )
        .subscribe().unsubscribe,
    }),
  );

  return initialValue$.pipe(
    switchMap((initialValue) =>
      changes$.pipe(
        scan(
          (
            allRecords: Model[],
            change: RealtimePostgresChangesPayload<Model>,
          ) => {
            const changedRecord = (
              (change.new as Model).id ? change.new : change.old
            ) as Model;

            switch (change.eventType) {
              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT:
                return [...allRecords, changedRecord];

              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE:
                return allRecords.filter(
                  (record) => record.id !== changedRecord.id,
                );

              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE:
                return allRecords.map((record) =>
                  record.id === changedRecord.id ? changedRecord : record,
                );

              default:
                return allRecords;
            }
          },
          initialValue,
        ),
        startWith(initialValue),
      ),
    ),
  );
}

export function realtimeUpdatesFromTableAsSignal<
  Model extends { id: string | number },
>(tableName: string, supabase: SupabaseClient): Signal<Model[]> {
  return toSignal(realtimeUpdatesFromTable(tableName, supabase), {
    initialValue: [],
  });
}

export function showMessageOnError<T>(
  promise: PromiseLike<T>,
  messageService: MessageService,
  message?: string,
): PromiseLike<T> {
  return promise.then((response) => {
    const error = (response as { error?: { message?: string } }).error;

    if (error) {
      showErrorMessage(
        message ?? error.message ?? 'Please try again later',
        messageService,
      );
    }

    return response;
  });
}
