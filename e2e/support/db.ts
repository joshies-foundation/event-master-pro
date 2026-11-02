import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const seed = readFileSync('supabase/seed.sql', 'utf8');

const url = process.env['E2E_DB_URL'] ?? '';
if (!url) throw new Error('E2E_DB_URL is unset; playwright.config.ts sets it');
if (!['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
  throw new Error(`E2E_DB_URL must point at a local database, not ${url}`);
}

export function connect() {
  return postgres(url, { onnotice: () => undefined, max: 1 });
}

export const sql = connect();

export async function resetDatabase(): Promise<void> {
  const tables = await sql<{ name: string }[]>`
    select format('%I.%I', schemaname, tablename) as name
    from pg_tables where schemaname = 'public'`;
  const names = [
    'auth.users',
    'auth.identities',
    'storage.objects',
    ...tables.map((t) => t.name),
  ];
  for (let attempt = 1; ; attempt++) {
    try {
      await sql.begin(async (tx) => {
        // Closed pages leave realtime subscriptions behind for up to 15 s.
        // Realtime counts each row below once per matching subscription, and
        // past its limit of 100 per second it discards changes for good. A
        // page or client still subscribed during a reset loses its
        // subscription here too, and then gets no changes and no error.
        await tx`delete from realtime.subscription`;
        await tx.unsafe(`truncate ${names.join(', ')} cascade`);
        await tx.unsafe(seed);
      });
      await waitForRealtimeToReadTheReset();
      return;
    } catch (error) {
      const deadlock = (error as { code?: string }).code === '40P01';
      if (!deadlock || attempt === 3) throw error;
    }
  }
}

// A page that subscribes while Realtime is still reading the WAL also receives
// what the previous test changed. Those rows then collide with the seed rows
// inserted over them, and LiveTable throws.
async function waitForRealtimeToReadTheReset(): Promise<void> {
  const [{ lsn }] = await sql<{ lsn: string }[]>`
    select pg_current_wal_lsn() as lsn`;
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const [{ behind }] = await sql<{ behind: boolean }[]>`
      select exists (
        select from pg_replication_slots
        where slot_name like 'supabase_realtime_replication_slot%'
          and confirmed_flush_lsn < ${lsn}::pg_lsn
      ) as behind`;
    if (!behind) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export async function score(playerId: number): Promise<number> {
  const [row] = await sql<{ score: string }[]>`
    select score from player where id = ${playerId}`;
  return Number(row.score);
}
