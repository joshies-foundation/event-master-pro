import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { SpecialSpaceEventTemplateModel } from '../../shared/util/supabase-types';
import { map } from 'rxjs';

export const editSpecialSpaceEventTemplateResolver: ResolveFn<
  SpecialSpaceEventTemplateModel | null
> = (route) => {
  const gameboardService = inject(GameboardService);
  const specialSpaceEventTemplateId = Number(
    route.params['specialSpaceEventTemplateId'],
  );

  return gameboardService.specialSpaceEventTemplates$.pipe(
    map(
      (spaces) =>
        spaces?.find((space) => space.id === specialSpaceEventTemplateId) ??
        null,
    ),
  );
};
