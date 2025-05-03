import { Routes } from '@angular/router';
import {
  redirectLoggedInToHomePage,
  redirectUnauthorizedToLoginPage,
} from '../data-access/auth.guard';

const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login-page.component'),
    canActivate: [redirectLoggedInToHomePage],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password-page.component'),
    canActivate: [redirectUnauthorizedToLoginPage],
  },
  {
    path: 'confirm',
    loadComponent: () => import('./confirm-page.component'),
  },
];

export default authRoutes;
