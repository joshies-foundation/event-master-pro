import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AddressInfo, connect as connectTcp, createServer } from 'node:net';
import { firstValueFrom } from 'rxjs';
import { Database } from '../src/app/shared/util/schema';
import {
  realtimeUpdatesFromTable,
  Table,
} from '../src/app/shared/util/supabase-helpers';
import { resetDatabase, sql } from './support/db';
import { expect, test } from './support/fixtures';
import { seed } from './support/seed';

function watchColinsScore(supabase: SupabaseClient<Database>) {
  const seen: { score?: number } = {};
  const subscription = realtimeUpdatesFromTable(
    supabase,
    Table.Player,
    `session_id=eq.${seed.sessionId}`,
  ).subscribe((players) => {
    seen.score = players.find(
      (player) => player.id === seed.colin.playerId,
    )?.score;
  });
  return { seen, subscription };
}

async function setColinsScore(score: number): Promise<void> {
  await sql`update player set score = ${score} where id = ${seed.colin.playerId}`;
}

class DroppableWebSocket extends WebSocket {
  static latest: DroppableWebSocket | undefined;
  static joins = 0;
  static onJoin: (topic: string) => void = () => {};

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    super(...args);
    DroppableWebSocket.latest = this;
  }

  override send(data: Parameters<WebSocket['send']>[0]): void {
    const join = String(data).match(/"([^"]+)","phx_join"/);
    if (join) {
      DroppableWebSocket.joins++;
      DroppableWebSocket.onJoin(join[1]);
    }
    super.send(data);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connect(
  baseURL: string,
  {
    fetch,
    transport = DroppableWebSocket,
    timeout,
  }: {
    fetch?: typeof globalThis.fetch;
    transport?: typeof WebSocket;
    timeout?: number;
  } = {},
): SupabaseClient<Database> {
  return createClient<Database>(
    baseURL,
    'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    {
      auth: { persistSession: false },
      global: { fetch },
      realtime: { transport, timeout },
    },
  );
}

async function signInAsColin(
  baseURL: string,
  options?: Parameters<typeof connect>[1],
): Promise<SupabaseClient<Database>> {
  const supabase = connect(baseURL, options);
  await supabase.auth.signInWithPassword({
    email: `${seed.colin.username}@joshies.app`,
    password: seed.password,
  });
  return supabase;
}

test('two live subscriptions to the same table and filter both receive changes', async ({
  baseURL,
}) => {
  const supabase = await signInAsColin(baseURL!);

  try {
    const first = watchColinsScore(supabase);
    const second = watchColinsScore(supabase);
    await expect
      .poll(() => [first.seen.score, second.seen.score])
      .toEqual([seed.colin.score, seed.colin.score]);

    await setColinsScore(34);
    await expect
      .poll(() => [first.seen.score, second.seen.score])
      .toEqual([34, 34]);

    first.subscription.unsubscribe();
    await expect.poll(() => supabase.getChannels()).toHaveLength(1);
    await setColinsScore(35);
    await expect.poll(() => second.seen.score).toBe(35);
  } finally {
    await supabase.removeAllChannels();
  }
});

test('a live subscription that reconnects after a dropped connection closes its channel on unsubscribe', async ({
  baseURL,
}) => {
  const supabase = await signInAsColin(baseURL!);

  try {
    const { seen, subscription } = watchColinsScore(supabase);
    await expect.poll(() => seen.score).toBe(seed.colin.score);
    const [firstChannel] = supabase.getChannels();

    DroppableWebSocket.latest!.close();
    await setColinsScore(36);
    await expect.poll(() => seen.score).toBe(36);
    await setColinsScore(37);
    await expect.poll(() => seen.score).toBe(37);
    expect(supabase.getChannels()).toHaveLength(1);
    expect(supabase.getChannels()[0].topic).not.toBe(firstChannel.topic);

    subscription.unsubscribe();
    await expect.poll(() => supabase.getChannels()).toHaveLength(0);
  } finally {
    await supabase.removeAllChannels();
  }
});

