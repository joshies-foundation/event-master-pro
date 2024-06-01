import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AnalyticsService, IdAndName } from './analytics.service';
import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { iif, map, of, switchMap } from 'rxjs';
import { addRankingInfoToPlayers } from '../../shared/util/ranking-helpers';

export interface AnalyticsPreviousResolvedData {
  previousSessions: IdAndName[] | null;
  mostRecentSessionId: number | null;
  mostRecentSessionPlayers: PlayerWithUserAndRankInfo[] | null;
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
            mostRecentSessionPlayers: addRankingInfoToPlayers(
              mostRecentSessionPlayers,
            ),
          }),
        ),
      );
    }),
  );
};
