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
    path: 'auth/confirm',
    loadComponent: () =>
      import('./auth/feature/confirm-page/confirm-page.component'),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/feature/dashboard-page.component'),
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
        path: 'auth/reset-password',
        loadComponent: () =>
          import(
            './auth/feature/reset-password-page/reset-password-page.component'
          ),
        canActivate: [redirectUnauthorizedToLoginPage],
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];
