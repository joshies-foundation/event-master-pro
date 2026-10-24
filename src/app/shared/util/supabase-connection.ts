import { SupabaseConnection } from '../../custom-providers';

/** Every `ng build`. `ng serve` swaps in supabase-connection.local.ts; see the `local-supabase` configuration in angular.json. */
export function resolveSupabaseConnection(): SupabaseConnection {
  return {
    url: `https://${import.meta.env.NG_APP_SUPABASE_PROJECT_ID}.supabase.co`,
    anonKey: import.meta.env.NG_APP_SUPABASE_ANON_KEY,
  };
}
