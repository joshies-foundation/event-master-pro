import { Injectable, Signal, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { Observable, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Database } from '../util/schema';
import { Table, realtimeUpdatesFromTable } from '../util/supabase-helpers';
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
  readonly roundNumber$: Observable<number | null> = createSelector(
    this.gameState$,
    'round_number',
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
  readonly roundNumber: Signal<number | null | undefined> = toSignal(
    this.roundNumber$,
  );
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
