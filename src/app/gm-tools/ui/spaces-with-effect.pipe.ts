import { Pipe, PipeTransform } from '@angular/core';
import { GameboardSpaceModel } from '../../shared/util/supabase-types';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';

@Pipe({
  name: 'spacesWithEffect',
  standalone: true,
})
export class SpacesWithEffectPipe implements PipeTransform {
  transform(
    spaces: GameboardSpaceModel[],
    effect: GameboardSpaceEffect,
  ): GameboardSpaceModel[] {
    return spaces.filter((space) => space.effect === effect);
  }
}
