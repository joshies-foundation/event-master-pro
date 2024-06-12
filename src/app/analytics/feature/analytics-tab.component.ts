import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PlayerService } from '../../shared/data-access/player.service';

@Component({
  selector: 'joshies-analytics-tab',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Analytics" />

    <!-- Points -->
    <joshies-card headerText="Points" [links]="pointsLinks()" />

    <!-- Gameboard -->
    <joshies-card headerText="Gameboard" [links]="gameboardLinks" />

    <!-- Previous Session -->
    <joshies-card
      headerText="Previous Sessions"
      [links]="previousSessionsLinks"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsTabComponent {
  private readonly playerService = inject(PlayerService);

  readonly pointsLinks: Signal<CardLinkModel[]> = computed(() => [
    {
      iconClass: 'pi pi-chart-line bg-blue-500',
      text: 'Compare Points Over Time',
      routerLink: './points-over-time',
    },
    ...(this.playerService.userPlayer()
      ? [
          {
            iconClass: 'pi pi-list bg-green-500',
            text: 'Transactions',
            subtext: "Every time you've gained or lost points",
            routerLink: './transactions',
          },
        ]
      : []),
  ]);

  readonly gameboardLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-history bg-orange-500',
      text: 'Roll History',
      subtext: 'Distance traveled and spaces landed',
      routerLink: './roll-history',
    },
    {
      iconClass: 'pi ci-space-entry bg-gray-500',
      text: 'Space Stats',
      subtext: 'Times each player landed on each space',
      routerLink: './space-stats',
    },
  ];

  readonly previousSessionsLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-trophy bg-yellow-500',
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
