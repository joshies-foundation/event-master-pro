import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { BetComponent } from '../../shared/ui/bet.component';
import { Button } from 'primeng/button';
import { BetModel, PlayerModel } from '../../shared/util/supabase-types';
import { getUserBetData } from '../../shared/util/bet-helpers';

@Component({
  selector: 'joshies-bet-request',
  imports: [BetComponent, Button],
  template: `
    <joshies-bet
      [bet]="bet()"
      [userPlayerId]="userPlayerId()"
      [showRequestWarning]="true"
    />
    @if (betCannotBeAccepted()) {
      <p class="my-4 text-sm font-semibold text-danger-foreground">
        {{ betCannotBeAcceptedMessage() }}
      </p>
    }
    <div class="mt-4 grid grid-cols-2 grid-rows-1 gap-4">
      <p-button
        label="Accept"
        icon="pi pi-check"
        severity="success"
        class="col"
        styleClass="w-full"
        [loading]="submitting() && bet().id === acceptingBetId()"
        [disabled]="betCannotBeAccepted() || submitting()"
        (onClick)="onAcceptButtonClick()"
      />
      <p-button
        label="Reject"
        icon="pi pi-times"
        severity="danger"
        class="col"
        styleClass="w-full"
        [loading]="submitting() && bet().id === rejectingBetId()"
        [disabled]="submitting()"
        (onClick)="onRejectButtonClick()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BetRequestComponent {
  readonly bet = input.required<BetModel>();
  readonly userPlayerId = input.required<PlayerModel['id']>();
  readonly submitting = input.required<boolean>();
  readonly acceptingBetId = input.required<BetModel['id'] | null>();
  readonly rejectingBetId = input.required<BetModel['id'] | null>();

  readonly accept = output();
  readonly reject = output();

  private readonly requesterDoesNotHaveEnoughPoints = computed(
    () => this.bet().requester_wager > (this.bet().requester?.score ?? 0),
  );

  private readonly opponentDoesNotHaveEnoughPoints = computed(
    () => this.bet().opponent_wager > (this.bet().opponent?.score ?? 0),
  );

  readonly betCannotBeAccepted = computed(
    () =>
      this.requesterDoesNotHaveEnoughPoints() ||
      this.opponentDoesNotHaveEnoughPoints(),
  );

  readonly betCannotBeAcceptedMessage = computed(() => {
    const {
      requesterDoesWords,
      opponentDoesWords,
      requesterTheirWord,
      opponentTheirWord,
    } = getUserBetData(this.bet(), this.userPlayerId());

    if (this.requesterDoesNotHaveEnoughPoints())
      return `This bet cannot be accepted because ${requesterDoesWords} not have enough points to cover ${requesterTheirWord} wager`;

    if (this.opponentDoesNotHaveEnoughPoints())
      return `This bet cannot be accepted because ${opponentDoesWords} not have enough points to cover ${opponentTheirWord} wager`;

    return null;
  });

  onAcceptButtonClick(): void {
    this.accept.emit();
  }

  onRejectButtonClick(): void {
    this.reject.emit();
  }
}
