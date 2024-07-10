import { Injectable, Signal, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTable,
} from '../../shared/util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Database } from '../../shared/util/schema';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { RulesModel } from '../../shared/util/supabase-types';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);

  readonly rules$: Observable<RulesModel> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Rules,
          `session_id=eq.${sessionId}`,
        ),
      ),
      map((rulesRecords) => rulesRecords[0]),
      shareReplay(1),
    );

  readonly rules: Signal<RulesModel | undefined> = toSignal(this.rules$);

  async updateRules(
    sessionId: number,
    partialRules: Partial<RulesModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Rules)
      .update(partialRules)
      .eq('session_id', sessionId);
  }
}
