import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
  ],
  template: `
    <joshies-page-header headerText="Betting" />

    <div class="grid align-items-stretch">
      @if (stats(); as stats) {
        <!-- Resolved Bets -->
        <div class="col">
          <div class="h-full surface-100 p-2 border-round text-center">
            <p class="text-sm m-0">Resolved Bets</p>
            @if (stats.totalResolvedBets === null) {
              <p class="text-xl my-2">—</p>
            } @else {
              <p
                class="text-xl my-2 font-semibold"
                [ngClass]="stats.totalResolvedBets | numberSignColorClass"
              >
                {{ stats.totalResolvedBets | number }}
              </p>
            }
          </div>
        </div>

        <!-- Total Profit -->
        <div class="col">
          <div class="h-full surface-100 p-2 border-round text-center">
            <p class="text-sm m-0">Total Profit</p>
            @if (stats.totalProfit === null) {
              <p class="text-xl my-2">—</p>
            } @else {
              <p
                class="text-xl my-2"
                [innerHTML]="stats.totalProfit | numberWithSignAndColor"
              ></p>
            }
          </div>
        </div>

        <!-- Overall Win % -->
        <div class="col">
          <div class="h-full surface-100 p-2 border-round text-center">
            <p class="text-sm m-0">Overall Win %</p>
            @if (stats.totalProfit === null) {
              <p class="text-xl my-2">—</p>
            } @else {
              <p
                class="text-xl my-2 font-semibold"
                [ngClass]="
                  stats.overallWinPercentage ?? 0 | numberSignColorClass
                "
              >
                {{ stats.overallWinPercentage | number: '1.0-2' }}%
              </p>
            }
          </div>
        </div>
      } @else {
        <p-skeleton class="col" height="4.5rem" />
        <p-skeleton class="col" height="4.5rem" />
        <p-skeleton class="col" height="4.5rem" />
      }
    </div>

    @if (chartData(); as chartData) {
      <p-chart
        type="bar"
        [options]="chartOptions"
        [data]="chartData"
        height="10rem"
      />
    } @else {
      <div class="h-10rem pt-1 pb-3">
        <p-skeleton height="100%" />
      </div>
    }

    <joshies-card headerText="Placing Bets" [links]="placingBetsLinks" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BettingDashboardPageComponent {
  private readonly betService = inject(BetService);

  readonly chartData = this.betService.betSummaryChartData;

  readonly overallWinPercentage = toSignal(
    this.betService.overallWinPercentage$,
  );
  readonly totalResolvedBets = toSignal(this.betService.totalResolvedBets$);
  readonly totalProfit = toSignal(this.betService.totalProfit$);

  readonly stats = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      totalProfit: this.totalProfit(),
      totalResolvedBets: this.totalResolvedBets(),
      overallWinPercentage: this.overallWinPercentage(),
    }),
  );

  readonly chartOptions: ChartOptions = {
    // responsive: true,
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
          // display: false,
          color: surfaceBorder,
          // color: (context) =>
          //   context.tick.value === 0 ? surfaceBorder : undefined,
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
}
