import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { GameboardSpaceModel } from '../../shared/util/supabase-types';
import { GameboardService } from '../../shared/data-access/gameboard.service';

export const editGameboardSpaceTypeResolver: ResolveFn<
  GameboardSpaceModel | null
> = (route) => {
  const gameboardService = inject(GameboardService);
  const gameboardSpaceId = Number(route.params['gameboardSpaceId']);

  return gameboardService.gameboardSpaces$.pipe(
    map(
      (spaces) =>
        spaces?.find((space) => space.id === gameboardSpaceId) ?? null,
    ),
  );
};
