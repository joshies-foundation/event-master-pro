# EventMaster Pro

README.md "Getting Started" covers setup. CONTEXT.md defines the domain terms.

## Supabase

- Develop and verify against the local Supabase project of your checkout. The hosted projects are TEST (`jdwvtjrhfsciqttiueud`) and PROD (`bbptbpmmfformxfzkdgl`). Ask the user before you run SQL, apply a migration, or deploy a function to either one.
- Each checkout and git branch has its own local project, with its own database and ports. In a new worktree, run `npm run start-supabase` there to get one. No other worktree reads or resets it. Read its URLs from `npx supabase status </dev/null`, and never assume a port. `npx supabase stack list </dev/null` lists every project on this computer. When you are done with a worktree, run `npx supabase stack destroy --yes </dev/null` in it to delete its project and data.
- Use `npm run start-supabase` and `npm run reset-supabase`, not `supabase start` and `supabase db reset`. The scripts also write the Vault secret `push_function_url`, which depends on the project's API port.
- Run the CLI as `npx supabase <command> </dev/null`. Commands that prompt, such as `migration new`, wait forever on an open stdin.
- Every worktree used to share one stack with project id `joshies` on ports 55320 to 55329. Once nothing uses it, a human can remove it with `npx supabase@2.109.1 stop --project-id joshies </dev/null`. Never stop it yourself.
- Change the schema only through a migration in `supabase/migrations`, written with `npm run create-migration <name>`. Then run `npm run reset-supabase` and `npm run generate-db-types`.
- `supabase/seed.sql` is output from `npm run save-seed`. Change the data in the local database and run `save-seed` again instead of editing the file by hand. Local-only setup that is not table data, such as Vault secrets, goes in `supabase/seeds/`.
- The `bet_push_notifications` trigger reads the `push` function URL and a secret API key (`sb_secret_...`) from the Vault secrets `push_function_url` and `push_function_key`. Never write a key into a migration. A hosted project needs both secrets before migration `20261024015414` reaches it. Without them, bet notifications stop and the database logs only a warning:

  ```sql
  select vault.create_secret('https://<project-ref>.supabase.co/functions/v1/push', 'push_function_url');
  select vault.create_secret('<secret API key>', 'push_function_key');
  ```

- `push` runs with `verify_jwt = false` and checks callers itself. The bet webhook route needs a secret API key, and the routes the app calls need a signed-in user's token. The function talks to the database with the project's secret key named `default`, so a hosted project needs that key before you deploy `push`.
- `SUPABASE_ACCESS_TOKEN=... supabase/scripts/schema-drift.sh <project-ref>` compares a hosted schema with the local one through a read-only endpoint.

## Verifying UI changes

Use the project `verify` skill in `.claude/skills/verify/`. It drives the app in a phone browser against your checkout's local project, and `emp-verify reset` restores the seeded data.
