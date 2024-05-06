import { Routes } from '@angular/router';
import { editGameboardSpaceTypeResolver } from '../data-access/edit-gameboard-space-type.resolver';

const gmToolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./gm-tools-page.component'),
    data: { pageAnimationLayer: 0 },
  },
  // round
  {
    path: 'end-round',
    loadComponent: () => import('./end-round-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-round/review',
    loadComponent: () => import('./review-score-changes-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  // players
  {
    path: 'override-points',
    loadComponent: () =>
      import('./override-points-choose-player-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'override-points/:playerId',
    loadComponent: () => import('./override-points-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'edit-profiles',
    loadComponent: () => import('./edit-player-profiles-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'edit-permissions',
    loadComponent: () => import('./edit-player-permissions-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'change-gm',
    loadComponent: () => import('./change-gm-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  // session
  {
    path: 'create-session',
    loadComponent: () => import('./create-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'start-session-early',
    loadComponent: () => import('./start-session-early-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-session',
    loadComponent: () => import('./end-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-types',
    loadComponent: () =>
      import('./manage-gameboard-space-types-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-types/new',
    loadComponent: () => import('./new-gameboard-space-type-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'space-types/:gameboardSpaceId',
    loadComponent: () => import('./edit-gameboard-space-type-page.component'),
    data: { pageAnimationLayer: 2 },
    resolve: { originalGameboardSpace: editGameboardSpaceTypeResolver },
  },
  {
    path: 'space-entry',
    loadComponent: () => import('./gameboard-space-entry-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-entry/review',
    loadComponent: () =>
      import('./review-gameboard-space-entry-page.component'),
    data: { pageAnimationLayer: 2 },
  },
];

export default gmToolsRoutes;
