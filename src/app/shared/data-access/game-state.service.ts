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
} from '../util/supabase-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameStateModel, SessionStatusType } from '../util/supabase-types';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly messageService = inject(MessageService);

  readonly gameState$: Observable<GameStateModel> = realtimeUpdatesFromTable(
    this.supabase,
    Table.GameState,
  ).pipe(
    map((gameStateRecords) => gameStateRecords[0]),
    shareReplay(1),
  );

  // selectors (slices of state)
  readonly sessionId$: Observable<number | null> = createSelector(
    this.gameState$,
    'session_id',
  );
  readonly thereIsAnActiveSession$: Observable<boolean> = this.sessionId$.pipe(
    map((activeSessionId) => activeSessionId !== null),
    shareReplay(1),
  );
  readonly sessionStatus$: Observable<SessionStatusType> = createSelector(
    this.gameState$,
    'session_status',
  );
  readonly roundNumber$: Observable<number | null> = createSelector(
    this.gameState$,
    'round_number',
  );
  readonly gameMasterUserId$: Observable<string> = createSelector(
    this.gameState$,
    'game_master_user_id',
  );

  // signals
  readonly gameState: Signal<GameStateModel | undefined> = toSignal(
    this.gameState$,
  );
  readonly sessionId: Signal<number | null | undefined> = toSignal(
    this.sessionId$,
  );
  readonly thereIsAnActiveSession: Signal<boolean | undefined> = toSignal(
    this.thereIsAnActiveSession$,
  );
  readonly sessionStatus: Signal<SessionStatusType | undefined> = toSignal(
    this.sessionStatus$,
  );
  readonly roundNumber: Signal<number | null | undefined> = toSignal(
    this.roundNumber$,
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
