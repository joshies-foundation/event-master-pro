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
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BetStatus } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { BetService } from '../../shared/data-access/bet.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { BetModel, PlayerModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-review-user-bets-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
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

    @if (bets()?.length) {
      @if (bets(); as bets) {
        <p class="mt-8 mb-4">Review bets that are open or awaiting approval.</p>
        <p-table
          [value]="bets"
          [defaultSortOrder]="-1"
          sortField="score"
          [sortOrder]="-1"
          [scrollable]="true"
        >
          <ng-template #header>
            <tr>
              <th style="width: 60%;">
                Bet Terms (Your score: {{ userPlayer()?.score }})
              </th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template #body [joshiesStronglyTypedTableRow]="bets" let-bet>
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
                  class="flex flex-col justify-end gap-2 text-left md:flex-row"
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
                        bet.opponent_wager > (userPlayer()?.score ?? 0) ||
                        bet.requester_wager > (bet.requester?.score ?? Infinity)
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
      <p class="mt-8 mb-4 text-center text-neutral-500 italic">
        No open or pending bets
      </p>
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

  generateTerms(bet: BetModel) {
    let terms = bet.requester?.display_name + ' bets ';
    const unevenOdds = bet.requester_wager !== bet.opponent_wager;
    if (unevenOdds) {
      terms +=
        bet.requester_wager +
        ' against ' +
        bet.opponent?.display_name +
        "'s " +
        bet.opponent_wager;
    } else {
      terms += bet.opponent?.display_name + ' ' + bet.requester_wager;
    }
    terms += ' that ' + bet.description;
    return terms;
  }

  canAcceptReject(bet: BetModel, playerId: PlayerModel['id'] | undefined) {
    return (
      bet.opponent_player_id === playerId &&
      bet.status === BetStatus.PendingAcceptance
    );
  }

  canCancel(bet: BetModel, playerId: PlayerModel['id'] | undefined) {
    return (
      bet.requester_player_id === playerId &&
      bet.status === BetStatus.PendingAcceptance
    );
  }

  protected readonly Infinity = Infinity;
}
