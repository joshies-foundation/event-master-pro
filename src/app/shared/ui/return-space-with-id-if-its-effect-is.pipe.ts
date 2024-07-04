import { Pipe, PipeTransform } from '@angular/core';
import { GameboardSpaceModel } from '../util/supabase-types';
import { GameboardSpaceEffect } from '../util/supabase-helpers';

@Pipe({
  name: 'returnSpaceWithIdIfItsEffectIs',
  standalone: true,
})
export class ReturnSpaceWithIdIfItsEffectIsPipe implements PipeTransform {
  transform<T extends GameboardSpaceEffect>(
    spaces: GameboardSpaceModel[],
    id: GameboardSpaceModel['id'],
    effect: T,
  ): GameboardSpaceModel<T> | undefined {
    return spaces.find(
      (space) => space.id === id && space.effect === effect,
    ) as GameboardSpaceModel<T> | undefined;
  }
}
