import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '@supabase/supabase-js';
import { map, take } from 'rxjs';

type RedirectUrl = string;

type RedirectFunction = (user?: User) => true | RedirectUrl;

function createAuthGuardFromRedirectFunction(
  redirectFn: RedirectFunction,
): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.user$.pipe(
      take(1),
      map(redirectFn),
      map((can) => {
        if (can === true) {
          return can;
        } else if (Array.isArray(can)) {
          return router.createUrlTree(can);
        } else {
          return router.parseUrl(can);
        }
      }),
    );
  };
}

export const redirectUnauthorizedToLoginPage =
  createAuthGuardFromRedirectFunction((user) => !!user || '/login');

export const redirectLoggedInToHomePage = createAuthGuardFromRedirectFunction(
  (user) => (!!user && '/') || true,
);
