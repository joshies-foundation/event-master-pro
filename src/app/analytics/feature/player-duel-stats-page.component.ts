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
  standalone: true,
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
          class="surface-card border-round-lg px-3 py-4 mt-5"
          [class.bg-highlight]="player.user_id === userId()"
        >
          <!-- Player -->
          <div
            class="flex flex-column align-items-center justify-content-center gap-2 mb-3 text-xl font-semibold pb-3 border-200 border-bottom-1"
          >
            <img
              [ngSrc]="player.avatar_url"
              alt=""
              width="48"
              height="48"
              class="border-circle surface-100"
            />
            {{ player.display_name }}
          </div>

          <table class="mx-auto">
            <tbody class="text-right">
              <tr>
                <td class="pb-1 pr-2 text-600">Total Duels:</td>
                <td class="pb-1 pr-5 font-semibold">
                  {{ player.num_duels_participated | number }}
                </td>

                <td class="pb-1 pr-2 text-600">Duels Won:</td>
                <td
                  class="pb-1 pr-2 font-semibold"
                  [ngClass]="player.num_duels_won | numberSignColorClass"
                >
                  {{ player.num_duels_won | number }}
                </td>
              </tr>
              <tr></tr>
              <tr>
                <td class="pt-1 pr-2 text-600">Average:</td>
                <td class="pt-1 pr-5 font-semibold">
                  {{
                    (player.num_duels_won / player.num_duels_participated
                      | battingAverage) ?? '—'
                  }}
                </td>

                <td class="pt-1 pr-2 text-600">Duels Lost:</td>
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
              class="block mt-3"
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
