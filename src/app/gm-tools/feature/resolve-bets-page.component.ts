import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BetStatus, BetType } from '../../shared/util/supabase-helpers';
import { BetService } from '../../shared/data-access/bet.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BetModel } from '../../shared/util/supabase-types';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { BetToResolveComponent } from '../../betting/ui/bet-to-resolve.component';
import { AccordionModule } from 'primeng/accordion';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'joshies-resolve-bets-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    ButtonModule,
    RouterLink,
    DividerModule,
    SkeletonModule,
    BetToResolveComponent,
    AccordionModule,
    CardComponent,
  ],
  template: `
    <joshies-page-header
      headerText="Settle Bets"
      alwaysSmall
      class="mb-8 block"
    >
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (allBets(); as bets) {
      <joshies-card styleClass="px-4 py-1">
        <p-accordion [multiple]="true" value="0">
          <!-- Custom Bets -->
          <p-accordion-panel value="0">
            <p-accordion-header>
              {{ customBetsHeader() }}
            </p-accordion-header>

            <p-accordion-content>
              @for (bet of customBets(); track bet.id; let last = $last) {
                <joshies-bet-to-resolve
                  [bet]="bet"
                  [submitting]="submitting()"
                  [requesterWinningBetId]="requesterWinningBetId()"
                  [opponentWinningBetId]="opponentWinningBetId()"
                  [pushingBetId]="pushingBetId()"
                  [cancelingBetId]="cancelingBetId()"
                  (requesterWins)="
                    confirmRequesterWins(
                      bet.id,
                      bet.requester?.display_name ?? 'Requester'
                    )
                  "
                  (opponentWins)="
                    confirmOpponentWins(
                      bet.id,
                      bet.opponent?.display_name ?? 'Opponent'
                    )
                  "
                  (push)="confirmPushBet(bet.id)"
                  (cancelBet)="confirmCancelBet(bet.id)"
                />

                @if (!last) {
                  <p-divider />
                }
              } @empty {
                <p class="mt-2 mb-6 text-center text-neutral-500 italic">
                  No active custom bets
                </p>
              }
            </p-accordion-content>
          </p-accordion-panel>

          <!-- Auto-Resolve Bets -->
          <p-accordion-panel value="1">
            <p-accordion-header>
              {{ autoResolveBetsHeader() }}
            </p-accordion-header>

            <p-accordion-content>
              @for (bet of autoResolveBets(); track bet.id; let last = $last) {
                <joshies-bet-to-resolve
                  [bet]="bet"
                  [submitting]="submitting()"
                  [requesterWinningBetId]="requesterWinningBetId()"
                  [opponentWinningBetId]="opponentWinningBetId()"
                  [pushingBetId]="pushingBetId()"
                  [cancelingBetId]="cancelingBetId()"
                  (requesterWins)="
                    confirmRequesterWins(
                      bet.id,
                      bet.requester?.display_name ?? 'Requester'
                    )
                  "
                  (opponentWins)="
                    confirmOpponentWins(
                      bet.id,
                      bet.opponent?.display_name ?? 'Opponent'
                    )
                  "
                  (push)="confirmPushBet(bet.id)"
                  (cancelBet)="confirmCancelBet(bet.id)"
                />

                @if (!last) {
                  <p-divider />
                }
              } @empty {
                <p class="mb-2 text-center text-neutral-500 italic">
                  No active auto-resolve bets
                </p>
              }
            </p-accordion-content>
          </p-accordion-panel>

          <!-- Bets Pending Acceptance -->
          <p-accordion-panel value="2">
            <p-accordion-header>
              {{ betsPendingAcceptanceHeader() }}
            </p-accordion-header>

            <p-accordion-content>
              @for (
                bet of betsPendingAcceptance();
                track bet.id;
                let last = $last
              ) {
                <joshies-bet-to-resolve
                  [bet]="bet"
                  [submitting]="submitting()"
                  [requesterWinningBetId]="requesterWinningBetId()"
                  [opponentWinningBetId]="opponentWinningBetId()"
                  [pushingBetId]="pushingBetId()"
                  [cancelingBetId]="cancelingBetId()"
                  (push)="confirmPushBet(bet.id)"
                  (cancelBet)="confirmCancelBet(bet.id)"
                />

                @if (!last) {
                  <p-divider />
                }
              } @empty {
                <p class="mb-2 text-center text-neutral-500 italic">
                  No bets pending acceptance
                </p>
              }
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </joshies-card>
    } @else {
      <p-skeleton height="2rem" styleClass="mt-12 mb-4" />

      @for (i of [1, 2]; track i) {
        <p-skeleton height="9rem" styleClass="mb-2" />
        <div class="grid grid-cols-2 grid-rows-1 gap-4">
          <p-skeleton class="col" height="37px" />
          <p-skeleton class="col" height="37px" />
        </div>
        <div class="mb-4 grid grid-cols-2 grid-rows-1 gap-4">
          <p-skeleton class="col" height="37px" />
          <p-skeleton class="col" height="37px" />
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveBetsPageComponent {
  private readonly betService = inject(BetService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allBets = toSignal(this.betService.allBetsForThisSession$);

  private readonly activeBets = computed(() =>
    this.allBets()?.filter((bet) => bet.status === BetStatus.Active),
  );

  readonly customBets = computed(() =>
    this.activeBets()?.filter((bet) => betIsCustom(bet.bet_type)),
  );

  readonly autoResolveBets = computed(() =>
    this.activeBets()?.filter((bet) => !betIsCustom(bet.bet_type)),
  );

  readonly betsPendingAcceptance = computed(() =>
    this.allBets()?.filter((bet) => bet.status === BetStatus.PendingAcceptance),
  );

  readonly customBetsHeader = computed(
    () => `Custom Bets (${this.customBets()?.length})`,
  );

  readonly autoResolveBetsHeader = computed(
    () => `Auto-Settling Bets (${this.autoResolveBets()?.length})`,
  );

  readonly betsPendingAcceptanceHeader = computed(
    () => `Pending Acceptance (${this.betsPendingAcceptance()?.length})`,
  );

  readonly submitting = signal(false);
  readonly requesterWinningBetId = signal<BetModel['id'] | null>(null);
  readonly opponentWinningBetId = signal<BetModel['id'] | null>(null);
  readonly pushingBetId = signal<BetModel['id'] | null>(null);
  readonly cancelingBetId = signal<BetModel['id'] | null>(null);

  confirmRequesterWins(betId: BetModel['id'], requesterName: string) {
    this.resetInProgressSignals();
    this.requesterWinningBetId.set(betId);

    confirmBackendAction({
      action: async () => this.betService.submitBetRequesterWon(betId),
      confirmationHeaderText: `${requesterName} won?`,
      confirmationMessageText: `Are you sure ${requesterName} won?`,
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmOpponentWins(betId: BetModel['id'], opponentName: string) {
    this.resetInProgressSignals();
    this.opponentWinningBetId.set(betId);

    confirmBackendAction({
      action: async () => this.betService.submitBetOpponentWon(betId),
      confirmationHeaderText: `${opponentName} won?`,
      confirmationMessageText: `Are you sure ${opponentName} won?`,
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmPushBet(betId: BetModel['id']) {
    this.resetInProgressSignals();
    this.pushingBetId.set(betId);

    confirmBackendAction({
      action: async () => this.betService.pushBet(betId),
      confirmationHeaderText: 'Push?',
      confirmationMessageText:
        'Are you sure you want to mark this bet as a push?',
      successMessageText: 'Bet resolved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmCancelBet(betId: BetModel['id']) {
    this.resetInProgressSignals();
    this.cancelingBetId.set(betId);

    confirmBackendAction({
      action: async () => this.betService.cancelBetByGM(betId),
      confirmationHeaderText: 'Cancel Bet?',
      confirmationMessageText: 'Are you sure you want to cancel this bet?',
      successMessageText: 'Bet canceled',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  private resetInProgressSignals(): void {
    this.requesterWinningBetId.set(null);
    this.opponentWinningBetId.set(null);
    this.pushingBetId.set(null);
    this.cancelingBetId.set(null);
  }
}

function betIsCustom(betType: BetModel['bet_type']): boolean {
  return !betType || betType === BetType.Custom;
}
