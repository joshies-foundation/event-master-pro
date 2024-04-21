import { Injectable, Signal, inject } from '@angular/core';
import {
  Table,
  realtimeUpdatesFromTable,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, map, shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionService } from '../../shared/data-access/session.service';
import {
  distinctUntilIdChanged,
  whenNotNull,
} from '../../shared/util/rxjs-helpers';
import { showErrorMessage } from '../../shared/util/message-helpers';
import { MessageService } from 'primeng/api';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { Database } from '../../shared/util/schema';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);

  readonly rules$: Observable<string | null> =
    this.sessionService.session$.pipe(
      distinctUntilIdChanged(),
      whenNotNull((session) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Rules,
          `session_id=eq.${session.id}`,
        ).pipe(map((rulesRecords) => rulesRecords[0].rules)),
      ),
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
