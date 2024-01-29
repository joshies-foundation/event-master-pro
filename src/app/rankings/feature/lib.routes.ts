import { Routes } from '@angular/router';

const rankingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./rankings-page/rankings-page.component'),
  },
];

export default rankingsRoutes;
