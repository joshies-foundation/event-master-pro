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
  const seen: { score?: number; error?: unknown } = {};
  const subscription = realtimeUpdatesFromTable(
    supabase,
    Table.Player,
    `session_id=eq.${seed.sessionId}`,
  ).subscribe({
    next: (players) => {
      seen.score = players.find(
        (player) => player.id === seed.colin.playerId,
      )?.score;
    },
    error: (error) => (seen.error = error),
  });
  return { seen, subscription };
}

async function setColinsScore(score: number): Promise<void> {
  await sql`update player set score = ${score} where id = ${seed.colin.playerId}`;
}

class DroppableWebSocket extends WebSocket {
  static latest: DroppableWebSocket | undefined;

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    super(...args);
    DroppableWebSocket.latest = this;
  }
}

async function signInAsColin(
  baseURL: string,
  fetch?: typeof globalThis.fetch,
): Promise<SupabaseClient<Database>> {
  const supabase = createClient<Database>(
    baseURL,
    'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    {
      auth: { persistSession: false },
      global: { fetch },
      realtime: { transport: DroppableWebSocket },
    },
  );
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
    expect(second.seen.error).toBeUndefined();
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
    expect(seen.error).toBeUndefined();
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
    await new Promise((resolve) => setTimeout(resolve, 1_000));
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
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    expect(supabase.getChannels()).toHaveLength(0);
  } finally {
    await supabase.removeAllChannels();
  }
});
