import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../auth/data-access/auth.service';
import { PostgrestResponse } from '@supabase/supabase-js';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerDuelStats } from '../../shared/util/supabase-types';
import { BattingAvgPipe } from '../../shared/ui/batting-average.pipe';
import { ChartModule } from 'primeng/chart';
import { PlayerDuelStatsChartDataPipe } from '../ui/player-duel-stats-chart-data.pipe';
import { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumberSignColorClassPipe } from '../../shared/ui/number-sign-color-class.pipe';

@Component({
  selector: 'joshies-player-duel-stats-page',
  imports: [
    DecimalPipe,
    NgOptimizedImage,
    PageHeaderComponent,
    HeaderLinkComponent,
    BattingAvgPipe,
    ChartModule,
    PlayerDuelStatsChartDataPipe,
    NgClass,
    NumberSignColorClassPipe,
  ],
  template: `
    <joshies-page-header headerText="Player Duel Stats" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (playerDuelStatsSortedByAverage(); as playerDuelStats) {
      @for (player of playerDuelStats; track player.user_id) {
        <div
          class="bg-surface-0 dark:bg-surface-900 rounded-lg px-4 py-6 mt-8"
          [class.bg-highlight]="player.user_id === userId()"
        >
          <!-- Player -->
          <div
            class="flex flex-col items-center justify-center gap-2 mb-4 text-xl font-semibold pb-4 border-surface-200 dark:border-surface-600 border-b"
          >
            <img
              [ngSrc]="player.avatar_url"
              alt=""
              width="48"
              height="48"
              class="rounded-full bg-surface-100 dark:bg-surface-700"
            />
            {{ player.display_name }}
          </div>

          <table class="mx-auto">
            <tbody class="text-right">
              <tr>
                <td class="pb-1 pr-2 text-surface-600 dark:text-surface-200">
                  Total Duels:
                </td>
                <td class="pb-1 pr-8 font-semibold">
                  {{ player.num_duels_participated | number }}
                </td>

                <td class="pb-1 pr-2 text-surface-600 dark:text-surface-200">
                  Duels Won:
                </td>
                <td
                  class="pb-1 pr-2 font-semibold"
                  [ngClass]="player.num_duels_won | numberSignColorClass"
                >
                  {{ player.num_duels_won | number }}
                </td>
              </tr>
              <tr></tr>
              <tr>
                <td class="pt-1 pr-2 text-surface-600 dark:text-surface-200">
                  Average:
                </td>
                <td class="pt-1 pr-8 font-semibold">
                  {{
                    (player.num_duels_won / player.num_duels_participated
                      | battingAverage) ?? '—'
                  }}
                </td>

                <td class="pt-1 pr-2 text-surface-600 dark:text-surface-200">
                  Duels Lost:
                </td>
                <td
                  class="pt-1 pr-2 font-semibold"
                  [ngClass]="
                    player.num_duels_won - player.num_duels_participated
                      | numberSignColorClass
                  "
                >
                  {{
                    player.num_duels_participated - player.num_duels_won
                      | number
                  }}
                </td>
              </tr>
            </tbody>
          </table>

          @if (player.num_duels_participated) {
            <p-chart
              type="bar"
              [data]="player | playerDuelStatsChartData"
              [options]="chartOptions()"
              height="32"
              [plugins]="[ChartDataLabels]"
              class="block mt-4"
            />
          }
        </div>
      }
    } @else {
      <p class="text-red700">Error loading data</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlayerDuelStatsPageComponent {
  private readonly authService = inject(AuthService);

  readonly playerDuelStatsQueryResult =
    input.required<PostgrestResponse<PlayerDuelStats>>(); // route resolver param

  readonly playerDuelStats = computed(
    () => this.playerDuelStatsQueryResult().data,
  );

  readonly playerDuelStatsSortedByAverage = computed(() => {
    const playerDuelStats = this.playerDuelStats();

    if (!playerDuelStats) return playerDuelStats;

    return [...playerDuelStats].sort((a, b) => {
      let aAverage = a.num_duels_won / a.num_duels_participated;
      let bAverage = b.num_duels_won / b.num_duels_participated;

      if (isNaN(aAverage)) aAverage = -1;
      if (isNaN(bAverage)) bAverage = -1;

      return bAverage - aAverage;
    });
  });

  readonly max = computed(() =>
    Math.max(
      -Math.min(
        ...(this.playerDuelStats()?.map((p) => p.total_points_lost) ?? []),
      ),
      Math.max(
        ...(this.playerDuelStats()?.map((p) => p.total_points_won) ?? []),
      ),
    ),
  );

  readonly chartOptions: Signal<ChartOptions> = computed(() => ({
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        min: -this.max(),
        max: this.max(),
        display: false,
      },
      y: {
        stacked: true,
        display: false,
      },
    },
  }));

  readonly userId = computed(() => this.authService.user()?.id);

  protected readonly ChartDataLabels = ChartDataLabels;
}
