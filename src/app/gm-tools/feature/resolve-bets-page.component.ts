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
import { BetModel } from '../../shared/util/supabase-types';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';

@Component({
  selector: 'joshies-resolve-bets-page',
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
    <joshies-page-header headerText="Resolve Bets" alwaysSmall>
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
                {{ bet.requesterName }} bets {{ bet.opponentName }} that
                {{ bet.description }}
              </div>
            </td>
            <!-- Status Buttons -->
            <td>
              <div
                class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
              >
                <p-button
                  [label]="bet.requesterName + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="submitRequesterWins(bet.id, bet.requesterName)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  [label]="bet.opponentName + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="submitOpponentWins(bet.id, bet.opponentName)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  label="Push"
                  icon="pi pi-equals"
                  styleClass="w-full"
                  (onClick)="pushBet(bet.id)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  label="Cancel Bet"
                  severity="danger"
                  icon="pi pi-times"
                  styleClass="w-full"
                  (onClick)="cancelBet(bet.id)"
                  [loading]="submitting()"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveBetsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly betStatus = BetStatus;
  readonly userPlayer = this.playerService.userPlayer;
  readonly bets = this.betService.bets;

  readonly submitting = signal(false);

  readonly displayBets = computed(() =>
    this.betService
      .allBets()
      ?.filter(
        (bet) =>
          bet.status === BetStatus.Active ||
          bet.status === BetStatus.PendingAcceptance,
      )
      ?.map((bet) => {
        const players = this.playerService.players();
        const requester = players?.filter(
          (player) => player.player_id === bet.requester_player_id,
        )[0];
        const opponent = players?.filter(
          (player) => player.player_id === bet.opponent_player_id,
        )[0];

        return {
          requesterName: requester?.display_name ?? 'Requester',
          requesterScore: requester?.score,
          requesterWager: bet.requester_wager,
          opponentName: opponent?.display_name ?? 'Opponent',
          opponentScore: opponent?.score,
          opponentWager: bet.opponent_wager,
          description: bet.description,
          id: bet.id,
          status: bet.status,
        };
      }),
  );

  pushBet(betId: BetModel['id']) {
    confirmBackendAction({
      action: async () => this.betService.pushBet(betId),
      confirmationMessageText:
        'Are you sure you want to mark this bet as a push?',
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  submitRequesterWins(betId: BetModel['id'], requesterName: string) {
    confirmBackendAction({
      action: async () => this.betService.submitBetRequesterWon(betId),
      confirmationMessageText: `Are you sure you want to mark this bet as won by ${requesterName}?`,
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  submitOpponentWins(betId: BetModel['id'], opponentName: string) {
    confirmBackendAction({
      action: async () => this.betService.submitBetOpponentWon(betId),
      confirmationMessageText: `Are you sure you want to mark this bet as won by ${opponentName}?`,
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  cancelBet(betId: BetModel['id']) {
    confirmBackendAction({
      action: async () => this.betService.cancelBetByGM(betId),
      confirmationMessageText: `Are you sure you want to cancel this bet?`,
      successMessageText: 'Bet canceled',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }
}
