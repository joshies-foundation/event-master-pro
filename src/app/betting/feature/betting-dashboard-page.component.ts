import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BetService } from '../../shared/data-access/bet.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SkeletonModule } from 'primeng/skeleton';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { NumberSignColorClassPipe } from '../../shared/ui/number-sign-color-class.pipe';
import { ChartModule } from 'primeng/chart';
import { ChartOptions } from 'chart.js';
import { getCssVariableValue } from '../../shared/util/css-helpers';
import { BetComponent } from '../../shared/ui/bet.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { Button } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { BetModel, PlayerModel } from '../../shared/util/supabase-types';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BetRequestComponent } from '../ui/bet-request.component';
import { getUserBetData } from '../../shared/util/bet-helpers';
import { AccordionModule } from 'primeng/accordion';
import { RouterLink } from '@angular/router';
import { BetType } from '../../shared/util/supabase-helpers';
import { BetToResolveComponent } from '../ui/bet-awaiting-acceptance.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { Ripple } from 'primeng/ripple';

const textColorMuted = getCssVariableValue('--color-muted-color');
const borderColor = getCssVariableValue('--color-standard-border-color');

@Component({
  selector: 'joshies-betting-dashboard-page',
  imports: [
    CardComponent,
    PageHeaderComponent,
    DecimalPipe,
    SkeletonModule,
    NumberWithSignAndColorPipe,
    NgClass,
    NumberSignColorClassPipe,
    ChartModule,
    BetComponent,
    Button,
    DividerModule,
    BetRequestComponent,
    AccordionModule,
    RouterLink,
    BetToResolveComponent,
    Ripple,
  ],
  template: `
    <joshies-page-header headerText="Betting" />

    @if (pageLoaded()) {
      <!-- Stats -->
      <div class="mb-4 grid grid-cols-3 grid-rows-1 gap-4">
        @if (stats(); as stats) {
          <!-- Resolved Bets -->
          <div class="rounded-border bg-neutral-0 p-2 text-center">
            <p class="text-sm">Settled Bets</p>
            @if (stats.numResolvedBets === null) {
              <p class="my-1 text-2xl">—</p>
            } @else {
              <p
                class="my-1 text-2xl font-semibold"
                [ngClass]="stats.numResolvedBets | numberSignColorClass"
              >
                {{ stats.numResolvedBets | number }}
              </p>
            }
          </div>

          <!-- Total Profit -->
          <div class="rounded-border bg-neutral-0 p-2 text-center">
            <p class="text-sm">Total Profit</p>
            @if (stats.totalProfit === null) {
              <p class="my-1 text-2xl">—</p>
            } @else {
              <p
                class="my-1 text-2xl"
                [innerHTML]="stats.totalProfit | numberWithSignAndColor"
              ></p>
            }
          </div>

          <!-- Overall Win % -->
          <div class="rounded-border bg-neutral-0 p-2 text-center">
            <p class="text-sm">Overall Win %</p>
            @if (stats.totalProfit === null) {
              <p class="my-1 text-2xl">—</p>
            } @else {
              <p
                class="my-1 text-2xl font-semibold"
                [ngClass]="
                  stats.overallWinPercentage ?? 0 | numberSignColorClass
                "
              >
                {{ stats.overallWinPercentage | number: '1.0-2' }}%
              </p>
            }
          </div>
        }
      </div>

      <!-- Chart -->
      <div class="mb-4 rounded-border bg-neutral-0 p-2 pb-0">
        <p-chart
          type="bar"
          [options]="chartOptions"
          [data]="chartData()"
          height="10rem"
        />
      </div>

      <!-- Bet Requests -->
      @if (userPlayerId(); as userPlayerId) {
        @if (betRequests(); as betRequests) {
          @if (betRequests.length > 0) {
            <joshies-card
              padded
              [headerText]="betRequestsHeaderText()"
              headerIconClass="pi pi-info-circle text-primary mr-2"
              class="mb-6"
            >
              <!-- Always show 1st bet request -->
              <joshies-bet-request
                [bet]="betRequests[0]"
                [userPlayerId]="userPlayerId"
                [submitting]="submitting()"
                [acceptingBetId]="acceptingBetId()"
                [rejectingBetId]="rejectingBetId()"
                (accept)="confirmAcceptBet(betRequests[0], userPlayerId)"
                (reject)="confirmRejectBet(betRequests[0], userPlayerId)"
              />

              @if (showViewAllBetRequestsAccordion()) {
                <p-accordion>
                  <p-accordion-panel value="0">
                    <p-accordion-header class="pb-2">
                      All Requests
                    </p-accordion-header>

                    <p-accordion-content>
                      @for (
                        bet of betRequests;
                        track bet.id;
                        let first = $first;
                        let last = $last;
                        let index = $index
                      ) {
                        @if (!first) {
                          <joshies-bet-request
                            [class.pt-4]="index === 1"
                            class="block"
                            [bet]="bet"
                            [userPlayerId]="userPlayerId"
                            [submitting]="submitting()"
                            [acceptingBetId]="acceptingBetId()"
                            [rejectingBetId]="rejectingBetId()"
                            (accept)="confirmAcceptBet(bet, userPlayerId)"
                            (reject)="confirmRejectBet(bet, userPlayerId)"
                          />

                          @if (!last) {
                            <p-divider />
                          }
                        }
                      }
                    </p-accordion-content>
                  </p-accordion-panel>
                </p-accordion>
              }
            </joshies-card>
          }
        }

        @if (sessionIsInProgress()) {
          <!-- Pace Bet -->
          <h3 class="my-2 text-lg font-bold">
            <i class="pi pi-plus mr-2 text-primary"></i> Place Bet For
          </h3>
          <div class="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            @for (
              betTypeButtonModel of betTypeButtonModels;
              track betTypeButtonModel.label
            ) {
              <a
                [routerLink]="betTypeButtonModel.routerLink"
                [queryParams]="betTypeButtonModel.queryParams"
                class="p-button p-button-outlined flex h-16 w-24 shrink-0 flex-col items-center justify-center gap-1 p-2 text-center text-xs"
                pRipple
              >
                <i [class]="betTypeButtonModel.iconClass"></i>
                {{ betTypeButtonModel.label }}
              </a>
            }
          </div>
        }

        @if (betsAwaitingAcceptance(); as betsAwaitingAcceptance) {
          @if (betsAwaitingAcceptance.length) {
            <!-- Awaiting Acceptance -->
            <joshies-card
              padded
              [headerText]="betsAwaitingAcceptanceHeaderText()"
              headerIconClass="pi pi-hourglass text-primary mr-2"
            >
              <joshies-bet-awaiting-acceptance
                [bet]="betsAwaitingAcceptance[0]"
                [userPlayerId]="userPlayerId"
                [submitting]="submitting()"
                [cancelingBetId]="cancelingBetId()"
                (cancelBet)="
                  confirmCancelBetByRequester(
                    betsAwaitingAcceptance[0],
                    userPlayerId
                  )
                "
              />

              @if (showViewAllBetsAwaitingAcceptanceAccordion()) {
                <p-accordion>
                  <p-accordion-panel value="0">
                    <p-accordion-header class="pb-2">
                      All Bets Awaiting Acceptance
                    </p-accordion-header>

                    <p-accordion-content>
                      @for (
                        bet of betsAwaitingAcceptance;
                        track bet.id;
                        let first = $first;
                        let last = $last;
                        let index = $index
                      ) {
                        @if (!first) {
                          <joshies-bet-awaiting-acceptance
                            [class.pt-4]="index === 1"
                            class="block"
                            [bet]="bet"
                            [userPlayerId]="userPlayerId"
                            [submitting]="submitting()"
                            [cancelingBetId]="cancelingBetId()"
                            (cancelBet)="
                              confirmCancelBetByRequester(bet, userPlayerId)
                            "
                          />

                          @if (!last) {
                            <p-divider />
                          }
                        }
                      }
                    </p-accordion-content>
                  </p-accordion-panel>
                </p-accordion>
              }
            </joshies-card>
          }
        }

        <!-- Open Bets -->
        <joshies-card
          padded
          [headerText]="activeBetsHeaderText()"
          headerIconClass="pi pi-forward text-primary mr-2"
        >
          @if (activeBets(); as activeBets) {
            @if (activeBets.length) {
              <joshies-bet
                [bet]="activeBets[0]"
                [userPlayerId]="userPlayerId"
              />
            } @else {
              <p class="m-0 text-neutral-600 italic">No open bets</p>
            }
          }

          @if (showViewActiveBetsAccordion()) {
            <p-accordion>
              <p-accordion-panel value="0">
                <p-accordion-header class="pb-2">
                  All Open Bets
                </p-accordion-header>

                <p-accordion-content>
                  @for (
                    bet of activeBets();
                    track bet.id;
                    let first = $first;
                    let last = $last;
                    let index = $index
                  ) {
                    @if (!first) {
                      <joshies-bet
                        [class.pt-4]="index === 1"
                        class="block"
                        [bet]="bet"
                        [userPlayerId]="userPlayerId"
                      />

                      @if (!last) {
                        <p-divider />
                      }
                    }
                  }
                </p-accordion-content>
              </p-accordion-panel>
            </p-accordion>
          }
        </joshies-card>

        <!-- Resolved Bets -->
        <joshies-card
          padded
          [headerText]="resolvedBetsHeaderText()"
          headerIconClass="pi pi-check-circle text-primary mr-2"
        >
          @for (bet of firstFewResolvedBets(); track bet.id; let last = $last) {
            <joshies-bet [bet]="bet" [userPlayerId]="userPlayerId" />

            @if (!last) {
              <p-divider />
            }
          } @empty {
            <p class="m-0 text-neutral-600 italic">No settled bets</p>
          }

          @if (showViewAllResolvedBetsLink()) {
            <p-divider class="mb-2" />
            <p-button
              label="All Settled Bets"
              icon="pi pi-angle-right"
              iconPos="right"
              styleClass="w-full"
              routerLink="resolved-bets"
              severity="secondary"
              [text]="true"
            />
          }
        </joshies-card>
      }
    } @else {
      <!-- Stats -->
      <div class="mb-4 grid grid-cols-3 grid-rows-1 gap-4">
        <p-skeleton height="4.75rem" />
        <p-skeleton height="4.75rem" />
        <p-skeleton height="4.75rem" />
      </div>

      <!-- Chart -->
      <p-skeleton height="10.5rem" />

      <!-- Pace Bet -->
      <div class="mt-4 mb-2 flex gap-2">
        <p-skeleton height="1.25rem" width="1.25rem" class="rounded-full" />
        <p-skeleton height="1.25rem" width="7rem" />
      </div>
      <div class="-mx-4 flex gap-2 overflow-x-hidden px-4">
        @for (
          betTypeButtonModel of betTypeButtonModels;
          track betTypeButtonModel.label
        ) {
          <p-skeleton height="4rem" width="6rem" />
        }
      </div>

      <!-- Open Bets -->
      <div class="mt-6 mb-2 flex gap-2">
        <p-skeleton height="1.25rem" width="1.25rem" class="rounded-full" />
        <p-skeleton height="1.25rem" width="7.5rem" />
      </div>
      <p-skeleton height="9.5rem" />
    }
  `,
  host: {
    class: 'block pb-12',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BettingDashboardPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly betService = inject(BetService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly chartData = this.betService.betSummaryChartData;

  readonly sessionIsInProgress = this.gameStateService.sessionIsInProgress;

  readonly overallWinPercentage = toSignal(
    this.betService.overallWinPercentage$,
  );
  readonly numResolvedBets = toSignal(this.betService.numResolvedBets$);
  readonly totalProfit = toSignal(this.betService.totalProfit$);

  readonly stats = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      totalProfit: this.totalProfit(),
      numResolvedBets: this.numResolvedBets(),
      overallWinPercentage: this.overallWinPercentage(),
    }),
  );

  readonly betRequests = toSignal(this.betService.betRequests$);

  readonly betRequestsHeaderText = computed(
    () => `Bet Requests (${this.betRequests()?.length})`,
  );

  readonly betsAwaitingAcceptance = toSignal(
    this.betService.betsAwaitingAcceptance$,
  );

  readonly betsAwaitingAcceptanceHeaderText = computed(
    () => `Awaiting Acceptance (${this.betsAwaitingAcceptance()?.length})`,
  );

  readonly showViewAllBetsAwaitingAcceptanceAccordion = computed(
    () => (this.betsAwaitingAcceptance()?.length ?? 0) > 1,
  );

  readonly userPlayerId = this.playerService.userPlayerId;

  readonly showViewAllBetRequestsAccordion = computed(
    () => (this.betRequests()?.length ?? 0) > 1,
  );

  readonly activeBets = toSignal(this.betService.activeBets$);
  readonly showViewActiveBetsAccordion = computed(
    () => (this.activeBets()?.length ?? 0) > 1,
  );
  readonly activeBetsHeaderText = computed(
    () => `Open Bets (${this.activeBets()?.length})`,
  );

  private readonly resolvedBets = toSignal(this.betService.resolvedBets$);
  readonly firstFewResolvedBets = computed(() =>
    this.resolvedBets()?.slice(0, 3),
  );
  readonly showViewAllResolvedBetsLink = computed(
    () =>
      (this.numResolvedBets() ?? 0) >
      (this.firstFewResolvedBets()?.length ?? 0),
  );
  readonly resolvedBetsHeaderText = computed(
    () => `Settled Bets (${this.numResolvedBets()})`,
  );

  readonly pageLoaded = computed(
    () =>
      !!undefinedUntilAllPropertiesAreDefined({
        stats: this.stats(),
        userPlayerId: this.userPlayerId(),
        resolvedBets: this.resolvedBets(),
      }),
  );

  readonly chartOptions: ChartOptions = {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      point: {
        pointStyle: false,
        hitRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorMuted,
        },
        grid: {
          color: borderColor,
        },
      },
      y: {
        ticks: {
          color: textColorMuted,
        },
        grid: {
          color: borderColor,
        },
      },
    },
  };

  readonly placingBetsLinks: CardLinkModel[] = [
    {
      text: 'Place a bet',
      iconClass: 'pi pi-plus bg-purple-500',
      routerLink: './place-bet',
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
  ];

  readonly betTypeButtonModels: {
    iconClass: string;
    label: string;
    routerLink: string;
    queryParams: { betType: BetType };
  }[] = [
    {
      iconClass: PrimeIcons.PENCIL,
      label: 'Custom',
      routerLink: './place-bet',
      queryParams: { betType: BetType.Custom },
    },
    {
      iconClass: PrimeIcons.FLAG,
      label: 'Main Event',
      routerLink: './place-bet',
      queryParams: { betType: BetType.MainEvent },
    },
    {
      iconClass: PrimeIcons.BOLT,
      label: 'Duel',
      routerLink: './place-bet',
      queryParams: { betType: BetType.DuelWinner },
    },
    {
      iconClass: PrimeIcons.QUESTION_CIRCLE,
      label: 'Special Space Event',
      routerLink: './place-bet',
      queryParams: { betType: BetType.SpecialSpaceEvent },
    },
    {
      iconClass: PrimeIcons.EXCLAMATION_CIRCLE,
      label: 'Chaos Space Event',
      routerLink: './place-bet',
      queryParams: { betType: BetType.ChaosSpaceEvent },
    },
    {
      iconClass: 'ci-space-entry',
      label: 'Gameboard Move',
      routerLink: './place-bet',
      queryParams: { betType: BetType.GameboardMove },
    },
  ];

  readonly acceptingBetId = signal<BetModel['id'] | null>(null);
  readonly rejectingBetId = signal<BetModel['id'] | null>(null);
  readonly cancelingBetId = signal<BetModel['id'] | null>(null);
  readonly submitting = signal(false);

  async confirmAcceptBet(
    bet: BetModel,
    userPlayerId: PlayerModel['id'],
  ): Promise<void> {
    this.resetInProgressSignals();
    this.acceptingBetId.set(bet.id);

    const { userWager, userOpponentName, pointWord, thoseWord } =
      getUserBetData(bet, userPlayerId);

    confirmBackendAction({
      confirmationHeaderText: 'Confirm Accept',
      confirmationMessageText: `Are you sure you want to wager ${userWager} ${pointWord} against ${userOpponentName}? ${thoseWord} ${userWager} ${pointWord} will be tied up in the bet until the bet is settled.`,
      successMessageText: `ACCEPTED ${userOpponentName}'s bet`,
      action: async () => this.betService.acceptBet(bet.id),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.submitting,
      successNavigation: null,
    });
  }

  async confirmRejectBet(
    bet: BetModel,
    userPlayerId: PlayerModel['id'],
  ): Promise<void> {
    this.resetInProgressSignals();
    this.rejectingBetId.set(bet.id);

    const { userOpponentName } = getUserBetData(bet, userPlayerId);

    confirmBackendAction({
      confirmationHeaderText: 'Confirm Reject',
      confirmationMessageText: `Are you sure you want to REJECT ${userOpponentName}'s bet request?`,
      successMessageText: `REJECTED ${userOpponentName}'s bet`,
      action: async () => this.betService.rejectBet(bet.id),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.submitting,
      successNavigation: null,
    });
  }

  async confirmCancelBetByRequester(
    bet: BetModel,
    userPlayerId: PlayerModel['id'],
  ): Promise<void> {
    this.resetInProgressSignals();
    this.cancelingBetId.set(bet.id);

    const { userOpponentName } = getUserBetData(bet, userPlayerId);

    confirmBackendAction({
      confirmationHeaderText: 'Confirm Cancel',
      confirmationMessageText: `Are you sure you want to cancel your bet request against ${userOpponentName}?`,
      successMessageText: `Canceled bet against ${userOpponentName}`,
      action: async () => this.betService.cancelBetByRequester(bet.id),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.submitting,
      successNavigation: null,
    });
  }

  private resetInProgressSignals(): void {
    this.acceptingBetId.set(null);
    this.rejectingBetId.set(null);
    this.cancelingBetId.set(null);
  }
}
