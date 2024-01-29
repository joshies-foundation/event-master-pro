import { Routes } from '@angular/router';

const rulesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./rules-page/rules-page.component'),
  },
];

export default rulesRoutes;
