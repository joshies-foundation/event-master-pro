import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AnalyticsService, IdAndName } from './analytics.service';
import { PlayerWithUserInfo } from '../../shared/data-access/player.service';
import { iif, map, of, switchMap } from 'rxjs';

export interface AnalyticsPreviousResolvedData {
  previousSessions: IdAndName[] | null;
  mostRecentSessionId: number | null;
  mostRecentSessionPlayers: PlayerWithUserInfo[] | null;
}

export const previousSessionsResolver: ResolveFn<
  AnalyticsPreviousResolvedData
> = () => {
  const analyticsService = inject(AnalyticsService);

  return analyticsService.getAllPreviousSessions().pipe(
    switchMap((previousSessions) => {
      const mostRecentSessionId = previousSessions[0]?.id ?? null;

      return iif(
        () => mostRecentSessionId === null,
        of([]),
        analyticsService.getAllScoresFromSession(mostRecentSessionId),
      ).pipe(
        map(
          (mostRecentSessionPlayers): AnalyticsPreviousResolvedData => ({
            previousSessions,
            mostRecentSessionId,
            mostRecentSessionPlayers,
          }),
        ),
      );
    }),
  );
};
