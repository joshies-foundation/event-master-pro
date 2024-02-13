import { Injectable, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTable,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { map, shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase = inject(SupabaseClient);

  readonly rules$ = realtimeUpdatesFromTable(this.supabase, Table.Rules).pipe(
    map((rulesRecords) => rulesRecords[0].rules),
    shareReplay(1),
  );

  readonly rules = toSignal(this.rules$);
}
