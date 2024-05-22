import { Routes } from '@angular/router';

const homeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home-page/home-page.component'),
    data: { pageAnimationLayer: 0 },
  },
];

export default homeRoutes;
