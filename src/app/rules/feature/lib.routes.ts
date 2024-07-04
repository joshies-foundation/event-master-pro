import { Routes } from '@angular/router';

const rulesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./rules-page/rules-page.component'),
    data: { pageAnimationLayer: 0 },
  },
];

export default rulesRoutes;
