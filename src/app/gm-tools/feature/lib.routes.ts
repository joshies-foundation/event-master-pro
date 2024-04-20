import { Routes } from '@angular/router';

const gmToolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./gm-tools-page.component'),
    data: { animation: 0 },
  },
  {
    path: 'finish-round',
    loadComponent: () => import('./finish-round-page.component'),
    data: { animation: 1 },
  },
  {
    path: 'disable-players',
    loadComponent: () => import('./disable-players-page.component'),
    data: { animation: 1 },
  },
  {
    path: 'end-session',
    loadComponent: () => import('./end-session-page.component'),
    data: { animation: 1 },
  },
];

export default gmToolsRoutes;
