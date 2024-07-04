import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { LifetimeUserStatsModel } from '../../shared/util/supabase-types';
import { PostgrestResponse } from '@supabase/supabase-js';

export const lifetimeStatsResolver: ResolveFn<
  PostgrestResponse<LifetimeUserStatsModel>
> = () => inject(AnalyticsService).getLifetimeUserStats();
