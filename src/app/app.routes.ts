import { Routes } from '@angular/router';
import { redirectUnauthorizedToLoginPage } from './auth/data-access/auth.guard';
import { canAccessGmTools } from './auth/data-access/auth.gm.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/feature/lib.routes'),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/feature/dashboard-page.component'),
    canActivate: [redirectUnauthorizedToLoginPage],
  },
  {
    path: 'dashboard/randomizer',
    loadComponent: () =>
      import('./dashboard/feature/randomizer-page.component'),
    canActivate: [redirectUnauthorizedToLoginPage],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/feature/logged-in-app-shell.component'),
    canActivate: [redirectUnauthorizedToLoginPage],
    canActivateChild: [redirectUnauthorizedToLoginPage],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/feature/lib.routes'),
      },
      {
        path: 'rules',
        loadChildren: () => import('./rules/feature/lib.routes'),
      },
      {
        path: 'betting',
        loadChildren: () => import('./betting/feature/lib.routes'),
      },
      {
        path: 'gm-tools',
        loadChildren: () => import('./gm-tools/feature/lib.routes'),
        canActivate: [canAccessGmTools],
      },
      {
        path: 'analytics',
        loadChildren: () => import('./analytics/feature/analytics.routes'),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/feature/lib.routes'),
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];
