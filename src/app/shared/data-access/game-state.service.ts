import { Injectable, Signal, computed, inject } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
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
  readonly bankBalance$: Observable<number> = createSelector(
    this.gameState$,
    'bank_balance',
  );
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
  readonly bankBalance: Signal<number | undefined> = toSignal(
    this.bankBalance$,
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
