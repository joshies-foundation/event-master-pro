-- The key is the secret API key that every local Supabase stack shares.
select vault.create_secret('http://kong:8000/functions/v1/push', 'push_function_url');
select vault.create_secret('sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz', 'push_function_key');