async function holdableProxyTo(baseURL: string) {
  const target = new URL(baseURL);
  let release = () => {};
  let released = Promise.resolve();
  const server = createServer(async (client) => {
    await released;
    const upstream = connectTcp(Number(target.port), target.hostname);
    client.on('error', () => upstream.destroy());
    upstream.on('error', () => client.destroy());
    client.pipe(upstream).pipe(client);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    transport: class extends DroppableWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        const proxied = new URL(url);
        proxied.port = String(port);
        super(proxied, protocols);
      }
    },
    hold: () => (released = new Promise((resolve) => (release = resolve))),
    release: () => release(),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('a live subscription catches up as soon as a slow connection opens, without joining closed channels', async ({
  baseURL,
}) => {
  const network = await holdableProxyTo(baseURL!);
  const supabase = await signInAsColin(baseURL!, {
    transport: network.transport,
    timeout: 2_000,
  });

  try {
    const { seen } = watchColinsScore(supabase);
    await expect
      .poll(() => seen.score, { timeout: 30_000 })
      .toBe(seed.colin.score);

    const closedChannelJoins: string[] = [];
    DroppableWebSocket.onJoin = (topic) => {
      if (!supabase.getChannels().some((channel) => channel.topic === topic)) {
        closedChannelJoins.push(topic);
      }
    };
    network.hold();
    DroppableWebSocket.latest!.close();
    // Long enough for retries at 1, 2, 5 and 10 s with 2 s join timeouts to
    // reach the 10 s step.
    await sleep(17_000);
    network.release();
    await expect.poll(() => supabase.realtime.isConnected()).toBe(true);
    expect(closedChannelJoins).toEqual([]);
    await setColinsScore(38);
    await expect.poll(() => seen.score, { timeout: 3_000 }).toBe(38);
  } finally {
    DroppableWebSocket.onJoin = () => {};
    await supabase.removeAllChannels();
    await network.close();
  }
});

test('a channel whose first read fails after it was retried opens no second channel', async ({
  baseURL,
}) => {
  let failFirstRead!: () => void;
  const firstReadFails = new Promise<void>(
    (resolve) => (failFirstRead = resolve),
  );
  let reads = 0;
  const supabase = await signInAsColin(baseURL!, {
    fetch: async (input, init) => {
      if (String(input).includes('/rest/v1/player?') && reads++ === 0) {
        await firstReadFails;
        return new Response('{"message":"Internal Server Error"}', {
          status: 500,
        });
      }
      return fetch(input, init);
    },
  });

  try {
    const { seen, subscription } = watchColinsScore(supabase);
    await expect.poll(() => reads).toBe(1);

    DroppableWebSocket.latest!.close();
    await expect.poll(() => seen.score).toBe(seed.colin.score);
    failFirstRead();
    await sleep(1_000);
    expect(supabase.getChannels()).toHaveLength(1);

    subscription.unsubscribe();
    await expect.poll(() => supabase.getChannels()).toHaveLength(0);
  } finally {
    await supabase.removeAllChannels();
  }
});

test('unsubscribing stops a live subscription that keeps failing', async ({
  baseURL,
}) => {
  const supabase = await signInAsColin(baseURL!);

  try {
    const subscription = realtimeUpdatesFromTable(
      supabase,
      Table.Player,
      'id=eq.not-a-number',
    ).subscribe();
    const [firstChannel] = supabase.getChannels();
    await expect
      .poll(() => supabase.getChannels()[0]?.topic)
      .not.toBe(firstChannel.topic);

    subscription.unsubscribe();
    await expect.poll(() => supabase.getChannels()).toHaveLength(0);
    const joins = DroppableWebSocket.joins;
    await sleep(6_000);
    expect(supabase.getChannels()).toHaveLength(0);
    expect(DroppableWebSocket.joins).toBe(joins);
  } finally {
    await supabase.removeAllChannels();
  }
});

test('a live subscription that keeps failing waits longer before each retry', async ({
  baseURL,
}) => {
  const supabase = await signInAsColin(baseURL!);

  try {
    const joins = DroppableWebSocket.joins;
    const subscription = realtimeUpdatesFromTable(
      supabase,
      Table.Player,
      'id=eq.not-a-number',
    ).subscribe();
    await sleep(4_000);
    subscription.unsubscribe();
    expect(DroppableWebSocket.joins - joins).toBeLessThanOrEqual(3);
  } finally {
    await supabase.removeAllChannels();
  }
});

test('a live subscription whose socket cannot open retries later without an error', async ({
  baseURL,
}) => {
  let sockets = 0;
  class UnavailableWebSocket extends WebSocket {
    constructor() {
      sockets++;
      super('not-a-websocket-url');
    }
  }
  const supabase = connect(baseURL!, { transport: UnavailableWebSocket });
  const errors: unknown[] = [];

  try {
    const subscription = realtimeUpdatesFromTable(
      supabase,
      Table.Player,
    ).subscribe({ error: (error) => errors.push(error) });
    await sleep(2_000);
    subscription.unsubscribe();
    expect(errors).toEqual([]);
    expect(sockets).toBeLessThanOrEqual(2);
  } finally {
    await supabase.removeAllChannels();
  }
});

async function realtimeHasMatchedEveryChange(): Promise<boolean> {
  const [{ busy }] = await sql<{ busy: boolean }[]>`
    select exists (
      select from pg_replication_slots
      where slot_name like 'supabase_realtime_replication_slot%'
        and confirmed_flush_lsn < pg_current_wal_lsn()
    ) or exists (
      select from pg_stat_activity
      where state = 'active'
        and query like '%realtime.list_changes%'
        and pid <> pg_backend_pid()
    ) as busy`;
  return !busy;
}

test('a change still arrives after resets that follow closed phones', async ({
  baseURL,
}) => {
  // Realtime matches a change against the subscriptions that exist when it
  // reads the change. These clients subscribe faster than a browser logs in,
  // so wait until realtime has read this test's own reset.
  await expect.poll(realtimeHasMatchedEveryChange).toBe(true);
  const largeTables = [
    Table.Transaction,
    Table.GameboardMove,
    Table.PlayerRoundScore,
    Table.Bet,
    Table.Player,
    Table.EventParticipant,
  ];
  const closedPhones = await Promise.all(
    [1, 2, 3].map(() => signInAsColin(baseURL!)),
  );
  await Promise.all(
    closedPhones.flatMap((phone) =>
      largeTables.map((table) =>
        firstValueFrom(realtimeUpdatesFromTable(phone, table)),
      ),
    ),
  );
  await Promise.all(closedPhones.map((phone) => phone.removeAllChannels()));

  for (let reset = 0; reset < 3; reset++) await resetDatabase();
  // Realtime checks its rate limit every 5 seconds and drops every change
  // while over it. Wait past one check, so that resets that went over the
  // limit make the change below go missing.
  await new Promise((resolve) => setTimeout(resolve, 6_000));

  const supabase = await signInAsColin(baseURL!);
  try {
    const watcher = watchColinsScore(supabase);
    await expect.poll(() => watcher.seen.score).toBe(seed.colin.score);
    await setColinsScore(34);
    await expect.poll(() => watcher.seen.score).toBe(34);
  } finally {
    await supabase.removeAllChannels();
  }
});
