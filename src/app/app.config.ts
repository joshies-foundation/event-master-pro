import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: SupabaseClient,
      useValue: createClient(
        environment.supabase.url,
        environment.supabase.key,
      ),
    },
  ],
};
