import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { slidePages } from '../../../route-animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'joshies-analytics-tab',
  standalone: true,
  imports: [PageHeaderComponent, TabMenuModule],
  templateUrl: './analytics-tab.component.html',
  animations: [slidePages],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsTabComponent {
  readonly tabs: MenuItem[] = [
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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
