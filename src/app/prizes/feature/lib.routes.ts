import { Routes } from '@angular/router';

const prizesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./prizes-page.component'),
    data: { pageAnimationLayer: 0 },
  },
];
export default prizesRoutes;
