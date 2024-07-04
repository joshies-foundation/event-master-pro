import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PostgrestResponse } from '@supabase/supabase-js';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { SpecialSpaceEventsForCurrentRoundModel } from '../../shared/util/supabase-types';

export const specialSpaceEventsForCurrentRoundResolver: ResolveFn<
  PostgrestResponse<SpecialSpaceEventsForCurrentRoundModel>
> = () => inject(GameboardService).getSpecialSpaceEventsForCurrentRound();
