import { Routes } from '@angular/router';

const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile-page/profile-page.component'),
  },
];

export default profileRoutes;
