import { Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function provideSupabase({
  supabaseProjectId,
  supabaseAnonKey,
}: {
  supabaseProjectId: string;
  supabaseAnonKey: string;
}): Provider {
  return {
    provide: SupabaseClient,
    useValue: createClient(
      `https://${supabaseProjectId}.supabase.co`,
      supabaseAnonKey,
    ),
  };
}
