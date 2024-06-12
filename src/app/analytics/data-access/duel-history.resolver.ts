import { ResolveFn } from '@angular/router';
import { DuelHistoryRecord } from '../../shared/util/supabase-types';
import { inject } from '@angular/core';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { switchMap } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { PostgrestResponse } from '@supabase/supabase-js';

export const duelHistoryResolver: ResolveFn<
  PostgrestResponse<DuelHistoryRecord>
> = () => {
  const gameStateService = inject(GameStateService);
  const analyticsService = inject(AnalyticsService);

  return gameStateService.sessionId$.pipe(
    switchMap((sessionId) =>
      analyticsService.getDuelHistoryForSession(sessionId),
    ),
  );
};
