import { Routes } from '@angular/router';

const bettingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./betting-page.component'),
    data: { pageAnimationLayer: 0 },
  },

  {
    path: 'place-bet',
    loadComponent: () => import('./place-bet-choose-player-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  {
    path: 'place-bet/:opponentId',
    loadComponent: () => import('./place-bet-page.component'),
    data: { pageAnimationLayer: 2 },
  },
];
export default bettingRoutes;
