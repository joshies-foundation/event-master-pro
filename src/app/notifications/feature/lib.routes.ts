import { Routes } from '@angular/router';

const notificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./notifications-page/notifications-page.component'),
  },
];

export default notificationsRoutes;
