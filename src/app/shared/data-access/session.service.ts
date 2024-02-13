import { Injectable, inject } from '@angular/core';
import {
  Filter,
  realtimeUpdatesFromTable,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { map, of, shareReplay } from 'rxjs';
import { whenNotNull } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase = inject(SupabaseClient);

  private readonly activeSessionId$ = realtimeUpdatesFromTable(
    this.supabase,
    Table.ActiveSession,
  ).pipe(
    map((activeSessionRecords) => activeSessionRecords[0].session_id),
    shareReplay(1),
  );

  readonly thereIsAnActiveSession$ = this.activeSessionId$.pipe(
    map((activeSessionId) => activeSessionId !== null),
    shareReplay(1),
  );

  readonly thereIsAnActiveSession = toSignal(this.thereIsAnActiveSession$);

  readonly session$ = this.activeSessionId$.pipe(
    whenNotNull((activeSessionId) =>
      realtimeUpdatesFromTable(
        this.supabase,
        Table.Session,
        `id=eq.${activeSessionId}` as Filter<Table.Session>,
      ).pipe(map((sessionRecords) => sessionRecords[0])),
    ),
    shareReplay(1),
  );

  readonly session = toSignal(this.session$);

  readonly gameMasterUserId$ = this.session$.pipe(
    whenNotNull((session) => of(session!.game_master_user_id)),
    shareReplay(1),
  );
}
