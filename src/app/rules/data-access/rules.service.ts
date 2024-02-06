import { Injectable, computed, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTableAsSignal,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase = inject(SupabaseClient);

  private readonly allRules = realtimeUpdatesFromTableAsSignal(
    this.supabase,
    Table.Rules,
  );

  readonly rules = computed(() => this.allRules()[0].rules);
}
