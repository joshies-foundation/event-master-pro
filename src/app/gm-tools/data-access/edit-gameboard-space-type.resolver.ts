import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SessionService } from '../../shared/data-access/session.service';
import { map } from 'rxjs';
import { GameboardSpaceModel } from '../../shared/util/supabase-types';

export const editGameboardSpaceTypeResolver: ResolveFn<
  GameboardSpaceModel | null
> = (route) => {
  const sessionService = inject(SessionService);
  const gameboardSpaceId = Number(route.params['gameboardSpaceId']);

  return sessionService.gameboardSpaces$.pipe(
    map(
      (spaces) =>
        spaces?.find((space) => space.id === gameboardSpaceId) ?? null,
    ),
  );
};
