import { Routes } from '@angular/router';

const gmToolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./gm-tools-page.component'),
    data: { pageAnimationLayer: 0 },
  },
  {
    path: 'end-round',
    loadComponent: () => import('./end-round-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-round/review',
    loadComponent: () => import('./review-score-changes-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'override-points',
    loadComponent: () =>
      import('./override-points-choose-player-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'override-points/:playerId',
    loadComponent: () => import('./override-points-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'disable-players',
    loadComponent: () => import('./disable-players-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'change-gm',
    loadComponent: () => import('./change-gm-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'create-session',
    loadComponent: () => import('./create-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-session',
    loadComponent: () => import('./end-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
];

export default gmToolsRoutes;
