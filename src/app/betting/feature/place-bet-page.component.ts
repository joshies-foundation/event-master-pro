import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { withAllDefined } from '../../shared/util/signal-helpers';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { BetService } from '../../shared/data-access/bet.service';
import {
  BetModel,
  OmitAutoGeneratedColumns,
} from '../../shared/util/supabase-types';
import { SessionService } from '../../shared/data-access/session.service';

@Component({
  selector: 'joshies-override-points-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    CheckboxModule,
    InputNumberModule,
  ],
  template: `
    <joshies-page-header headerText="Place a Bet" alwaysSmall>
      <joshies-header-link
        text="Betting"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Bet terms -->
    <label class="flex flex-column gap-2 mt-5">
      Bet Terms
      <textarea rows="2" pInputTextarea [(ngModel)]="terms" [required]="true">
      </textarea>
    </label>

    <!-- Requester bet -->
    <!-- eslint-disable-next-line -->
    <label class="flex flex-column gap-2 mt-5">
      {{ requester()?.display_name ?? 'Bettor' }} Bets
      <p-inputNumber
        #inputRequesterBet
        [(ngModel)]="requesterBet"
        [showButtons]="true"
        buttonLayout="horizontal"
        [step]="1"
        min="1"
        [allowEmpty]="false"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        inputStyleClass="w-full font-semibold text-right"
        styleClass="w-full"
        (ngModelChange)="checkEvenOdds()"
      />
    </label>

    <!-- Even Odds Checkbox -->
    <!-- eslint-disable-next-line -->
    <label class="mt-5">
      <p-checkbox
        class="mt-5"
        [(ngModel)]="evenOdds"
        binary="true"
        (ngModelChange)="checkEvenOdds()"
      />
      Even Odds
    </label>

    @if (!evenOdds()) {
      <!-- Opponent bet -->
      <!-- eslint-disable-next-line -->
      <label class="flex flex-column gap-2 mt-5">
        {{ opponent()?.display_name ?? 'Opponent' }} Bets
        <p-inputNumber
          #inputOpponentBet
          [(ngModel)]="opponentBet"
          [showButtons]="true"
          buttonLayout="horizontal"
          [step]="1"
          min="1"
          [allowEmpty]="false"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
          inputStyleClass="w-full font-semibold text-right"
          styleClass="w-full"
        />
      </label>
    }

    <!-- Submit Button -->
    <p-button
      label="Submit Bet"
      styleClass="w-full mt-5"
      (onClick)="confirmSubmit()"
      [disabled]="submitButtonDisabled()"
      [loading]="submitting()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlaceBetPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly betService = inject(BetService);
  private readonly sessionService = inject(SessionService);

  readonly opponentId = input(0, { transform: numberAttribute }); // route param

  readonly opponent = computed(() =>
    withAllDefined(
      { players: this.playerService.players() },
      ({ players }) =>
        players?.find((player) => player.player_id === this.opponentId()) ??
        null,
    ),
  );

  readonly terms = signal('');
  readonly requester = this.playerService.userPlayer;
  readonly requesterBet = signal(1);
  readonly opponentBet = signal(1);
  readonly evenOdds = signal(true);
  readonly submitting = signal(false);
  readonly submitButtonDisabled = computed(
    () => this.submitting() || !this.terms(),
  );

  checkEvenOdds(): void {
    if (this.evenOdds()) {
      this.opponentBet.set(this.requesterBet());
    }
  }

  async confirmSubmit(): Promise<void> {
    this.submitting.set(true);

    const bet: OmitAutoGeneratedColumns<BetModel> = {
      description: this.terms(),
      requester_player_id: this.requester()?.player_id ?? 0,
      opponent_player_id: this.opponentId(),
      requester_wager: this.requesterBet(),
      opponent_wager: this.opponentBet(),
      session_id: this.sessionService.session()?.id ?? 0,
      status: 'pending_acceptance',
    };
    const { error } = await showMessageOnError(
      this.betService.createBet(bet),
      this.messageService,
    );

    if (error) {
      this.submitting.set(false);
      return;
    }

    showSuccessMessage('Bet placed successfully', this.messageService);
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
