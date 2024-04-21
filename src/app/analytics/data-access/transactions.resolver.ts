import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { TransactionModel } from '../../shared/util/supabase-types';
import { PostgrestResponse } from '@supabase/supabase-js';
import { PlayerService } from '../../shared/data-access/player.service';
import { of, switchMap } from 'rxjs';

export const transactionsResolver: ResolveFn<
  PostgrestResponse<TransactionModel> | null
> = () => {
  const playerService = inject(PlayerService);
  const analyticsService = inject(AnalyticsService);

  return playerService.userPlayer$.pipe(
    switchMap((player) =>
      player
        ? analyticsService.getTransactionsForPlayer(player.player_id)
        : of(null),
    ),
  );
};
