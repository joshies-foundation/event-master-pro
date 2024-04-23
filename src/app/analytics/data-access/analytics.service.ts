import { inject, Injectable, Signal } from '@angular/core';
import { distinctUntilChanged, from, map, Observable, switchMap } from 'rxjs';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import {
  Function,
  realtimeUpdatesFromTable,
  Table,
  View,
} from '../../shared/util/supabase-helpers';
import { SessionService } from '../../shared/data-access/session.service';
import {
  distinctUntilIdChanged,
  whenNotNull,
} from '../../shared/util/rxjs-helpers';
import {
  PlayerService,
  PlayerWithUserInfo,
} from '../../shared/data-access/player.service';
import { Database } from '../../shared/util/schema';
import {
  LifetimeUserStatsModel,
  GetPlayerRoundScoreFunctionReturnType,
  TransactionModel,
} from '../../shared/util/supabase-types';
import { toSignal } from '@angular/core/rxjs-interop';

export interface IdAndName {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly sessionService = inject(SessionService);
  private playerService = inject(PlayerService);

  readonly transactions$: Observable<TransactionModel[] | null> =
    this.playerService.userPlayer$.pipe(
      distinctUntilChanged((a, b) => a?.player_id === b?.player_id),
      whenNotNull((player) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Transaction,
          `player_id=eq.${player.player_id}`,
        ).pipe(map((transactions) => transactions.sort((a, b) => b.id - a.id))),
      ),
    );

  readonly transactions: Signal<TransactionModel[] | null | undefined> =
    toSignal(this.transactions$);

  getAllPreviousSessions(): Observable<IdAndName[]> {
    return this.sessionService.session$.pipe(
      distinctUntilIdChanged(),
      switchMap((session) => {
        let query = this.supabase.from(Table.Session).select('id, name');

        // if there is an active session, filter out the active session
        query = session ? query.filter('id', 'neq', session.id) : query;

        query = query.order('id', { ascending: false });

        return from(query).pipe(
          map((response) => (response.data ? response.data : [])),
        );
      }),
    );
  }

  getAllScoresFromSession(sessionId: number): Observable<PlayerWithUserInfo[]> {
    return from(
      this.supabase.rpc(Function.GetAllScoresFromSession, {
        sessionid: sessionId,
      }),
    ).pipe(
      map(
        (response) =>
          (response.data
            ? response.data
            : []) as unknown as PlayerWithUserInfo[],
      ),
    );
  }

  getLifetimeUserStats(): Observable<
    PostgrestResponse<LifetimeUserStatsModel>
  > {
    return from(this.supabase.from(View.LifetimeUserStats).select('*'));
  }

  getTransactionsForPlayer(
    playerId: number,
  ): Observable<PostgrestResponse<TransactionModel>> {
    return from(
      this.supabase
        .from(Table.Transaction)
        .select('*')
        .eq('player_id', playerId)
        .order('id', { ascending: false }),
    );
  }

  getPlayerRoundScoresFromSession(
    sessionId: number,
  ): Observable<
    PostgrestSingleResponse<GetPlayerRoundScoreFunctionReturnType>
  > {
    return from(
      this.supabase.rpc(Function.GetPlayerRoundScoresFromSession, {
        sessionid: sessionId,
      }),
    );
  }
}
