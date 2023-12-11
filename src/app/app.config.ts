import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'environment';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    MessageService,
    importProvidersFrom(BrowserAnimationsModule),
  ],
};
