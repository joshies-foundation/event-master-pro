import { Pipe, PipeTransform } from '@angular/core';
import { PlayerDuelStats } from '../../shared/util/supabase-types';
import { ChartData } from 'chart.js';
import { getCssVariableValue } from '../../shared/util/css-helpers';

const maxBarThickness = 24;
const borderWidth = 2;
const borderRadius = 4;

@Pipe({
  name: 'playerDuelStatsChartData',
  standalone: true,
})
export class PlayerDuelStatsChartDataPipe implements PipeTransform {
  transform(player: PlayerDuelStats): ChartData {
    return {
      labels: [''],
      datasets: [
        {
          label: 'Points Won',
          data: [player.total_points_won],
          maxBarThickness,
          borderWidth,
          borderRadius,
          backgroundColor: `${getCssVariableValue('--color-green-500')}40`,
          borderColor: getCssVariableValue('--color-green-500'),
          datalabels: {
            display: player.total_points_won !== 0,
            color: getCssVariableValue('--color-text-color'),
          },
        },
        {
          label: 'Points Lost',
          data: [player.total_points_lost],
          maxBarThickness,
          borderWidth,
          borderRadius,
          backgroundColor: `${getCssVariableValue('--color-red-500')}40`,
          borderColor: getCssVariableValue('--color-red-500'),
          datalabels: {
            display: player.total_points_lost !== 0,
            color: getCssVariableValue('--color-text-color'),
          },
        },
      ],
    };
  }
}
