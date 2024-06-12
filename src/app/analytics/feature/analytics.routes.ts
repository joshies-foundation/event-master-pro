import { Routes } from '@angular/router';
import { lifetimeStatsResolver } from '../data-access/lifetime-stats.resolver';
import { previousSessionsResolver } from '../data-access/previous-sessions.resolver';
import { playerRoundScoresResolver } from '../data-access/player-round-scores.resolver';
import { rollHistoryResolver } from '../data-access/roll-history.resolver';

const analyticsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./analytics-tab.component'),
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
    path: 'points-over-time',
    loadComponent: () => import('./compare-points-over-time-page.component'),
    resolve: {
      playerRoundScoresResponse: playerRoundScoresResolver,
    },
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
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default analyticsRoutes;
