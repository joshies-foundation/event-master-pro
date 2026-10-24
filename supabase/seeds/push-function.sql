-- The key is the secret API key that every local Supabase project shares. The URL
-- depends on the project's API port, so `npm run start-supabase` and
-- `npm run reset-supabase` write push_function_url after the seed runs.
select vault.create_secret('sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz', 'push_function_key');
