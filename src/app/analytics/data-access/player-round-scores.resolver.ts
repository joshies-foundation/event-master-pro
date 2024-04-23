import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { whenNotNull } from '../../shared/util/rxjs-helpers';
import { AnalyticsService } from './analytics.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { GetPlayerRoundScoreFunctionReturnType } from '../../shared/util/supabase-types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export const playerRoundScoresResolver: ResolveFn<
  PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType> | null
> = () => {
  const gameStateService = inject(GameStateService);
  const analyticsService = inject(AnalyticsService);

  return gameStateService.sessionId$.pipe(
    whenNotNull((sessionId) =>
      analyticsService.getPlayerRoundScoresFromSession(sessionId),
    ),
  );
};
