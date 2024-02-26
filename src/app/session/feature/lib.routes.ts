import { Routes } from '@angular/router';

const sessionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./session-pages-wrapper/session-pages-wrapper.component'),
  },
];

export default sessionRoutes;
