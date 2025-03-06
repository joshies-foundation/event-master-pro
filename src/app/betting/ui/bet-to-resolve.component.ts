import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { BetModel } from '../../shared/util/supabase-types';
import { BetStatus } from '../../shared/util/supabase-helpers';
import { BetComponent } from '../../shared/ui/bet.component';

@Component({
  selector: 'joshies-bet-to-resolve',
  imports: [BetComponent, Button, BetComponent],
  template: `
    <joshies-bet [bet]="bet()" />

    <div class="grid mt-2">
      <!-- Requester Wins Button -->
      <p-button
        [label]="bet().requester?.display_name + ' Wins'"
        severity="success"
        icon="pi pi-check"
        class="col"
        styleClass="w-full"
        [hidden]="bet().status === BetStatus.PendingAcceptance"
        [loading]="submitting() && bet().id === requesterWinningBetId()"
        [disabled]="submitting()"
        (onClick)="onRequesterWinsButtonClick()"
      />

      <!-- Opponent Wins Button -->
      <p-button
        [label]="bet().opponent?.display_name + ' Wins'"
        severity="success"
        icon="pi pi-check"
        class="col"
        styleClass="w-full"
        [hidden]="bet().status === BetStatus.PendingAcceptance"
        [loading]="submitting() && bet().id === opponentWinningBetId()"
        [disabled]="submitting()"
        (onClick)="onOpponentWinsButtonClick()"
      />
    </div>

    <div class="grid">
      <!-- Push Button -->
      <p-button
        label="Push"
        severity="warning"
        icon="pi pi-equals"
        class="col"
        styleClass="w-full"
        [hidden]="bet().status === BetStatus.PendingAcceptance"
        [loading]="submitting() && bet().id === pushingBetId()"
        [disabled]="submitting()"
        (onClick)="onPushButtonClick()"
      />

      <!-- Cancel Bet Button -->
      <p-button
        label="Cancel Bet"
        severity="danger"
        icon="pi pi-times"
        class="col"
        styleClass="w-full"
        [loading]="submitting() && bet().id === cancelingBetId()"
        [disabled]="submitting()"
        (onClick)="onCancelBetButtonClick()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BetToResolveComponent {
  readonly bet = input.required<BetModel>();
  readonly submitting = input.required<boolean>();
  readonly requesterWinningBetId = input.required<BetModel['id'] | null>();
  readonly opponentWinningBetId = input.required<BetModel['id'] | null>();
  readonly pushingBetId = input.required<BetModel['id'] | null>();
  readonly cancelingBetId = input.required<BetModel['id'] | null>();

  readonly requesterWins = output();
  readonly opponentWins = output();
  readonly push = output();
  readonly cancelBet = output();

  onRequesterWinsButtonClick(): void {
    this.requesterWins.emit();
  }

  onOpponentWinsButtonClick(): void {
    this.opponentWins.emit();
  }

  onPushButtonClick(): void {
    this.push.emit();
  }

  onCancelBetButtonClick(): void {
    this.cancelBet.emit();
  }

  protected readonly BetStatus = BetStatus;
}
