import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from 'primeng/table';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { BetService } from '../../shared/data-access/bet.service';

@Component({
  selector: 'joshies-place-bet-choose-player-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    ButtonModule,
    RouterLink,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Accept Bets" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (displayBets(); as bets) {
      <p-table
        [value]="bets"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 60%;"></th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="bets"
          let-bet
        >
          <tr>
            <!-- Bet Terms -->
            <td>
              <div class="flex flex-column gap-2 -py-2">
                <div>
                  {{ bet.requesterName ?? 'Requester' }} Wagers:
                  {{ bet.requesterWager }}
                </div>
                <div>
                  {{ userPlayer()?.display_name ?? 'Player' }} Wagers:
                  {{ bet.yourWager }}
                </div>
                <div>{{ bet.description }}</div>
              </div>
            </td>
            <!-- Accept/Reject Buttons -->
            <td
              class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
            >
              <p-button
                label="Accept Bet"
                icon="pi pi-check"
                styleClass="w-full"
                (onClick)="acceptBet(bet.id)"
              />
              <p-button
                label="Reject Bet"
                icon="pi pi-times"
                styleClass="w-full"
                (onClick)="rejectBet(bet.id)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlaceBetChoosePlayerPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly userPlayer = this.playerService.userPlayer;
  readonly bets = this.betService.bets;

  private readonly betsAwaitingUser = computed(() => {
    return this.bets()?.filter(
      (bet) =>
        bet.opponent_player_id === this.userPlayer()?.player_id &&
        bet.status === 'pending_acceptance',
    );
  });

  readonly displayBets = computed(() =>
    this.betsAwaitingUser()?.map((bet) => {
      const players = this.playerService.players();
      const requester = players?.filter(
        (player) => player.player_id === bet.requester_player_id,
      )[0];
      return {
        requesterName: requester?.display_name,
        requesterWager: bet.requester_wager,
        yourWager: bet.opponent_wager,
        description: bet.description,
        id: bet.id,
      };
    }),
  );

  acceptBet(id: number) {
    this.betService.acceptBet(id);
  }

  rejectBet(id: number) {
    this.betService.rejectBet(id);
  }
}
