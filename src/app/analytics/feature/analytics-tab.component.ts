import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  viewChild,
} from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { slidePages } from '../../route-animations';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { preventGlitchySwipeBackAnimation } from '../../shared/util/animation-helpers';

@Component({
  selector: 'joshies-analytics-tab',
  standalone: true,
  imports: [PageHeaderComponent, TabMenuModule],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Analytics" />

    <!-- Tabs -->
    <p-tabMenu [model]="tabs" styleClass="mb-3" />

    <!-- Child Pages -->
    <div class="relative" [@routeAnimations]="pageTabIndex()">
      <router-outlet />
    </div>
  `,
  animations: [slidePages],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsTabComponent {
  private readonly router = inject(Router);
  private readonly routerOutlet = viewChild.required(RouterOutlet);

  readonly tabs: MenuItem[] = [
    {
      label: 'Transactions',
      routerLink: '/analytics/transactions',
    },
    {
      label: 'Current',
      routerLink: '/analytics/current',
    },
    {
      label: 'Previous',
      routerLink: '/analytics/previous',
    },
    {
      label: 'Lifetime',
      routerLink: '/analytics/lifetime',
    },
  ];

  readonly pageTabIndex: Signal<number | undefined> = toSignal(
    preventGlitchySwipeBackAnimation(
      this.router,
      this.routerOutlet,
      'pageTabIndex',
    ),
  );
}
