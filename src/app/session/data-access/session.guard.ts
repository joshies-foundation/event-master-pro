import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../../shared/data-access/session.service';
import { map } from 'rxjs';

export function createSessionGuard(): CanActivateFn {
  return () => {
    const session$ = inject(SessionService).session$;
    const router = inject(Router);

    return session$.pipe(
      map((session) =>
        session ? router.createUrlTree(['/session/manage']) : true,
      ),
    );
  };
}
