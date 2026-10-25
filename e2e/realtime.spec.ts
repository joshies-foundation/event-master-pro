import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import { Database } from '../src/app/shared/util/schema';
import {
  realtimeUpdatesFromTable,
  Table,
} from '../src/app/shared/util/supabase-helpers';
import { resetDatabase, sql } from './support/db';
import { expect, test } from './support/fixtures';
import { seed } from './support/seed';

async function signedInClient(
  baseURL: string,
): Promise<SupabaseClient<Database>> {
  const supabase = createClient<Database>(
    baseURL,
    'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    { auth: { persistSession: false } },
  );
  await supabase.auth.signInWithPassword({
    email: `${seed.colin.username}@joshies.app`,
    password: seed.password,
  });
  return supabase;
}

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
  const supabase = await signedInClient(baseURL!);

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
    [1, 2, 3].map(() => signedInClient(baseURL!)),
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

  const supabase = await signedInClient(baseURL!);
  try {
    const watcher = watchColinsScore(supabase);
    await expect.poll(() => watcher.seen.score).toBe(seed.colin.score);
    await setColinsScore(34);
    await expect.poll(() => watcher.seen.score).toBe(34);
  } finally {
    await supabase.removeAllChannels();
  }
});
