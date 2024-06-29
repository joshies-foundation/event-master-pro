import { CanActivateFn, Router } from '@angular/router';
import { PlayerService } from '../../shared/data-access/player.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

// Redirects non-gms to ~/home. If they're not logged in, they'll then be redirected to ~/login
export const canAccessGmTools: CanActivateFn = () => {
  const playerService = inject(PlayerService);
  const router = inject(Router);
  return playerService.userIsGameMaster$.pipe(
    map((userIsGm) => {
      if (!userIsGm) {
        alert('You are not authorized to view this page.');
        return router.parseUrl('/home');
      }
      return true;
    }),
  );
};
