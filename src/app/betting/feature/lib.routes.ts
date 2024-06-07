import { Routes } from '@angular/router';

const bettingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./betting-page.component'),
    data: { pageAnimationLayer: 0 },
  },

  {
    path: 'place-bet',
    loadComponent: () => import('./place-bet-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  {
    path: 'accept-bets',
    loadComponent: () => import('./accept-bets-page.component'),
    data: { pageAnimationLayer: 1 },
  },
];
export default bettingRoutes;
