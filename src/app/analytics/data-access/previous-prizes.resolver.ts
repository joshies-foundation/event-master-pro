import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { combineLatest, switchMap, take } from 'rxjs';
import { AnalyticsService, PastSessionPrizes } from './analytics.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { defined } from '../../shared/util/rxjs-helpers';

export const previousPrizesResolver: ResolveFn<PastSessionPrizes[]> = () => {
  const analyticsService = inject(AnalyticsService);
  const gameStateService = inject(GameStateService);
  const authService = inject(AuthService);

  return combineLatest({
    user: authService.user$.pipe(defined()),
    currentSessionId: gameStateService.sessionId$.pipe(defined()),
  }).pipe(
    take(1),
    switchMap(({ user, currentSessionId }) =>
      analyticsService.getUserPrizesFromPastSessions(user.id, currentSessionId),
    ),
  );
};
