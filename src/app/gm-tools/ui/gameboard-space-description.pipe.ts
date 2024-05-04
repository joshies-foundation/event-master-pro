import { Pipe, PipeTransform, inject } from '@angular/core';
import { GameboardSpaceEffectWithData } from '../../shared/util/supabase-types';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'gameboardSpaceDescription',
  standalone: true,
})
export class GameboardSpaceDescriptionPipe implements PipeTransform {
  private readonly decimalPipe = inject(DecimalPipe);

  transform(gameboardSpace: GameboardSpaceEffectWithData): string {
    switch (gameboardSpace.effect) {
      case GameboardSpaceEffect.GainPoints:
        return `
          <p class="m-0">
            ${gameboardSpace.effect_data.pointsGained < 0 ? 'Lose' : 'Gain'}
            ${this.decimalPipe.transform(Math.abs(gameboardSpace.effect_data.pointsGained))} points
          </p>
        `;

      case GameboardSpaceEffect.GainPointsOrDoActivity:
        return `
          <p class="m-0">
            ${gameboardSpace.effect_data.pointsGained < 0 ? 'Lose' : 'Gain'}
            ${this.decimalPipe.transform(Math.abs(gameboardSpace.effect_data.pointsGained))} points
          </p>
          <p class="my-1"><strong>OR</strong></p>
          <p class="m-0">
            ${gameboardSpace.effect_data.activity.description}
          </p>
        `;

      default:
        return `Unknown gameboard_space_effect: "${(gameboardSpace as { effect: string }).effect}"`;
    }
  }
}
