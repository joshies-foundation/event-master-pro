import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../shared/data-access/player.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { BetService } from '../../shared/data-access/bet.service';
import { DuelModel } from '../../shared/util/supabase-types';
import { SessionService } from '../../shared/data-access/session.service';
import { DropdownModule } from 'primeng/dropdown';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import {
  BetStatus,
  BetType,
  DuelStatus,
} from '../../shared/util/supabase-helpers';
import { DuelService } from '../../shared/data-access/duel.service';
import { Json } from '../../shared/util/schema';

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
    DropdownModule,
  ],
  template: `
    <joshies-page-header headerText="Place a Bet" alwaysSmall>
      <joshies-header-link
        text="Betting"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <h4>Your score: {{ userPlayer()?.score }}</h4>

    <!-- Opponent Dropdown -->
    <!-- eslint-disable-next-line -->
    <label class="flex flex-column gap-2 mt-5">
      Opponent
      <p-dropdown
        [options]="playersWithoutUser()"
        [(ngModel)]="selectedOpponent"
        optionLabel="nameAndScore"
        styleClass="flex"
        placeholder="Select an opponent"
      />
    </label>

    <!-- Bet Type Dropdown -->
    <!-- eslint-disable-next-line -->
    <label class="flex flex-column gap-2 mt-5">
      Bet Type
      <p-dropdown
        [options]="betTypes"
        [(ngModel)]="selectedBetType"
        optionLabel="betTypeString"
        optionValue="betType"
        styleClass="flex"
      />
    </label>

    @if (selectedBetType() === BetType.DuelWinner) {
      <!-- Duel Dropdown -->
      <!-- eslint-disable-next-line -->
      <label class="flex flex-column gap-2 mt-5">
        Duel
        <p-dropdown
          [options]="openDuels()"
          [(ngModel)]="selectedDuel"
          optionLabel="duelName"
          styleClass="flex"
          emptyMessage="No open duels"
          placeholder="Select a duel"
        />
      </label>

      <!-- Duel Winner Dropdown -->
      <!-- eslint-disable-next-line -->
      <label class="flex flex-column gap-2 mt-5">
        Duel
        <p-dropdown
          [options]="competitors()"
          [(ngModel)]="selectedWinner"
          optionLabel="display_name"
          styleClass="flex"
          placeholder="Select a winner"
        />
      </label>
    } @else {
      <!-- Bet terms -->
      <label class="flex flex-column gap-2 mt-5">
        Bet Terms
        <textarea rows="2" pInputTextarea [(ngModel)]="terms" [required]="true">
        </textarea>
      </label>
    }

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

    <!-- Requester bet -->
    <!-- eslint-disable-next-line -->
    <label class="flex flex-column gap-2 mt-5">
      {{
        evenOdds()
          ? 'Both Bet'
          : (userPlayer()?.display_name ?? 'Bettor') + ' Bets'
      }}
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

    @if (!evenOdds()) {
      <!-- Opponent bet -->
      <!-- eslint-disable-next-line -->
      <label class="flex flex-column gap-2 mt-5">
        {{ selectedOpponent()?.display_name ?? 'Opponent' }} Bets
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly duelService = inject(DuelService);
  readonly BetType = BetType;

  readonly terms = signal('');
  readonly requesterBet = signal(1);
  readonly opponentBet = signal(1);
  readonly evenOdds = signal(true);
  readonly submitting = signal(false);
  readonly userPlayer = this.playerService.userPlayer;
  readonly selectedOpponent = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedDuel = signal<DuelModel | null>(null);
  readonly betTypes = [
    this.generateBetTypeObject(BetType.DuelWinner),
    this.generateBetTypeObject(BetType.Manual),
  ];
  readonly selectedBetType = signal<BetType>(BetType.Manual);
  readonly selectedWinner = signal<PlayerWithUserAndRankInfo | null>(null);

  readonly playersWithoutUser = computed(() => {
    return this.playerService
      .players()
      ?.filter((player) => player.user_id !== this.userPlayer()!.user_id)
      .map((player) => {
        return {
          userId: player.user_id,
          nameAndScore: player.display_name + ' (' + player.score + ' points)',
          score: player.score,
          player_id: player.player_id,
          display_name: player.display_name,
        };
      });
  });

  readonly submitButtonDisabled = computed(() => {
    const userScore = this.userPlayer()?.score ?? 0;
    const opponentScore = this.selectedOpponent()?.score ?? 0;

    if (
      this.selectedBetType() === BetType.DuelWinner &&
      (!this.selectedDuel() ||
        !this.selectedWinner() ||
        this.betInvolvesLoser())
    ) {
      return true;
    }

    if (this.selectedBetType() === BetType.Manual && !this.terms()) {
      return true;
    }

    return (
      this.submitting() ||
      !this.selectedOpponent() ||
      !this.userPlayer() ||
      this.requesterBet() > userScore ||
      this.opponentBet() > opponentScore
    );
  });

  //TODO make sure you can't bet against yourself
  readonly openDuels = computed(() => {
    let duels = this.duelService.duelsForThisTurn();
    duels = duels?.filter((duel) => duel.status === DuelStatus.WaitingToBegin);
    if (!duels || duels.length < 1) {
      return [];
    }
    return duels.map((duel) => {
      return {
        duelName:
          duel.game_name +
          ': ' +
          (duel.challenger?.display_name ?? 'challenger') +
          ' vs. ' +
          (duel.opponent?.display_name ?? 'opponent'),
        id: duel.id,
        challenger: duel.challenger,
        opponent: duel.opponent,
        game_name: duel.game_name,
      };
    });
  });

  readonly competitors = computed(() => {
    const selectedDuel = this.selectedDuel();
    if (!selectedDuel || !selectedDuel.challenger || !selectedDuel.opponent) {
      return [];
    }
    return [selectedDuel.challenger, selectedDuel.opponent];
  });

  private readonly betInvolvesLoser = computed(() => {
    if (this.selectedBetType() === BetType.DuelWinner) {
      const challengerPlayerId = this.selectedDuel()?.challenger?.player_id;
      const opponentPlayerId = this.selectedDuel()?.opponent?.player_id;

      // If user is challenger but not winner
      if (
        challengerPlayerId === this.playerService.userPlayer()?.player_id &&
        challengerPlayerId !== this.selectedWinner()?.player_id
      ) {
        return true;
      }

      // If bet opponent is challenger and winner (i.e. bet opponent doesn't pick themself)
      if (
        challengerPlayerId === this.selectedOpponent()?.player_id &&
        challengerPlayerId === this.selectedWinner()?.player_id
      ) {
        return true;
      }

      // If user is duel opponent but not winner
      if (
        opponentPlayerId === this.playerService.userPlayer()?.player_id &&
        opponentPlayerId !== this.selectedWinner()?.player_id
      ) {
        return true;
      }

      // If bet opponent is duel opponent and winner (i.e. bet opponent doesn't pick themself)
      if (
        opponentPlayerId === this.selectedOpponent()?.player_id &&
        opponentPlayerId === this.selectedWinner()?.player_id
      ) {
        return true;
      }
    }
    return false;
  });

  checkEvenOdds(): void {
    if (this.evenOdds()) {
      this.opponentBet.set(this.requesterBet());
    }
  }

  async confirmSubmit(): Promise<void> {
    const betType = this.selectedBetType();

    const bet = {
      description: this.generateDescription(),
      requester_player_id: this.userPlayer()?.player_id ?? 0,
      opponent_player_id: this.selectedOpponent()?.player_id ?? 0,
      requester_wager: this.requesterBet(),
      opponent_wager: this.opponentBet(),
      session_id: this.sessionService.session()?.id ?? 0,
      status: BetStatus.PendingAcceptance,
      bet_type: betType === BetType.Manual ? null : betType,
      details: this.generateDetails(),
    };

    const opponentDisplayName =
      this.selectedOpponent()?.display_name ?? 'opponent';

    confirmBackendAction({
      action: async () => this.betService.createBet(bet),
      confirmationMessageText: `Are you sure you want to request this bet against ${opponentDisplayName}?`,
      successMessageText: 'Bet request submitted',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  generateBetTypeObject(type: BetType) {
    switch (type) {
      case BetType.DuelWinner:
        return { betType: type, betTypeString: 'Duel Winner' };
      default:
        return { betType: BetType.Manual, betTypeString: 'Manual' };
    }
  }

  private generateDetails(): Json {
    switch (this.selectedBetType()) {
      case BetType.DuelWinner:
        return {
          duelId: this.selectedDuel()?.id,
          challengerWins:
            this.selectedWinner()?.player_id ===
            this.selectedDuel()?.challenger?.player_id,
        };
      default:
        return {};
    }
  }

  private generateDescription() {
    switch (this.selectedBetType()) {
      case BetType.DuelWinner:
        const duel = this.selectedDuel();
        const loserName =
          this.selectedWinner()?.player_id === duel?.challenger?.player_id
            ? duel?.opponent?.display_name
            : duel?.challenger?.display_name;
        return (
          this.selectedWinner()?.display_name +
          ' beats ' +
          loserName +
          ' in ' +
          duel?.game_name
        );
      default:
        return this.terms();
    }
  }

  // When parent changes (e.g. someone's score changes externally)
  // clear child dropdown selection
  constructor() {
    effect(
      () => {
        this.playersWithoutUser();
        this.selectedOpponent.set(null);
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        this.selectedDuel();
        this.selectedWinner.set(null);
      },
      { allowSignalWrites: true },
    );
  }
}
