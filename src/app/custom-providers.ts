import { Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConnection {
  url: string;
  publishableKey: string;
}

export function provideSupabase({
  url,
  publishableKey,
}: SupabaseConnection): Provider {
  return {
    provide: SupabaseClient,
    useValue: createClient(url, publishableKey),
  };
}
