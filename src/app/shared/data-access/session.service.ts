import { Injectable, Signal, inject } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  Table,
  Function,
  SessionStatus,
} from '../util/supabase-helpers';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import {
  Observable,
  concat,
  map,
  of,
  shareReplay,
  switchMap,
  takeWhile,
  timer,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionModel } from '../util/supabase-types';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';
import { whenNotNull } from '../util/rxjs-helpers';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);

  readonly session$: Observable<SessionModel> =
    this.gameStateService.sessionId$.pipe(
      switchMap((activeSessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Session,
          `id=eq.${activeSessionId}`,
        ).pipe(map((sessionRecords) => sessionRecords[0])),
      ),
      shareReplay(1),
    );

  readonly session: Signal<SessionModel | undefined> = toSignal(this.session$);

  private readonly countdown$: Observable<Countdown | null> =
    this.session$.pipe(
      whenNotNull((session) =>
        concat(
          timer(0, 1000).pipe(
            map(
              () =>
                (new Date(session.start_date).getTime() - Date.now()) / 1000,
            ),
            takeWhile((secondsRemaining) => secondsRemaining >= 0),
            map(
              (secondsRemaining): Countdown => ({
                days: Math.floor(secondsRemaining / (3600 * 24)),
                hours: Math.floor((secondsRemaining % (3600 * 24)) / 3600),
                minutes: Math.floor((secondsRemaining % 3600) / 60),
                seconds: Math.floor(secondsRemaining % 60),
              }),
            ),
          ),
          of(null),
        ),
      ),
    );

  readonly countdown: Signal<Countdown | null | undefined> = toSignal(
    this.countdown$,
  );

  async createSession(
    sessionName: string,
    startDate: Date,
    endDate: Date,
    numRounds: number,
    playerUserIds: string[],
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.CreateSession, {
      session_name: sessionName,
      session_start_date: startDate.toISOString(),
      session_end_date: endDate.toISOString(),
      num_rounds: numRounds,
      player_user_ids: playerUserIds,
    });
  }

  async updateSession(
    sessionId: SessionModel['id'],
    partialSession: Partial<SessionModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Session)
      .update(partialSession)
      .eq('id', sessionId);
  }

  async startSession(): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameState)
      .update({
        session_status: SessionStatus.InProgress,
      })
      .eq('id', 1);
  }

  async startSessionEarly(): Promise<PostgrestSingleResponse<undefined>> {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // convert to UTC

    return this.supabase.rpc(Function.StartSessionEarly, {
      now: now.toISOString(),
    });
  }

  async endSession(): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameState)
      .update({
        session_status: SessionStatus.Finished,
      })
      .eq('id', 1);
  }

  async submitSessionPointsForEvent(
    roundNumber: number,
    teamScoreChanges: Record<string, number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.EndRound, {
      _round_number: roundNumber,
      team_score_changes: teamScoreChanges,
    });
  }

  async overrideBankBalanceAdd(
    sessionId: number,
    numPointsToAdd: number,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.OverrideBankBalance, {
      data: { sessionId, change: numPointsToAdd, replace: false },
    });
  }

  async overrideBankBalanceReplace(
    sessionId: number,
    newBankBalance: number,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.OverrideBankBalance, {
      data: { sessionId, change: newBankBalance, replace: true },
    });
  }

  async getAllSessions(): Promise<PostgrestResponse<SessionModel>> {
    return this.supabase.from(Table.Session).select('*');
  }
}
