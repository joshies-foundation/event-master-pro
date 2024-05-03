import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  input,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ChartModule } from 'primeng/chart';
import { GetPlayerRoundScoreFunctionReturnType } from '../../shared/util/supabase-types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'joshies-compare-points-over-time-page',
  standalone: true,
  imports: [PageHeaderComponent, HeaderLinkComponent, ChartModule],
  template: `
    <joshies-page-header headerText="Points Over Time" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (playerRoundScoresResponse()?.data; as playerRoundScores) {
      <div class="h-3rem"></div>
      <p-chart type="line" [data]="data()" [options]="options" />
    } @else if (playerRoundScoresResponse() === null) {
      <p class="mt-6 pt-6 text-center text-500 font-italic">
        No active session
      </p>
    } @else {
      <h4 class="mt-5 text-red-700">Error:</h4>
      <p>{{ playerRoundScoresResponse()?.error }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComparePointsOverTimePageComponent {
  readonly playerRoundScoresResponse =
    input.required<PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType> | null>(); // route resolve data

  private readonly documentStyle = getComputedStyle(document.documentElement);
  private readonly textColor =
    this.documentStyle.getPropertyValue('--text-color');
  private readonly textColorSecondary = this.documentStyle.getPropertyValue(
    '--text-color-secondary',
  );
  private readonly surfaceBorder =
    this.documentStyle.getPropertyValue('--surface-border');

  readonly options: ChartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: this.textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: this.textColorSecondary,
        },
        grid: {
          color: this.surfaceBorder,
        },
      },
      y: {
        ticks: {
          color: this.textColorSecondary,
        },
        grid: {
          color: this.surfaceBorder,
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

  private readonly numRounds = computed(
    () => this.playerRoundScoresResponse()?.data?.[0].scores.length ?? 1,
  );

  readonly data: Signal<ChartData> = computed(() => ({
    labels: Array.from(Array(this.numRounds() + 1).keys()),
    datasets:
      this.playerRoundScoresResponse()?.data?.map((player) => ({
        label: player.display_name,
        data: [0, ...player.scores],
        fill: false,
      })) ?? [],
  }));
}
