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

// const textColor = getCssVariableValue('--text-color');
const textColorSecondary = getCssVariableValue('--text-color-secondary');
const surfaceBorder = getCssVariableValue('--surface-border');

@Component({
  selector: 'joshies-betting-dashboard-page',
  standalone: true,
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
  ],
  template: `
    <joshies-page-header headerText="Betting" />

    @if (pageLoaded()) {
      <!-- Stats -->
      <div class="grid">
        @if (stats(); as stats) {
          <!-- Resolved Bets -->
          <div class="col pb-3">
            <div class="h-full surface-card p-2 border-round text-center">
              <p class="text-sm m-0">Settled Bets</p>
              @if (stats.numResolvedBets === null) {
                <p class="text-2xl my-2">—</p>
              } @else {
                <p
                  class="text-2xl my-2 font-semibold"
                  [ngClass]="stats.numResolvedBets | numberSignColorClass"
                >
                  {{ stats.numResolvedBets | number }}
                </p>
              }
            </div>
          </div>

          <!-- Total Profit -->
          <div class="col pb-3">
            <div class="h-full surface-card p-2 border-round text-center">
              <p class="text-sm m-0">Total Profit</p>
              @if (stats.totalProfit === null) {
                <p class="text-2xl my-2">—</p>
              } @else {
                <p
                  class="text-2xl my-2"
                  [innerHTML]="stats.totalProfit | numberWithSignAndColor"
                ></p>
              }
            </div>
          </div>

          <!-- Overall Win % -->
          <div class="col pb-3">
            <div class="h-full surface-card p-2 border-round text-center">
              <p class="text-sm m-0">Overall Win %</p>
              @if (stats.totalProfit === null) {
                <p class="text-2xl my-2">—</p>
              } @else {
                <p
                  class="text-2xl my-2 font-semibold"
                  [ngClass]="
                    stats.overallWinPercentage ?? 0 | numberSignColorClass
                  "
                >
                  {{ stats.overallWinPercentage | number: '1.0-2' }}%
                </p>
              }
            </div>
          </div>
        }
      </div>

      <!-- Chart -->
      <div class="surface-card border-round p-2 pb-0 mb-3">
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
              class="mb-4"
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
                  <p-accordionTab
                    header="All Requests"
                    headerStyleClass="px-0 pb-2 bg-none"
                    contentStyleClass="p-0 mt-3 bg-none"
                  >
                    @for (
                      bet of betRequests;
                      track bet.id;
                      let first = $first;
                      let last = $last
                    ) {
                      @if (!first) {
                        <joshies-bet-request
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
                  </p-accordionTab>
                </p-accordion>
              }
            </joshies-card>
          }
        }

        <!-- Pace Bet -->
        <h3 class="my-2">
          <i class="pi pi-plus text-primary mr-2"></i> Place Bet For
        </h3>
        <div class="flex gap-2 overflow-x-auto hide-scrollbar -mx-3 px-3">
          @for (
            betTypeButtonModel of betTypeButtonModels;
            track betTypeButtonModel.label
          ) {
            <a
              [routerLink]="betTypeButtonModel.routerLink"
              [queryParams]="betTypeButtonModel.queryParams"
              class="flex flex-column flex-shrink-0 gap-1 text-xs h-4rem w-6rem p-2 justify-content-center text-center align-items-center no-underline p-button p-button-outlined"
              pRipple
            >
              <i [class]="betTypeButtonModel.iconClass"></i>
              {{ betTypeButtonModel.label }}
            </a>
          }
        </div>

        @if (betsAwaitingAcceptance(); as betsAwaitingAcceptance) {
          @if (betsAwaitingAcceptance.length) {
            <!-- Awaiting Acceptance -->
            <joshies-card
              padded
              [headerText]="betsAwaitingAcceptanceHeaderText()"
              headerIconClass="pi pi-hourglass text-primary mr-2"
            >
              <joshies-bet
                [bet]="betsAwaitingAcceptance[0]"
                [userPlayerId]="userPlayerId"
              />

              @if (showViewAllBetsAwaitingAcceptanceAccordion()) {
                <p-accordion>
                  <p-accordionTab
                    header="All Bets Awaiting Acceptance"
                    headerStyleClass="px-0 pb-2 bg-none"
                    contentStyleClass="p-0 mt-3 bg-none"
                  >
                    @for (
                      bet of betsAwaitingAcceptance;
                      track bet.id;
                      let first = $first;
                      let last = $last
                    ) {
                      @if (!first) {
                        <joshies-bet
                          [bet]="bet"
                          [userPlayerId]="userPlayerId"
                        />

                        @if (!last) {
                          <p-divider />
                        }
                      }
                    }
                  </p-accordionTab>
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
              <p class="m-0 font-italic text-600">No open bets</p>
            }
          }

          @if (showViewActiveBetsAccordion()) {
            <p-accordion>
              <p-accordionTab
                header="All Open Bets"
                headerStyleClass="px-0 pb-2 bg-none"
                contentStyleClass="p-0 mt-3 bg-none"
              >
                @for (
                  bet of activeBets();
                  track bet.id;
                  let first = $first;
                  let last = $last
                ) {
                  @if (!first) {
                    <joshies-bet [bet]="bet" [userPlayerId]="userPlayerId" />

                    @if (!last) {
                      <p-divider />
                    }
                  }
                }
              </p-accordionTab>
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
            <p class="m-0 font-italic text-600">No settled bets</p>
          }

          @if (showViewAllResolvedBetsLink()) {
            <p-divider styleClass="mb-2" />
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
      <div class="grid">
        <p-skeleton class="col" height="5rem" />
        <p-skeleton class="col" height="5rem" />
        <p-skeleton class="col" height="5rem" />
      </div>

      <!-- Chart -->
      <div class="h-11rem py-1">
        <p-skeleton height="100%" />
      </div>

      <!-- Pace Bet -->
      <div class="flex gap-2 mt-3 mb-2">
        <p-skeleton
          height="1.25rem"
          width="1.25rem"
          styleClass="border-circle"
        />
        <p-skeleton height="1.25rem" width="7rem" />
      </div>
      <div class="flex gap-2 overflow-x-hidden -mx-3 px-3">
        @for (
          betTypeButtonModel of betTypeButtonModels;
          track betTypeButtonModel.label
        ) {
          <p-skeleton
            [routerLink]="betTypeButtonModel.routerLink"
            height="4rem"
            width="6rem"
          />
        }
      </div>

      <!-- Open Bets -->
      <div class="flex gap-2 mt-4 mb-2">
        <p-skeleton
          height="1.25rem"
          width="1.25rem"
          styleClass="border-circle"
        />
        <p-skeleton height="1.25rem" width="7.5rem" />
      </div>
      <p-skeleton height="9.5rem" />
    }
  `,
  host: {
    class: 'block pb-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BettingDashboardPageComponent {
  private readonly betService = inject(BetService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly chartData = this.betService.betSummaryChartData;

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
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
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
    queryParams: { betType: string };
  }[] = [
    {
      iconClass: PrimeIcons.STAR,
      label: 'Main Event',
      routerLink: './place-bet',
      queryParams: { betType: 'event' },
    },
    {
      iconClass: PrimeIcons.BOLT,
      label: 'Duel',
      routerLink: './place-bet',
      queryParams: { betType: 'duel' },
    },
    {
      iconClass: PrimeIcons.QUESTION_CIRCLE,
      label: 'Special Space Event',
      routerLink: './place-bet',
      queryParams: { betType: 'special' },
    },
    {
      iconClass: PrimeIcons.EXCLAMATION_CIRCLE,
      label: 'Chaos Space Event',
      routerLink: './place-bet',
      queryParams: { betType: 'chaos' },
    },
    {
      iconClass: 'ci-space-entry',
      label: 'Gameboard Move',
      routerLink: './place-bet',
      queryParams: { betType: 'move' },
    },
    {
      iconClass: PrimeIcons.PENCIL,
      label: 'Custom',
      routerLink: './place-bet',
      queryParams: { betType: 'custom' },
    },
  ];

  readonly acceptingBetId = signal<BetModel['id'] | null>(null);
  readonly rejectingBetId = signal<BetModel['id'] | null>(null);
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

  private resetInProgressSignals(): void {
    this.acceptingBetId.set(null);
    this.rejectingBetId.set(null);
  }
}
