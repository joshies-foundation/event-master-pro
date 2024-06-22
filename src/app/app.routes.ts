import { Routes } from '@angular/router';
import {
  redirectLoggedInToHomePage,
  redirectUnauthorizedToLoginPage,
} from './auth/data-access/auth.guard';
import { canAccessGmTools } from './auth/data-access/auth.gm.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/feature/login-page/login-page.component'),
    canActivate: [redirectLoggedInToHomePage],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/feature/dashboard-page.component'),
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
        path: 'notifications',
        loadChildren: () => import('./notifications/feature/lib.routes'),
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
