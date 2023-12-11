import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '@supabase/supabase-js';
import { map, take } from 'rxjs';

type RedirectUrl = string;

type RedirectFn = (user?: User) => true | RedirectUrl;

function createAuthGuardFromRedirectFunction(
  redirectFn: RedirectFn,
): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.user$.pipe(
      take(1),
      map(redirectFn),
      map((trueOrRedirect) =>
        trueOrRedirect === true ? true : router.parseUrl(trueOrRedirect),
      ),
    );
  };
}

export const redirectUnauthorizedToLoginPage =
  createAuthGuardFromRedirectFunction((user) => !!user || '/login');

export const redirectLoggedInToHomePage = createAuthGuardFromRedirectFunction(
  (user) => (!!user && '/') || true,
);
