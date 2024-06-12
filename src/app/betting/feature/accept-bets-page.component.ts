import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from 'primeng/table';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BetStatus } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { BetService } from '../../shared/data-access/bet.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { BetModel } from '../../shared/util/supabase-types';

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

    @if (displayBets()?.length) {
      @if (displayBets(); as bets) {
        <p-table
          [value]="bets"
          [defaultSortOrder]="-1"
          sortField="score"
          [sortOrder]="-1"
          [scrollable]="true"
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
                    {{ bet.requesterName }} wagers:
                    {{ bet.requesterWager }}
                  </div>
                  <div>
                    {{ userNameAndScore() }} wagers:
                    {{ bet.yourWager }}
                  </div>
                  <div>{{ bet.description }}</div>
                </div>
              </td>
              <!-- Accept/Reject Buttons -->
              <td>
                <div
                  class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
                >
                  <p-button
                    label="Accept Bet"
                    severity="success"
                    icon="pi pi-check"
                    styleClass="w-full"
                    (onClick)="acceptBet(bet.id)"
                    [disabled]="
                      bet.yourWager > (userPlayer()?.score ?? 0) ||
                      bet.requesterWager > (bet.requesterScore ?? 0)
                    "
                    [loading]="submitting()"
                  />
                  <p-button
                    label="Reject Bet"
                    severity="danger"
                    icon="pi pi-times"
                    styleClass="w-full"
                    (onClick)="rejectBet(bet.id)"
                    [loading]="submitting()"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    } @else {
      <p class="text-500 font-italic text-center mt-5">No pending bets</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlaceBetChoosePlayerPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly userPlayer = this.playerService.userPlayer;
  readonly bets = this.betService.bets;

  readonly submitting = signal(false);

  private readonly betsAwaitingUser = computed(() => {
    return this.bets()?.filter(
      (bet) =>
        bet.opponent_player_id === this.userPlayer()?.player_id &&
        bet.status === BetStatus.PendingAcceptance,
    );
  });

  readonly displayBets = computed(() =>
    this.betsAwaitingUser()?.map((bet) => {
      const players = this.playerService.players();
      const requester = players?.filter(
        (player) => player.player_id === bet.requester_player_id,
      )[0];
      return {
        requesterName:
          (requester?.display_name ?? 'Requester') +
          ' (' +
          requester?.score +
          ' points)',
        requesterScore: requester?.score,
        requesterWager: bet.requester_wager,
        yourWager: bet.opponent_wager,
        description: bet.description,
        id: bet.id,
      };
    }),
  );

  readonly userNameAndScore = computed(() => {
    const userPlayer = this.userPlayer();
    return (
      (userPlayer?.display_name ?? 'Player') +
      ' (' +
      userPlayer?.score +
      ' points)'
    );
  });

  acceptBet(betId: BetModel['id']) {
    confirmBackendAction({
      action: async () => this.betService.acceptBet(betId),
      confirmationMessageText: 'Are you sure you want to accept this bet?',
      successMessageText: 'Bet accepted',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  rejectBet(betId: BetModel['id']) {
    confirmBackendAction({
      action: async () => this.betService.rejectBet(betId),
      confirmationMessageText: 'Are you sure you want to reject this bet?',
      successMessageText: 'Bet rejected',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }
}
