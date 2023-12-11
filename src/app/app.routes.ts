import { Routes } from '@angular/router';
import {
  redirectLoggedInToHomePage,
  redirectUnauthorizedToLoginPage,
} from './auth/data-access/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/feature/login-page/login-page.component'),
    canActivate: [redirectLoggedInToHomePage],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/feature/logged-in-app-shell.component'),
    canActivate: [redirectUnauthorizedToLoginPage],
    canActivateChild: [redirectUnauthorizedToLoginPage],
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./profile/feature/lib.routes'),
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
    ],
  },
];
