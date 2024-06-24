import { CanActivateFn, Router } from '@angular/router';
import { PlayerService } from '../../shared/data-access/player.service';
import { inject } from '@angular/core';

// Redirects non-gms to ~/home. If they're not logged in, they'll then be redirected to ~/login
export const canAccessGmTools: CanActivateFn = () => {
  const playerService = inject(PlayerService);
  const router = inject(Router);
  const isGm = playerService.getIsGm();
  if (!isGm) {
    alert('You are not authorized to view this page.');
    return router.parseUrl('/home');
  }
  return true;
};
