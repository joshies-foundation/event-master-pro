import { Injectable, Signal, inject } from '@angular/core';
import {
  Filter,
  realtimeUpdatesFromTable,
  showMessageOnError,
  Table,
  Function,
} from '../util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Observable, map, of, shareReplay } from 'rxjs';
import { distinctUntilIdChanged, whenNotNull } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { showErrorMessage } from '../util/message-helpers';
import { MessageService } from 'primeng/api';
import { SessionModel } from '../util/supabase-types';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);

  readonly session$: Observable<SessionModel | null> =
    this.gameStateService.sessionId$.pipe(
      whenNotNull((activeSessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Session,
          `id=eq.${activeSessionId}` as Filter<Table.Session>,
        ).pipe(map((sessionRecords) => sessionRecords[0])),
      ),
      shareReplay(1),
    );

  readonly session: Signal<SessionModel | null | undefined> = toSignal(
    this.session$,
  );

  readonly gameMasterUserId$: Observable<string | null> = this.session$.pipe(
    distinctUntilIdChanged(),
    whenNotNull((session) => of(session!.game_master_user_id)),
    shareReplay(1),
  );

  async createSession(
    sessionName: string,
    gameMasterUserId: string,
    startDate: Date,
    endDate: Date,
    numRounds: number,
    playerUserIds: string[],
  ): Promise<void> {
    // add a row to the session table with this session's parameters
    const { data: sessionRows, error: insertSessionError } = await this.supabase
      .from(Table.Session)
      .insert({
        name: sessionName,
        game_master_user_id: gameMasterUserId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        num_rounds: numRounds,
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
      .from(Table.GameState)
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
        .from(Table.GameState)
        .update({
          session_id: null,
        })
        .eq('id', 1),
      this.messageService,
      'Unable to end session.',
    );
  }

  async endRound(
    roundNumber: number,
    playerScoreChanges: Record<string, number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.EndRound, {
      score_changes: { roundNumber, playerScoreChanges },
    });
  }
}
