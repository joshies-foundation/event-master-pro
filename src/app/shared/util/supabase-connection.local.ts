import { SupabaseConnection } from '../../custom-providers';

const LOCAL_API_PORT = 55321;

/** Well-known key every local Supabase stack is seeded with. */
const LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export function resolveSupabaseConnection(): SupabaseConnection {
  return {
    url: `http://${window.location.hostname}:${LOCAL_API_PORT}`,
    anonKey: LOCAL_ANON_KEY,
  };
}
