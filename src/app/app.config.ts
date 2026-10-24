import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { provideServiceWorker } from '@angular/service-worker';
import { provideSupabase } from './custom-providers';
import { resolveSupabaseConnection } from './shared/util/supabase-connection';
import { provideHttpClient } from '@angular/common/http';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { NumberSignColorClassPipe } from './shared/ui/number-sign-color-class.pipe';
import { NumberWithSignPipe } from './shared/ui/number-with-sign.pipe';
import { NumberSignPipe } from './shared/ui/number-sign.pipe';
import { LoseOrGainPipe } from './gm-tools/ui/lose-or-gain.pipe';
import { provideOptimus } from '@openng/optimus-ui/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { preset } from './optimus-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),

    // router
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),

    // supabase
    provideSupabase(resolveSupabaseConnection()),

    // animations
    provideAnimationsAsync(),

    provideOptimus({
      ripple: true,
      theme: {
        preset,
        options: {
          cssLayer: {
            name: 'optimus',
            order: 'theme, base, optimus',
          },
        },
      },
    }),
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
