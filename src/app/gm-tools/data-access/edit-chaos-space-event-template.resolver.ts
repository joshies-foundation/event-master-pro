import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { ChaosSpaceEventTemplateModel } from '../../shared/util/supabase-types';
import { map } from 'rxjs';
import { onceConfirmed } from '../../shared/util/supabase-helpers';

export const editChaosSpaceEventTemplateResolver: ResolveFn<
  ChaosSpaceEventTemplateModel | null
> = (route) => {
  const gameboardService = inject(GameboardService);
  const chaosSpaceEventTemplateId = Number(
    route.params['chaosSpaceEventTemplateId'],
  );

  return onceConfirmed(gameboardService.chaosSpaceEventTemplates$).pipe(
    map(
      (spaces) =>
        spaces?.find((space) => space.id === chaosSpaceEventTemplateId) ?? null,
    ),
  );
};
