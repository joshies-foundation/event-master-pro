import { Injectable, inject } from '@angular/core';
import {
  Filter,
  realtimeUpdatesFromTable,
  showMessageOnError,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { map, of, shareReplay } from 'rxjs';
import { whenNotNull } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { showErrorMessage } from '../util/error-helpers';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase = inject(SupabaseClient);
  private readonly messageService = inject(MessageService);

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

  async createSession(
    sessionName: string,
    gameMasterUserId: string,
    startDate: Date,
    endDate: Date,
    playerUserIds: string[],
  ): Promise<void> {
    // add a row to the session table with this session's parameters
    const { data: sessionRows, error: insertSessionError } = await this.supabase
      .from(Table.Session)
      .insert({
        name: sessionName,
        game_master_user_id: gameMasterUserId,
        start_date: startDate,
        end_date: endDate,
      })
      .select();

    if (insertSessionError) {
      showErrorMessage(
        'Unable to create session. Session database table insertion error.',
        this.messageService,
      );
      return;
    }

    const sessionId = sessionRows[0].id;

    // add rows to player table with this session's id and the selected players' user id's
    const { error: insertPlayersError } = await this.supabase
      .from(Table.Player)
      .insert(
        playerUserIds.map((playerUserId) => ({
          user_id: playerUserId,
          session_id: sessionId,
        })),
      );

    if (insertPlayersError) {
      showErrorMessage(
        'Unable to add players to new session. Player database table update error.',
        this.messageService,
      );
      return;
    }

    // get latest rules to copy over to new session
    const { data: rulesRows, error: getLatestRulesError } = await this.supabase
      .from(Table.Rules)
      .select('rules')
      .order('id', { ascending: false })
      .limit(1);

    if (getLatestRulesError) {
      showErrorMessage(
        'Unable to get latest rules to copy over to this session. Rules database select error.',
        this.messageService,
      );
      return;
    }

    // add rules for new session
    const { error: insertRulesError } = await this.supabase
      .from(Table.Rules)
      .insert({
        session_id: sessionId,
        rules: rulesRows[0].rules,
      });

    if (insertRulesError) {
      showErrorMessage(
        'Unable to add rules to this session. Rules database insert error.',
        this.messageService,
      );
      return;
    }

    // update the active session table with this sessions id
    const { error: updateActiveSessionError } = await this.supabase
      .from(Table.ActiveSession)
      .update({
        session_id: sessionId,
      })
      .eq('id', 1);

    if (updateActiveSessionError) {
      showErrorMessage(
        'Unable to activate new session. Active session database table update error.',
        this.messageService,
      );
      return;
    }
  }

  async endSession(): Promise<void> {
    showMessageOnError(
      this.supabase
        .from(Table.ActiveSession)
        .update({
          session_id: null,
        })
        .eq('id', 1),
      this.messageService,
      'Unable to end session.',
    );
  }
}
