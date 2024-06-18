import {
  ChangeDetectionStrategy,
  Component,
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
import { toSignal } from '@angular/core/rxjs-interop';

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

    @if (bets(); as bets) {
      <p-table [value]="bets" [scrollable]="true">
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
                {{ bet.requester?.display_name }} bets
                {{ bet.opponent?.display_name }} that
                {{ bet.description }}
              </div>
            </td>
            <!-- Status Buttons -->
            <td>
              <div
                class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
              >
                <p-button
                  [label]="bet.requester?.display_name + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="
                    submitRequesterWins(
                      bet.id,
                      bet.requester?.display_name ?? 'the requester'
                    )
                  "
                  [hidden]="bet.status === BetStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  [label]="bet.opponent?.display_name + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="
                    submitOpponentWins(
                      bet.id,
                      bet.opponent?.display_name ?? 'the requester'
                    )
                  "
                  [hidden]="bet.status === BetStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  label="Push"
                  icon="pi pi-equals"
                  styleClass="w-full"
                  (onClick)="pushBet(bet.id)"
                  [hidden]="bet.status === BetStatus.PendingAcceptance"
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

  readonly BetStatus = BetStatus;

  readonly submitting = signal(false);

  readonly bets = toSignal(this.betService.allBets$);

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
      confirmationMessageText: `Are you sure ${requesterName} won?`,
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
