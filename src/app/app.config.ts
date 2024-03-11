import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { provideSupabase } from './custom-providers';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // router
    provideRouter(routes, withComponentInputBinding()),

    // supabase
    provideSupabase(),

    // animations
    provideAnimations(),

    // PrimeNG services
    MessageService,

    // service worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // http client
    provideHttpClient(),

    // other
    ConfirmationService,
  ],
};
