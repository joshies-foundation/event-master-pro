import { SupabaseConnection } from '../../custom-providers';

const LOCAL_API_PORT = 55321;

/** Publishable key every local Supabase stack shares. */
const LOCAL_PUBLISHABLE_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

export function resolveSupabaseConnection(): SupabaseConnection {
  return {
    url: `http://${window.location.hostname}:${LOCAL_API_PORT}`,
    publishableKey: LOCAL_PUBLISHABLE_KEY,
  };
}
