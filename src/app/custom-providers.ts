import { Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConnection {
  url: string;
  anonKey: string;
}

export function provideSupabase({
  url,
  anonKey,
}: SupabaseConnection): Provider {
  return {
    provide: SupabaseClient,
    useValue: createClient(url, anonKey),
  };
}
