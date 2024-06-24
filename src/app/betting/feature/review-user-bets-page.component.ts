import {
  ChangeDetectionStrategy,
  Component,
  Signal,
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
  selector: 'joshies-review-user-bets-page',
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
    <joshies-page-header headerText="Current Bets" alwaysSmall>
      <joshies-header-link
        text="Betting"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (displayBets()?.length) {
      @if (displayBets(); as bets) {
        <p class="mt-5">Review bets that are open or awaiting approval.</p>
        <p-table
          [value]="bets"
          [defaultSortOrder]="-1"
          sortField="score"
          [sortOrder]="-1"
          [scrollable]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 60%;">
                Bet Terms (Your score: {{ userPlayer()?.score }})
              </th>
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
                <div>
                  {{ generateTerms(bet) }}
                </div>
              </td>
              <!-- Status Buttons -->
              <td>
                <div
                  class="text-left flex gap-2 flex-column md:flex-row justify-content-end"
                >
                  @if (bet.status === BetStatus.Active) {
                    Open
                  } @else {
                    <p-button
                      label="Accept Bet"
                      severity="success"
                      icon="pi pi-check"
                      styleClass="w-full"
                      (onClick)="acceptBet(bet.id)"
                      [disabled]="
                        bet.opponentWager > (userPlayer()?.score ?? 0) ||
                        bet.requesterWager > bet.requesterScore
                      "
                      [loading]="submitting()"
                      [hidden]="!canAcceptReject(bet, userPlayer()?.player_id)"
                    />
                    <p-button
                      label="Reject Bet"
                      severity="danger"
                      icon="pi pi-times"
                      styleClass="w-full"
                      (onClick)="rejectBet(bet.id)"
                      [loading]="submitting()"
                      [hidden]="!canAcceptReject(bet, userPlayer()?.player_id)"
                    />
                    <p-button
                      label="Cancel Bet"
                      severity="danger"
                      icon="pi pi-times"
                      styleClass="w-full"
                      (onClick)="cancelBet(bet.id)"
                      [loading]="submitting()"
                      [hidden]="!canCancel(bet, userPlayer()?.player_id)"
                    />
                  }
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    } @else {
      <p class="text-500 font-italic text-center mt-5">No open bets</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReviewUserBetsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly BetStatus = BetStatus;

  readonly userPlayer = this.playerService.userPlayer;
  readonly bets = this.betService.bets;

  readonly submitting = signal(false);

  readonly openOrActiveBets = computed(() => {
    return this.bets()?.filter(
      (bet) =>
        bet.status === BetStatus.Active ||
        bet.status === BetStatus.PendingAcceptance,
    );
  });

  readonly displayBets: Signal<DisplayBet[] | undefined> = computed(() =>
    this.openOrActiveBets()?.map((bet) => {
      const players = this.playerService.players();
      const requester = players?.filter(
        (player) => player.player_id === bet.requester_player_id,
      )[0];
      const opponent = players?.filter(
        (player) => player.player_id === bet.opponent_player_id,
      )[0];

      return {
        requesterName: requester?.display_name ?? 'Requester',
        requesterScore: requester?.score ?? 0,
        requesterWager: bet.requester_wager,
        requesterId: bet.requester_player_id,
        opponentName: opponent?.display_name ?? 'Opponent',
        opponentScore: opponent?.score ?? 0,
        opponentWager: bet.opponent_wager,
        opponentId: bet.opponent_player_id,
        description: bet.description,
        id: bet.id,
        status: bet.status,
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

  cancelBet(betId: BetModel['id']) {
    confirmBackendAction({
      action: async () => this.betService.rejectBet(betId),
      confirmationMessageText: 'Are you sure you want to cancel this bet?',
      successMessageText: 'Bet canceled',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  generateTerms(bet: DisplayBet) {
    let terms = bet.requesterName + ' bets ';
    const unevenOdds = bet.requesterWager !== bet.opponentWager;
    if (unevenOdds) {
      terms +=
        bet.requesterWager +
        ' against ' +
        bet.opponentName +
        "'s " +
        bet.opponentWager;
    } else {
      terms += bet.opponentName + ' ' + bet.requesterWager;
    }
    terms += ' that ' + bet.description;
    return terms;
  }

  canAcceptReject(bet: DisplayBet, playerId: BetModel['id'] | undefined) {
    return (
      bet.opponentId === playerId && bet.status === BetStatus.PendingAcceptance
    );
  }

  canCancel(bet: DisplayBet, playerId: BetModel['id'] | undefined) {
    return (
      bet.requesterId === playerId && bet.status === BetStatus.PendingAcceptance
    );
  }
}

class DisplayBet {
  requesterName = '';
  requesterScore = 0;
  requesterWager = 0;
  requesterId = 0;
  opponentName = '';
  opponentScore = 0;
  opponentWager = 0;
  opponentId = 0;
  description = '';
  id: BetModel['id'] = 0;
  status: BetModel['status'] = 'active';
}
