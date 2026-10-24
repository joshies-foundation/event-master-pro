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

test('two live subscriptions to the same table and filter both receive changes', async ({
  baseURL,
}) => {
  const supabase = createClient<Database>(
    baseURL!,
    'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    { auth: { persistSession: false } },
  );
  await supabase.auth.signInWithPassword({
    email: `${seed.colin.username}@joshies.app`,
    password: seed.password,
  });

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
