import { inject, Injectable } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { DuelModel, PlayerModel } from '../util/supabase-types';
import {
  DuelStatus,
  Function,
  realtimeUpdatesFromTable,
  Table,
} from '../util/supabase-helpers';
import { PlayerService } from './player.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class DuelService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);

  readonly duels$: Observable<DuelModel[]> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Duel,
          `session_id=eq.${sessionId}`,
        ).pipe(
          map((events) =>
            events.sort((a, b) => a.round_number - b.round_number),
          ),
        ),
      ),
      switchMap((duels) => {
        if (!duels?.length) return of([]);

        return this.playerService.players$.pipe(
          map((players) =>
            duels
              .sort((a, b) => a.id - b.id)
              .map((duel) => {
                const challenger = players?.find(
                  (p) => p.player_id === duel.challenger_player_id,
                );
                const opponent = players?.find(
                  (p) => p.player_id === duel.opponent_player_id,
                );

                return {
                  ...(duel as DuelModel),
                  challenger,
                  opponent,
                };
              }),
          ),
        );
      }),
      shareReplay(1),
    );

  readonly duelsForThisTurn$: Observable<DuelModel[]> =
    this.gameStateService.roundNumber$.pipe(
      switchMap((roundNumber) =>
        this.duels$.pipe(
          map((duels) =>
            duels.filter((duel) => duel.round_number === roundNumber),
          ),
        ),
      ),
      shareReplay(1),
    );

  readonly duelsForThisTurn = toSignal(this.duelsForThisTurn$);

  readonly nonCanceledDuelsForThisTurn$: Observable<DuelModel[]> =
    this.duelsForThisTurn$.pipe(
      map((duels) =>
        duels.filter((duel) => duel.status !== DuelStatus.Canceled),
      ),
      shareReplay(1),
    );

  readonly allDuelsForThisTurnAreResolved$: Observable<boolean> =
    this.duelsForThisTurn$.pipe(
      map((duels) =>
        !duels.length // return true if there are no special space events
          ? true
          : duels.every((duel) =>
              [
                DuelStatus.ChallengerWon,
                DuelStatus.OpponentWon,
                DuelStatus.Canceled,
              ].includes(duel.status),
            ),
      ),
      shareReplay(1),
    );

  async selectOpponent(
    duelId: DuelModel['id'],
    opponentPlayerId: PlayerModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Duel)
      .update({
        opponent_player_id: opponentPlayerId,
        status: DuelStatus.WagerNotSelected,
      })
      .eq('id', duelId);
  }

  async selectWagerPercentage(
    duelId: DuelModel['id'],
    wagerPercentage: DuelModel['wager_percentage'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Duel)
      .update({
        wager_percentage: wagerPercentage,
        status: DuelStatus.GameNotSelected,
      })
      .eq('id', duelId);
  }

  async selectGame(
    duelId: DuelModel['id'],
    game: DuelModel['game_name'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Duel)
      .update({
        game_name: game,
        status: DuelStatus.WaitingToBegin,
      })
      .eq('id', duelId);
  }

  async startDuel(
    duelId: DuelModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Duel)
      .update({
        status: DuelStatus.InProgress,
      })
      .eq('id', duelId);
  }

  async submitDuelResults(
    duelId: DuelModel['id'],
    challengerWon: boolean,
    playerScoreChanges: Record<PlayerModel['id'], number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.SubmitDuelResults, {
      duel_id: duelId,
      challenger_won: challengerWon,
      player_score_changes: playerScoreChanges,
    });
  }

  async cancelDuel(
    duelId: DuelModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Duel)
      .update({
        status: DuelStatus.Canceled,
      })
      .eq('id', duelId);
  }
}
