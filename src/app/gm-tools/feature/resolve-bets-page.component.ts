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

    @if (displayBets(); as displayBets) {
      <p-table [value]="displayBets" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 60%;"></th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="displayBets"
          let-displayBet
        >
          <tr>
            <!-- Bet Terms -->
            <td>
              <div class="flex flex-column gap-2 -py-2">
                {{ generateBetPrefix(displayBet.bet) }}
                {{ displayBet.requesterName }} bets
                {{ displayBet.opponentName }} that
                {{ displayBet.bet.description }}
              </div>
            </td>
            <!-- Status Buttons -->
            <td>
              <div
                class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
              >
                <p-button
                  [label]="displayBet.requesterName + ' Wins'"
                  [severity]="
                    displayBet.bet.bet_type === null ? 'success' : 'secondary'
                  "
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="
                    submitRequesterWins(
                      displayBet.bet.id,
                      displayBet.requesterName
                    )
                  "
                  [hidden]="
                    displayBet.bet.status === betStatus.PendingAcceptance
                  "
                  [loading]="submitting()"
                />
                <p-button
                  [label]="displayBet.opponentName + ' Wins'"
                  [severity]="
                    displayBet.bet.bet_type === null ? 'success' : 'secondary'
                  "
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="
                    submitOpponentWins(
                      displayBet.bet.id,
                      displayBet.opponentName
                    )
                  "
                  [hidden]="
                    displayBet.bet.status === betStatus.PendingAcceptance
                  "
                  [loading]="submitting()"
                />
                <p-button
                  label="Push"
                  icon="pi pi-equals"
                  [severity]="
                    displayBet.bet.bet_type === null ? 'primary' : 'secondary'
                  "
                  styleClass="w-full"
                  (onClick)="pushBet(displayBet.bet.id)"
                  [hidden]="
                    displayBet.bet.status === betStatus.PendingAcceptance
                  "
                  [loading]="submitting()"
                />
                <p-button
                  label="Cancel Bet"
                  severity="danger"
                  icon="pi pi-times"
                  styleClass="w-full"
                  (onClick)="cancelBet(displayBet.bet.id)"
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
          opponentName: opponent?.display_name ?? 'Opponent',
          opponentScore: opponent?.score,
          bet: bet,
        };
      }),
  );

  generateBetPrefix(bet: BetModel) {
    const pending = bet.status === BetStatus.PendingAcceptance;
    const auto = bet.bet_type !== null;
    if (pending && auto) {
      return 'PEND, AUTO: ';
    }
    if (pending) {
      return 'PEND: ';
    }
    if (auto) {
      return 'AUTO: ';
    }
    return '';
  }

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
