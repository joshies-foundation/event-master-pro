import { Injectable, computed } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTableAsSignal,
} from '../../shared/util/supabase-helpers';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly allRules = realtimeUpdatesFromTableAsSignal(Table.Rules);

  readonly rules = computed(() => this.allRules()[0].rules);
}
