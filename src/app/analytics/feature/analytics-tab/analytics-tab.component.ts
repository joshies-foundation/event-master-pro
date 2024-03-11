import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'joshies-analytics-tab',
  standalone: true,
  imports: [TabMenuModule],
  templateUrl: './analytics-tab.component.html',
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
}
