import { SupabaseConnection } from '../../custom-providers';

/** Publishable key every local Supabase project shares. */
const LOCAL_PUBLISHABLE_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

/** The dev server proxies the Supabase API paths to this checkout's local project; see src/proxy.local-supabase.mjs. */
export function resolveSupabaseConnection(): SupabaseConnection {
  return {
    url: window.location.origin,
    publishableKey: LOCAL_PUBLISHABLE_KEY,
  };
}
