import { Injectable, Signal, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTable,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { showErrorMessage } from '../../shared/util/message-helpers';
import { MessageService } from 'primeng/api';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { Database } from '../../shared/util/schema';
import { GameStateService } from '../../shared/data-access/game-state.service';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);

  readonly rules$: Observable<string | null> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Rules,
          `session_id=eq.${sessionId}`,
        ),
      ),
      map((rulesRecords) => rulesRecords[0].rules),
      shareReplay(1),
    );

  readonly rules: Signal<string | null | undefined> = toSignal(this.rules$);

  async saveRules(sessionId: number, rulesHtml: string): Promise<void> {
    const { error: saveRulesError } = await this.supabase
      .from(Table.Rules)
      .update({ rules: rulesHtml })
      .eq('session_id', sessionId);

    if (saveRulesError) {
      showErrorMessage(
        'Unable to save rules. Rules database select error.',
        this.messageService,
      );
      return;
    }

    showSuccessMessage('Rules saved successfully!', this.messageService);
  }
}
