import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { BetModel, PlayerModel } from '../../shared/util/supabase-types';
import { BetStatus } from '../../shared/util/supabase-helpers';
import { BetComponent } from '../../shared/ui/bet.component';

@Component({
  selector: 'joshies-bet-awaiting-acceptance',
  imports: [BetComponent, Button, BetComponent],
  template: `
    <joshies-bet [bet]="bet()" [userPlayerId]="userPlayerId()" />

    <!-- Cancel Bet Button -->
    <p-button
      label="Cancel Bet Request"
      severity="danger"
      icon="pi pi-times"
      styleClass="w-full mt-3 mb-2"
      [loading]="submitting() && bet().id === cancelingBetId()"
      [disabled]="submitting()"
      (onClick)="onCancelBetButtonClick()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BetToResolveComponent {
  readonly bet = input.required<BetModel>();
  readonly userPlayerId = input.required<PlayerModel['id']>();
  readonly submitting = input.required<boolean>();
  readonly cancelingBetId = input.required<BetModel['id'] | null>();

  readonly cancelBet = output();

  onCancelBetButtonClick(): void {
    this.cancelBet.emit();
  }

  protected readonly BetStatus = BetStatus;
}
