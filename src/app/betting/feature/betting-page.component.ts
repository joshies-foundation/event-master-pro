import { PlayerService } from '../../shared/data-access/player.service';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

@Component({
  selector: 'joshies-betting-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent],
  template: `
    <joshies-page-header headerText="Betting Tools" />

    <joshies-card headerText="Placing Bets" [links]="placingBetsLinks()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BettingPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly canPlaceBets = computed(() => {
    return this.playerService.userPlayer()?.can_place_bets ?? false;
  });

  readonly placingBetsLinks = computed(() => [
    {
      text: this.canPlaceBets() ? 'Place a bet' : 'Place a bet (Locked)',
      iconClass: this.canPlaceBets()
        ? 'pi pi-plus bg-purple-500'
        : 'pi pi-plu bg-gray-500',
      routerLink: this.canPlaceBets() ? './place-bet' : '',
    },
    {
      text: 'Accept bets',
      iconClass: 'pi pi-check bg-green-500',
      routerLink: './accept-bets',
    },
    {
      text: 'Review your open bets',
      iconClass: 'pi pi-list bg-orange-500',
      routerLink: './review-user-bets',
    },
  ]);
}
