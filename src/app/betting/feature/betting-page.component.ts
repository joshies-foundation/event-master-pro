import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joshies-betting-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent],
  template: `
    <joshies-page-header headerText="Betting Tools" />

    <joshies-card headerText="Placing Bets" [links]="placingBetsLinks" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BettingPageComponent {
  readonly placingBetsLinks: CardLinkModel[] = [
    {
      text: 'Place a bet',
      iconClass: 'pi pi-plus bg-purple-500',
      routerLink: './place-bet',
    },
    {
      text: 'Accept bets',
      iconClass: 'pi pi-check bg-green-500',
      routerLink: './accept-bets',
    },
  ];
}
