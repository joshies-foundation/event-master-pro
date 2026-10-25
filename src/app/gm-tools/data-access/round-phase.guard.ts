import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { RoundPhase } from '../../shared/util/supabase-helpers';

export function roundPhaseIs(roundPhase: RoundPhase): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const currentRoundPhase = await inject(GameStateService).fetchRoundPhase();
    return currentRoundPhase === roundPhase || router.parseUrl('/gm-tools');
  };
}
