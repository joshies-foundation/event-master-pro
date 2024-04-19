import { Routes } from '@angular/router';

const gmToolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./gm-tools-pages-wrapper/gm-tools-pages-wrapper.component'),
  },
];

export default gmToolsRoutes;
