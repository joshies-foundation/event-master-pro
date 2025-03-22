import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';
import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { GetPlayerRoundScoreFunctionReturnType } from '../../shared/util/supabase-types';
import { ChartData, ChartOptions } from 'chart.js';
import { getCssVariableValue } from '../../shared/util/css-helpers';
import { ChartModule } from 'primeng/chart';
import { AnalyticsService } from '../data-access/analytics.service';
import { SkeletonModule } from 'primeng/skeleton';
import { TransactionTableComponent } from '../ui/transaction-table.component';
import { Button } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RouterLink } from '@angular/router';
import { GameStateService } from '../../shared/data-access/game-state.service';

const textColor = getCssVariableValue('--color-text-color');
const textColorSecondary = getCssVariableValue('--color-text-color-secondary');
const surfaceBorder = getCssVariableValue('--color-surface-border');

const numTransactionsToShow = 3;

@Component({
  selector: 'joshies-analytics-tab',
  imports: [
    PageHeaderComponent,
    CardComponent,
    ChartModule,
    SkeletonModule,
    TransactionTableComponent,
    Button,
    DividerModule,
    RouterLink,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Analytics" />

    @if (sessionIsInProgressOrFinished()) {
      @if (numRounds()) {
        <!-- Points Over Time Chart -->
        <joshies-card
          padded
          headerText="Points Over Time"
          headerIconClass="pi pi-chart-line text-primary mr-2"
        >
          @if (playerRoundScoresResponse().data; as playerRoundScores) {
            <p-chart
              type="line"
              [data]="pointsOverTimeChartData()"
              [options]="pointsOverTimeChartOptions"
              height="20rem"
            />
          } @else if (playerRoundScoresResponse().error) {
            <h4 class="mt-0 text-red">Error Loading Chart:</h4>
            <p>{{ playerRoundScoresResponse().error }}</p>
          }
        </joshies-card>
      }

      @if (userIsAPlayer()) {
        <joshies-card
          headerText="Latest Transactions"
          headerIconClass="pi pi-list text-primary mr-2"
        >
          <!-- Latest Transactions -->
          @if (firstFewTransactions(); as transactions) {
            @if (transactions.length > 0) {
              <joshies-transaction-table [transactions]="transactions" />

              @if (showViewAllTransactionsLink()) {
                <p-button
                  label="All Transactions"
                  icon="pi pi-angle-right"
                  iconPos="right"
                  class="block border-top-1 surface-border pb-1"
                  styleClass="w-full my-2"
                  routerLink="transactions"
                  severity="secondary"
                  [text]="true"
                />
              }
            } @else {
              <p class="pt-3 pb-3 text-center text-500 font-italic">
                No transactions yet
              </p>
            }
          } @else if (firstFewTransactions() === undefined) {
            <!-- Loading Skeleton -->
            <p-skeleton height="12rem" />
          }
        </joshies-card>
      }

      <!-- Gameboard -->
      <joshies-card
        headerText="Gameboard"
        headerIconClass="ci-space-entry text-primary mr-2"
        [links]="gameboardLinks"
      />

      <!-- Duels -->
      <joshies-card
        headerText="Duels"
        headerIconClass="pi pi-bolt text-primary mr-2"
        [links]="duelsLinks"
      />
    }

    <!-- Previous Session -->
    <!-- Previous session data is not available yet -->
    <!--    <joshies-card-->
    <!--      headerText="Previous Sessions"-->
    <!--      headerIconClass="pi pi-history text-primary mr-2"-->
    <!--      [links]="previousSessionsLinks"-->
    <!--    />-->
  `,
  host: {
    class: 'block pb-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsTabComponent {
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly sessionIsInProgressOrFinished =
    this.gameStateService.sessionIsInProgressOrFinished;

  readonly gameboardLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-history bg-orange-500',
      text: 'Roll History',
      routerLink: './roll-history',
    },
    {
      iconClass: 'pi ci-space-entry bg-gray-500',
      text: 'Space Stats',
      routerLink: './space-stats',
    },
  ];

  readonly duelsLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-history bg-blue-500',
      text: 'Duel History',
      routerLink: './duel-history',
    },
    {
      iconClass: 'pi pi-list-check bg-red-500',
      text: 'Player Duel Stats',
      routerLink: './player-duel-stats',
    },
  ];

  readonly previousSessionsLinks: CardLinkModel[] = [
    {
      iconClass: 'pi pi-trophy bg-yellow-500',
      text: 'Previous Session Rankings',
      routerLink: './previous-rankings',
    },
    {
      iconClass: 'pi pi-table bg-purple-500',
      text: 'Lifetime Score Statistics',
      routerLink: './lifetime-stats',
    },
  ];

  readonly playerRoundScoresResponse =
    input.required<
      PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType>
    >(); // route resolve data

  // readonly playerRoundScoresResponse = toSignal(
  //   this.gameStateService.sessionId$.pipe(
  //     switchMap((sessionId) =>
  //       this.analyticsService.getPlayerRoundScoresFromSession(sessionId),
  //     ),
  //   ),
  // );

  readonly pointsOverTimeChartOptions: ChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
        },
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
    elements: {
      point: {
        pointStyle: false,
        hitRadius: 8,
      },
    },
  };

  readonly numRounds = computed(
    () => this.playerRoundScoresResponse()?.data?.[0]?.scores.length ?? 0,
  );

  readonly pointsOverTimeChartData: Signal<ChartData> = computed(() => ({
    labels: Array.from(Array(this.numRounds() + 1).keys()),
    datasets:
      this.playerRoundScoresResponse()?.data?.map((player) => ({
        label: player.display_name,
        data: [0, ...player.scores],
        fill: false,
      })) ?? [],
  }));

  readonly userIsAPlayer = computed(() => !!this.playerService.userPlayerId());

  readonly firstFewTransactions = computed(() => {
    const transactions = this.analyticsService.transactions();

    if (!transactions) return transactions;

    return transactions.slice(0, numTransactionsToShow);
  });

  readonly showViewAllTransactionsLink = computed(
    () =>
      (this.analyticsService.transactions()?.length ?? 0) >
      numTransactionsToShow,
  );
}
