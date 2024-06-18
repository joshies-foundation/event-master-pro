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
import { getCssVariableValue } from '../../shared/util/css-helpers';

const textColor = getCssVariableValue('--text-color');
const textColorSecondary = getCssVariableValue('--text-color-secondary');
const surfaceBorder = getCssVariableValue('--surface-border');

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

    @if (playerRoundScoresResponse().data; as playerRoundScores) {
      <div class="h-3rem"></div>
      <p-chart type="line" [data]="data()" [options]="options" />
    } @else {
      <h4 class="mt-5 text-red-700">Error:</h4>
      <p>{{ playerRoundScoresResponse().error }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComparePointsOverTimePageComponent {
  readonly playerRoundScoresResponse =
    input.required<
      PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType>
    >(); // route resolve data

  private readonly documentStyle = getComputedStyle(document.documentElement);

  readonly options: ChartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor,
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

  private readonly numRounds = computed(
    () => this.playerRoundScoresResponse().data?.[0].scores.length ?? 1,
  );

  readonly data: Signal<ChartData> = computed(() => ({
    labels: Array.from(Array(this.numRounds() + 1).keys()),
    datasets:
      this.playerRoundScoresResponse().data?.map((player) => ({
        label: player.display_name,
        data: [0, ...player.scores],
        fill: false,
      })) ?? [],
  }));
}
