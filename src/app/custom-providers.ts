import { Provider } from '@angular/core';
import { environment } from 'environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function provideSupabase(): Provider {
  return {
    provide: SupabaseClient,
    useValue: createClient(environment.supabase.url, environment.supabase.key),
  };
}
