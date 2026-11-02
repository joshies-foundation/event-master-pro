import { Injectable, Signal, computed, inject } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { MessageService } from '@openng/optimus-ui/api';
import { Observable, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Database } from '../util/schema';
import {
  SessionStatus,
  Table,
  realtimeUpdatesFromTable,
  showMessageOnError,
  RoundPhase,
} from '../util/supabase-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameStateModel } from '../util/supabase-types';
import { LocalErrorResponse } from '../util/dialog-helpers';

type RoundPosition = Pick<GameStateModel, 'round_number' | 'round_phase'>;

type RoundMoveResponse =
  PostgrestSingleResponse<GameStateModel[]> | LocalErrorResponse;

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly messageService = inject(MessageService);

  readonly gameState$: Observable<GameStateModel> = realtimeUpdatesFromTable(
    this.supabase,
    Table.GameState,
    'id=eq.1',
  ).pipe(
    map((gameStateRecords) => gameStateRecords[0]),
    shareReplay(1),
  );

  // selectors (slices of state)
  readonly sessionId$: Observable<number> = createSelector(
    this.gameState$,
    'session_id',
  );
  readonly sessionStatus$: Observable<SessionStatus> = createSelector(
    this.gameState$,
    'session_status',
  ) as Observable<SessionStatus>;
  readonly roundNumber$: Observable<number> = createSelector(
    this.gameState$,
    'round_number',
  );
  readonly roundPhase$: Observable<RoundPhase> = createSelector(
    this.gameState$,
    'round_phase',
  ) as Observable<RoundPhase>;
  readonly gameMasterUserId$: Observable<string> = createSelector(
    this.gameState$,
    'game_master_user_id',
  );

  // signals
  readonly gameState: Signal<GameStateModel | undefined> = toSignal(
    this.gameState$,
  );
  readonly sessionId: Signal<number | undefined> = toSignal(this.sessionId$);
  readonly sessionStatus: Signal<SessionStatus | undefined> = toSignal(
    this.sessionStatus$,
  );
  readonly roundNumber: Signal<number | undefined> = toSignal(
    this.roundNumber$,
  );
  readonly roundPhase: Signal<RoundPhase | undefined> = toSignal(
    this.roundPhase$,
  );
  readonly gameMasterUserId: Signal<string | undefined> = toSignal(
    this.gameMasterUserId$,
  );

  readonly sessionHasNotStarted = computed(
    () => this.sessionStatus() === SessionStatus.NotStarted,
  );

  readonly sessionIsInProgress = computed(
    () => this.sessionStatus() === SessionStatus.InProgress,
  );

  readonly sessionIsFinished = computed(
    () => this.sessionStatus() === SessionStatus.Finished,
  );

  readonly sessionIsInProgressOrFinished = computed(
    () => this.sessionStatus() !== SessionStatus.NotStarted,
  );

  changeGameMaster(
    newGmUserId: string,
  ): Promise<PostgrestSingleResponse<null>> {
    return showMessageOnError(
      this.supabase
        .from(Table.GameState)
        .update({ game_master_user_id: newGmUserId })
        .eq('id', 1),
      this.messageService,
    );
  }

  async setRoundPhase({
    from,
    to,
  }: {
    from: RoundPhase;
    to: RoundPhase;
  }): Promise<RoundMoveResponse> {
    return this.moveRound(
      { round_number: this.roundNumber(), round_phase: from },
      { round_phase: to },
    );
  }

  async setRoundNumberAndPhase({
    from,
    to,
  }: {
    from: RoundPosition;
    to: RoundPosition;
  }): Promise<RoundMoveResponse> {
    return this.moveRound(from, to);
  }

  private async moveRound(
    from: Partial<RoundPosition>,
    to: Partial<RoundPosition>,
  ): Promise<RoundMoveResponse> {
    const response = await this.supabase
      .from(Table.GameState)
      .update(to)
      .eq('id', 1)
      .match(from)
      .select();

    if (!response.error && response.data.length === 0) {
      return {
        error: {
          message:
            'The round already moved on. Check the current phase and try again.',
        },
      };
    }
    return response;
  }

  async updateGameState(
    partialGameState: Partial<GameStateModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameState)
      .update(partialGameState)
      .eq('id', 1);
  }

  fetchGameState(): PromiseLike<
    PostgrestSingleResponse<
      Pick<GameStateModel, 'session_id' | 'round_number' | 'round_phase'>
    >
  > {
    return this.supabase
      .from(Table.GameState)
      .select('session_id, round_number, round_phase')
      .eq('id', 1)
      .single();
  }

  roundPhaseOrderIndex(roundPhase: RoundPhase): number {
    switch (roundPhase) {
      case RoundPhase.GameboardMoves:
        return 0;
      case RoundPhase.SpecialSpaceEvents:
        return 1;
      case RoundPhase.Duels:
        return 2;
      case RoundPhase.ChaosSpaceEvents:
        return 3;
      case RoundPhase.Event:
        return 4;
      case RoundPhase.WaitingForNextRound:
        return 5;
    }
  }

  phaseIsOver(roundPhase: RoundPhase): boolean | null {
    const currentRoundPhase = this.roundPhase();
    if (!currentRoundPhase) {
      return null;
    }
    return (
      this.roundPhaseOrderIndex(currentRoundPhase) >
      this.roundPhaseOrderIndex(roundPhase)
    );
  }
}

function createSelector<
  BaseStateType,
  PropertyType extends keyof BaseStateType,
>(
  state: Observable<BaseStateType>,
  property: PropertyType,
): Observable<BaseStateType[PropertyType]> {
  return state.pipe(
    map((state) => state[property]),
    distinctUntilChanged(),
    shareReplay(1),
  );
}
