import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const seed = readFileSync('supabase/seed.sql', 'utf8');

export const sql = postgres(
  process.env['E2E_DB_URL'] ??
    'postgresql://postgres:postgres@127.0.0.1:55322/postgres',
  { onnotice: () => undefined, max: 1 },
);

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
        await tx.unsafe(`truncate ${names.join(', ')} cascade`);
        await tx.unsafe(seed);
      });
      return;
    } catch (error) {
      const deadlock = (error as { code?: string }).code === '40P01';
      if (!deadlock || attempt === 3) throw error;
    }
  }
}

export async function score(playerId: number): Promise<number> {
  const [row] = await sql<{ score: string }[]>`
    select score from player where id = ${playerId}`;
  return Number(row.score);
}
