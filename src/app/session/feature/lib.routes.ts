import { Routes } from '@angular/router';
import { createSessionGuard } from '../data-access/session.guard';

const sessionRoutes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./create-session-page/create-session-page.component'),
    canActivate: [createSessionGuard()],
  },
  {
    path: 'manage',
    loadComponent: () =>
      import('./manage-session-page/manage-session-page.component'),
  },
  {
    path: '**',
    pathMatch: 'full',
    // redirectTo: 'create',
    redirectTo: 'create',
  },
];

export default sessionRoutes;
