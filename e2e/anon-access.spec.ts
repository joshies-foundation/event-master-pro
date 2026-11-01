import { sql } from './support/db';
import { expect, test } from './support/fixtures';

// The publishable key ships in the app bundle, so anyone can read as `anon`.
// Default privileges give `anon` SELECT on every new table and view, which
// leaves RLS as the only barrier. A view needs `security_invoker = true`, or it
// reads its tables as its owner and skips RLS.
test('a signed-out caller reads no rows from any public table or view', async () => {
  const relations = await sql<{ name: string }[]>`
    select format('%I.%I', n.nspname, c.relname) as name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'v', 'm')
      and has_table_privilege('anon', c.oid, 'select')
    order by name`;
  expect(relations.length).toBeGreaterThan(0);

  const readable = await sql.begin(async (tx) => {
    await tx.unsafe('set local role anon');
    const found: string[] = [];
    for (const { name } of relations) {
      const [row] = await tx.unsafe<{ count: string }[]>(
        `select count(*) from ${name}`,
      );
      if (Number(row.count) > 0) found.push(name);
    }
    return found;
  });

  expect(readable).toEqual([]);
});

// Counting rows can't catch a view that happens to be empty in the seed.
test('every public view applies the RLS of its caller', async () => {
  const views = await sql<{ name: string }[]>`
    select c.relname as name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
      and not coalesce('security_invoker=true' = any(c.reloptions), false)
    order by name`;

  expect(views.map((view) => view.name)).toEqual([]);
});
