import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { slidePages } from '../../route-animations';
import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'joshies-analytics-tab',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Analytics" />

    <!-- This Session -->
    <joshies-card headerText="This Session" [links]="thisSessionLinks" />

    <!-- Previous Session -->
    <joshies-card
      headerText="Previous Sessions"
      [links]="previousSessionsLinks"
    />
  `,
  animations: [slidePages],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsTabComponent {
  readonly thisSessionLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-list bg-green-500',
      text: 'Point Transactions',
      subtext: "Every time you've gained or lost points",
      routerLink: './transactions',
    },
    {
      iconClass: 'pi pi-trophy bg-yellow-500',
      text: 'Current Rankings',
      routerLink: './current-rankings',
    },
  ];

  readonly previousSessionsLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-trophy bg-orange-500',
      text: 'Previous Session Rankings',
      routerLink: './previous-rankings',
    },
    {
      iconClass: 'pi pi-table bg-purple-500',
      text: 'Lifetime Score Statistics',
      routerLink: './lifetime-stats',
    },
  ];
}
