import { computed, inject, Injectable } from '@angular/core';
import {
  Filter,
  realtimeUpdatesFromTableAsSignal,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly supabase = inject(SupabaseClient);
  private readonly sessionService = inject(SessionService);

  readonly players = realtimeUpdatesFromTableAsSignal(
    this.supabase,
    Table.Player,
    computed(
      () =>
        `session_id=eq.${this.sessionService.session()
          ?.id}` as Filter<Table.Player>,
    ),
  );
}
