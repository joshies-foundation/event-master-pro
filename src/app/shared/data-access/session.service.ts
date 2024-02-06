import { Injectable, computed, inject } from '@angular/core';
import {
  Filter,
  realtimeUpdatesFromTableAsSignal,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase = inject(SupabaseClient);

  private readonly activeSessionRecords = realtimeUpdatesFromTableAsSignal(
    this.supabase,
    Table.ActiveSession,
  );

  private readonly activeSessionId = computed(
    () => this.activeSessionRecords()[0]?.session_id,
  );

  private readonly sessionRecords = realtimeUpdatesFromTableAsSignal(
    this.supabase,
    Table.Session,
    computed(() => `id=eq.${this.activeSessionId()}` as Filter<Table.Session>),
  );

  readonly session = computed(() => this.sessionRecords()?.[0]);

  readonly gameMasterUserId = computed(
    () => this.session().game_master_user_id,
  );

  // private readonly allGameMasters = realtimeUpdatesFromTableAsSignal(
  //   Table.GameMaster,
  // );

  // readonly gameMasterUserId = computed(() => this.allGameMasters()[0].user_id);

  // readonly userIsGameMaster = computed(
  //   () => this.userService.user().id === this.gameMasterUserId(),
  // );
}
