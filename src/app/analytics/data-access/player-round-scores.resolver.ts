import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AnalyticsService } from './analytics.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { GetPlayerRoundScoreFunctionReturnType } from '../../shared/util/supabase-types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { switchMap } from 'rxjs';

export const playerRoundScoresResolver: ResolveFn<
  PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType>
> = () => {
  const gameStateService = inject(GameStateService);
  const analyticsService = inject(AnalyticsService);

  return gameStateService.sessionId$.pipe(
    switchMap((sessionId) =>
      analyticsService.getPlayerRoundScoresFromSession(sessionId),
    ),
  );
};
