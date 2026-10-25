import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../src/app/shared/util/schema';
import {
  realtimeUpdatesFromTable,
  Table,
} from '../src/app/shared/util/supabase-helpers';
import { sql } from './support/db';
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

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    super(...args);
    DroppableWebSocket.latest = this;
  }

  override send(data: Parameters<WebSocket['send']>[0]): void {
    if (String(data).includes('"phx_join"')) DroppableWebSocket.joins++;
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
  }: {
    fetch?: typeof globalThis.fetch;
    transport?: typeof WebSocket;
  } = {},
): SupabaseClient<Database> {
  return createClient<Database>(
    baseURL,
    'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    {
      auth: { persistSession: false },
      global: { fetch },
      realtime: { transport },
    },
  );
}

async function signInAsColin(
  baseURL: string,
  fetch?: typeof globalThis.fetch,
): Promise<SupabaseClient<Database>> {
  const supabase = connect(baseURL, { fetch });
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

test('a channel whose first read fails after it was retried opens no second channel', async ({
  baseURL,
}) => {
  let failFirstRead!: () => void;
  const firstReadFails = new Promise<void>(
    (resolve) => (failFirstRead = resolve),
  );
  let reads = 0;
  const supabase = await signInAsColin(baseURL!, async (input, init) => {
    if (String(input).includes('/rest/v1/player?') && reads++ === 0) {
      await firstReadFails;
      return new Response('{"message":"Internal Server Error"}', {
        status: 500,
      });
    }
    return fetch(input, init);
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
