import { Injectable, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTable,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { map, shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionService } from '../../shared/data-access/session.service';
import { whenNotNull } from '../../shared/util/rxjs-helpers';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase = inject(SupabaseClient);
  private readonly sessionService = inject(SessionService);

  readonly rules$ = this.sessionService.session$.pipe(
    whenNotNull((session) =>
      realtimeUpdatesFromTable(
        this.supabase,
        Table.Rules,
        `session_id=eq.${session.id}`,
      ).pipe(map((rulesRecords) => rulesRecords[0].rules)),
    ),
    shareReplay(1),
  );

  readonly rules = toSignal(this.rules$);
}
