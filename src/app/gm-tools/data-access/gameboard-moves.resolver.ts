import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PostgrestResponse } from '@supabase/supabase-js';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { MovesForCurrentRoundModel } from '../../shared/util/supabase-types';

export const gameboardMovesResolver: ResolveFn<
  PostgrestResponse<MovesForCurrentRoundModel>
> = () => inject(GameboardService).getMovesForCurrentRound();
