import { Routes } from '@angular/router';
import { lifetimeStatsResolver } from '../data-access/lifetime-stats.resolver';
import { previousSessionsResolver } from '../data-access/previous-sessions.resolver';

const analyticsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./analytics-tab.component'),
    children: [
      {
        path: 'current',
        loadComponent: () =>
          import('./analytics-current-page/analytics-current-page.component'),
        data: { pageTabIndex: 0 },
      },
      {
        path: 'previous',
        loadComponent: () =>
          import('./analytics-previous-page/analytics-previous-page.component'),
        resolve: {
          analyticsPreviousResolvedData: previousSessionsResolver,
        },
        data: { pageTabIndex: 1 },
      },
      {
        path: 'lifetime',
        loadComponent: () =>
          import('./analytics-lifetime-page/analytics-lifetime-page.component'),
        resolve: {
          lifetimeResultsQueryResult: lifetimeStatsResolver,
        },
        data: { pageTabIndex: 2 },
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'current',
      },
    ],
  },
];

export default analyticsRoutes;
