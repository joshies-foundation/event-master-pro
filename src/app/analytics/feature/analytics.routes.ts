import { Routes } from '@angular/router';
import { lifetimeStatsResolver } from '../data-access/lifetime-stats.resolver';
import { previousSessionsResolver } from '../data-access/previous-sessions.resolver';
import { playerRoundScoresResolver } from '../data-access/player-round-scores.resolver';
import { rollHistoryResolver } from '../data-access/roll-history.resolver';
import { spaceStatsResolver } from '../data-access/space-stats.resolver';
import { playerDuelStatsResolver } from '../data-access/player-duel-stats.resolver';
import { duelHistoryResolver } from '../data-access/duel-history.resolver';

const analyticsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./analytics-tab.component'),
    resolve: {
      playerRoundScoresResponse: playerRoundScoresResolver,
    },
    data: { pageAnimationLayer: 0 },
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'current-rankings',
    loadComponent: () => import('./current-rankings-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'previous-rankings',
    loadComponent: () => import('./previous-rankings-page.component'),
    resolve: {
      analyticsPreviousResolvedData: previousSessionsResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'lifetime-stats',
    loadComponent: () => import('./lifetime-stats-page.component'),
    resolve: {
      lifetimeResultsQueryResult: lifetimeStatsResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'roll-history',
    loadComponent: () => import('./roll-history-page.component'),
    resolve: {
      rollHistoryQueryResult: rollHistoryResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-stats',
    loadComponent: () => import('./space-stats-page.component'),
    resolve: {
      spaceStatsQueryResult: spaceStatsResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'duel-history',
    loadComponent: () => import('./duel-history-page.component'),
    resolve: {
      duelHistoryQueryResult: duelHistoryResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'player-duel-stats',
    loadComponent: () => import('./player-duel-stats-page.component'),
    resolve: {
      playerDuelStatsQueryResult: playerDuelStatsResolver,
    },
    data: { pageAnimationLayer: 1 },
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default analyticsRoutes;
