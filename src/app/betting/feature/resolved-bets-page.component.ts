import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { BetService } from '../../shared/data-access/bet.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BetComponent } from '../../shared/ui/bet.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { CardComponent } from '../../shared/ui/card.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';

@Component({
  selector: 'joshies-resolved-bets-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    BetComponent,
    SkeletonModule,
    DividerModule,
    CardComponent,
  ],
  template: `
    <joshies-page-header
      headerText="Settled Bets"
      alwaysSmall
      class="mb-8 block"
    >
      <joshies-header-link
        text="Betting"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.userPlayerId) {
        @for (bet of vm.resolvedBets; track bet.id; let last = $last) {
          <joshies-card padded class="mb-2">
            <joshies-bet [bet]="bet" [userPlayerId]="vm.userPlayerId" />
          </joshies-card>

          @if (last) {
            <div class="h-24"></div>
          }
        }
      } @else {
        <p>Bruh, you're not even a player.</p>
      }
    } @else {
      <p-skeleton height="9.5rem" class="mt-8 mb-2" />
      <p-skeleton height="9.5rem" class="mb-2" />
      <p-skeleton height="9.5rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolvedBetsPageComponent {
  private readonly betService = inject(BetService);
  private readonly playerService = inject(PlayerService);

  private readonly resolvedBets = toSignal(this.betService.resolvedBets$);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      resolvedBets: this.resolvedBets(),
      userPlayerId: this.playerService.userPlayerId(),
    }),
  );
}
