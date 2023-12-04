import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '@supabase/supabase-js';
import { map, take } from 'rxjs';

type Redirect = string | unknown[];

type CanFunction = (user: User | undefined) => true | Redirect;

type Guard = {
  canActivate: CanActivateFn[];
  data: { canFn: CanFunction };
};

const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const canFn = route.data['canFn'] as CanFunction;

  return auth.user$.pipe(
    take(1),
    map(canFn),
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

export const redirectUnauthorizedToLoginPage: Guard = {
  canActivate: [authGuard],
  data: {
    canFn: (user: User | undefined) => !!user || '/login',
  },
};

export const redirectLoggedInToHomePage: Guard = {
  canActivate: [authGuard],
  data: {
    canFn: (user: User | undefined) => (!!user && '/') || true,
  },
};
