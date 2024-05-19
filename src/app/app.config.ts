import { ApplicationConfig, isDevMode } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { provideSupabase } from './custom-providers';
import { provideHttpClient } from '@angular/common/http';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { NumberSignColorClassPipe } from './shared/ui/number-sign-color-class.pipe';
import { NumberWithSignPipe } from './shared/ui/number-with-sign.pipe';
import { NumberSignPipe } from './shared/ui/number-sign.pipe';
import { LoseOrGainPipe } from './gm-tools/ui/lose-or-gain.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    // router
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),

    // supabase
    provideSupabase(),

    // animations
    provideAnimations(),

    // PrimeNG services
    MessageService,
    ConfirmationService,

    // service worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // http client
    provideHttpClient(),

    // other
    DecimalPipe,
    NumberSignPipe,
    NumberSignColorClassPipe,
    NumberWithSignPipe,
    LoseOrGainPipe,
    TitleCasePipe,
  ],
};
