import { inject, Injectable, Signal } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../util/schema';
import { BetModel, OmitAutoGeneratedColumns } from '../util/supabase-types';
import { realtimeUpdatesFromTable, Table } from '../util/supabase-helpers';
import { map, Observable, switchMap, shareReplay } from 'rxjs';
import { GameStateService } from './game-state.service';
import { PlayerService } from './player.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class BetService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);

  readonly bets$: Observable<BetModel[]> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Bet,
          `session_id=eq.${sessionId}`,
        ).pipe(map((bets) => bets.sort((a, b) => a.id - b.id))),
      ),
      shareReplay(1),
    );

  readonly bets: Signal<BetModel[] | null | undefined> = toSignal(this.bets$);

  async createBet(
    bet: OmitAutoGeneratedColumns<BetModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase.from(Table.Bet).insert(bet);
  }
}
