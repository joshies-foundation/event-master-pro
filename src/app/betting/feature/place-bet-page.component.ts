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
import {
  ChaosSpaceEventModel,
  ChaosSpaceEventType,
  DuelModel,
  SpecialSpaceEventModel,
} from '../../shared/util/supabase-types';
import { SessionService } from '../../shared/data-access/session.service';
import { DropdownModule } from 'primeng/dropdown';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import {
  BetStatus,
  BetSubtype,
  BetType,
  DuelStatus,
  SpaceEventStatus,
} from '../../shared/util/supabase-helpers';
import { DuelService } from '../../shared/data-access/duel.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  generateBetDescription,
  generateBetDetails,
  generateBetTypeObject,
} from '../util/place-bet-helpers';
import { OverUnderComponent } from '../ui/over-under.component';

@Component({
  selector: 'joshies-place-bet-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Place a Bet" alwaysSmall>
      <joshies-header-link
        text="Betting"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (loadMessage(); as loadMessage) {
      <h4>{{ loadMessage }}</h4>
    } @else {
      <h4>Your score: {{ userPlayer()?.score }}</h4>

      <!-- Opponent Dropdown -->
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
      <label class="flex flex-column gap-2 mt-5">
        Bet Type
        <p-dropdown
          [options]="betTypes"
          [(ngModel)]="selectedBetType"
          optionLabel="betTypeString"
          optionValue="betType"
          styleClass="w-full"
        />
      </label>

      @switch (selectedBetType()) {
        @case (BetType.DuelWinner) {
          <!-- Duel Dropdown -->
          <label class="flex flex-column gap-2 mt-5">
            Duel
            <p-dropdown
              [options]="openDuels()"
              [(ngModel)]="selectedDuel"
              optionLabel="duelName"
              styleClass="w-full"
              emptyMessage="No open duels"
              placeholder="Select a duel"
            />
          </label>

          <!-- Duel Winner Dropdown -->
          <label class="flex flex-column gap-2 mt-5">
            Winner
            <p-dropdown
              [options]="competitors()"
              [(ngModel)]="selectedWinner"
              optionLabel="display_name"
              styleClass="w-full"
              placeholder="Select a winner"
            />
          </label>
        }
        @case (BetType.SpecialSpaceEvent) {
          <!-- SS Event Dropdown -->
          <label class="flex flex-column gap-2 mt-5">
            Special Space Event
            <p-dropdown
              [options]="openSsEvents()"
              [(ngModel)]="selectedSsEvent"
              optionLabel="ssEventName"
              styleClass="w-full"
              emptyMessage="No open special space events"
              placeholder="Select a special space event"
            />
          </label>

          <joshies-over-under
            [(ouValue)]="ouValue"
            [(selectedOuOption)]="selectedOuOption"
          />
        }
        @case (BetType.ChaosSpaceEvent) {
          <!-- Chaos Space Event Dropdown -->
          <label class="flex flex-column gap-2 mt-5">
            Chaos Space Event
            <p-dropdown
              [options]="openChaosEvents()"
              [(ngModel)]="selectedChaosEvent"
              optionLabel="template.name"
              styleClass="w-full"
              emptyMessage="No open chaos space events"
              placeholder="Select a chaos space event"
            />
          </label>

          <!-- Subtype Radio Buttons -->
          <div class="flex flex-wrap gap-3 mt-5">
            <div class="flex align-items-center">
              <label class="ml-2">
                <p-radioButton
                  name="chaosBetSubtype"
                  [value]="BetSubtype.NumberOfLosers"
                  [(ngModel)]="selectedChaosBetSubtype"
                  styleClass="w-full"
                />
                Number of Losers
              </label>
            </div>
            <div class="flex align-items-center">
              <label class="ml-2">
                <p-radioButton
                  name="chaosBetSubtype"
                  [value]="BetSubtype.PlayerLoses"
                  [(ngModel)]="selectedChaosBetSubtype"
                  styleClass="w-full"
                />
                Selected Player's Result
              </label>
            </div>
          </div>

          @switch (selectedChaosBetSubtype()) {
            @case (BetSubtype.NumberOfLosers) {
              <joshies-over-under
                [(ouValue)]="ouValue"
                [(selectedOuOption)]="selectedOuOption"
              />
            }
            @case (BetSubtype.PlayerLoses) {
              <!-- Bet Player Dropdown -->
              <label class="flex flex-column gap-2 mt-5">
                Player
                <p-dropdown
                  [options]="playerService.players() ?? []"
                  [(ngModel)]="selectedChaosPlayer"
                  optionLabel="display_name"
                  styleClass="flex"
                  placeholder="Select a player"
                />
              </label>

              <!-- Wins/Loses Radio Buttons -->
              <div class="flex flex-wrap gap-3 mt-5">
                <div class="flex align-items-center">
                  <label class="ml-2">
                    <p-radioButton
                      name="winsLoses"
                      value="Wins"
                      [(ngModel)]="selectedWinsLoses"
                      styleClass="w-full"
                    />
                    Wins
                  </label>
                </div>
                <div class="flex align-items-center">
                  <label class="ml-2">
                    <p-radioButton
                      name="winsLoses"
                      value="Loses"
                      [(ngModel)]="selectedWinsLoses"
                      styleClass="w-full"
                    />
                    Loses
                  </label>
                </div>
              </div>
            }
          }
        }
        @default {
          <!-- Bet terms -->
          <label class="flex flex-column gap-2 mt-5">
            Bet Terms
            <textarea
              rows="2"
              pInputTextarea
              [(ngModel)]="terms"
              [required]="true"
            >
            </textarea>
          </label>
        }
      }

      <!-- Even Odds Checkbox -->
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    CheckboxModule,
    InputNumberModule,
    DropdownModule,
    RadioButtonModule,
    OverUnderComponent,
  ],
})
export default class PlaceBetPageComponent {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly betService = inject(BetService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly duelService = inject(DuelService);
  private readonly gameboardService = inject(GameboardService);
  readonly playerService = inject(PlayerService);
  readonly BetType = BetType;
  readonly BetSubtype = BetSubtype;

  private readonly ssEvents = toSignal(
    this.gameboardService.specialSpaceEventsForThisTurn$,
  );
  private readonly chaosEvents = toSignal(
    this.gameboardService.chaosSpaceEventsForThisTurn$,
  );
  readonly terms = signal('');
  readonly requesterBet = signal(1);
  readonly opponentBet = signal(1);
  readonly evenOdds = signal(true);
  readonly submitting = signal(false);
  readonly userPlayer = this.playerService.userPlayer;
  readonly selectedOpponent = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedDuel = signal<DuelModel | null>(null);
  readonly betTypes = [
    generateBetTypeObject(BetType.DuelWinner),
    generateBetTypeObject(BetType.SpecialSpaceEvent),
    generateBetTypeObject(BetType.ChaosSpaceEvent),
    generateBetTypeObject(BetType.Manual),
  ];
  readonly selectedBetType = signal<BetType>(BetType.Manual);
  readonly selectedWinner = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedSsEvent = signal<{
    ssEventName: string;
    ssEvent: SpecialSpaceEventModel;
  } | null>(null);
  readonly selectedOuOption = signal<'Over' | 'Under'>('Over');
  readonly ouValue = signal<number>(0.5);
  readonly selectedChaosEvent = signal<ChaosSpaceEventModel | null>(null);
  readonly selectedChaosBetSubtype = signal<BetSubtype>(
    BetSubtype.NumberOfLosers,
  );
  readonly selectedChaosPlayer = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedWinsLoses = signal<'Wins' | 'Loses'>('Loses');

  readonly loadMessage = computed(() => {
    const userPlayer = this.playerService.userPlayer();
    if (!userPlayer) {
      return 'Loading...';
    }
    if (!userPlayer.can_place_bets) {
      return 'You are not authorized to place bets.';
    }
    return '';
  });

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

    // Duel bet requirements
    if (
      this.selectedBetType() === BetType.DuelWinner &&
      (!this.selectedDuel() ||
        !this.selectedWinner() ||
        this.betInvolvesLoser())
    ) {
      return true;
    }

    // Special space event bet requirements
    if (
      this.selectedBetType() === BetType.SpecialSpaceEvent &&
      (!this.selectedSsEvent() || !this.ouValue() || this.betInvolvesLoser())
    ) {
      return true;
    }

    // Chaos space event bet requirements
    if (this.selectedBetType() === BetType.ChaosSpaceEvent) {
      // All such bets require an event and a subtype
      if (!this.selectedChaosEvent() || !this.selectedChaosBetSubtype()) {
        return true;
      }

      // number_of_losers bets have no further requirements

      // player_loses bet requirements
      if (
        this.selectedChaosBetSubtype() === BetSubtype.PlayerLoses &&
        (!this.selectedChaosPlayer() || this.betInvolvesLoser())
      ) {
        return true;
      }
    }

    // Manual bet requirements
    if (this.selectedBetType() === BetType.Manual && !this.terms()) {
      return true;
    }

    // Universal bet requirements
    return (
      this.submitting() ||
      !this.selectedOpponent() ||
      !this.userPlayer() ||
      this.requesterBet() > userScore ||
      this.opponentBet() > opponentScore
    );
  });

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

  readonly openSsEvents = computed(() => {
    return this.ssEvents()
      ?.filter((event) => event.status === SpaceEventStatus.WaitingToBegin)
      .map((event) => {
        return {
          ssEventName:
            event.player?.display_name +
            "'s " +
            event.template?.name +
            ' Event',
          ssEvent: event,
        };
      });
  });

  readonly openChaosEvents = computed(() => {
    return this.chaosEvents()?.filter(
      (event) =>
        event.status === SpaceEventStatus.WaitingToBegin &&
        event.template?.type ===
          ChaosSpaceEventType.EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailure,
    );
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

    if (this.selectedBetType() === BetType.SpecialSpaceEvent) {
      const eventPlayerId = this.selectedSsEvent()?.ssEvent?.player_id;

      // If you are event player and you're betting the under
      if (
        this.selectedOuOption() === 'Under' &&
        this.playerService.userPlayer()?.player_id === eventPlayerId
      ) {
        return true;
      }

      // If bet opponent is event player and you're betting the over (i.e. they're betting their own under)
      if (
        this.selectedOuOption() === 'Over' &&
        this.selectedOpponent()?.player_id === eventPlayerId
      ) {
        return true;
      }
    }

    if (this.selectedBetType() === BetType.ChaosSpaceEvent) {
      const eventPlayerId = this.selectedChaosPlayer()?.player_id;

      // If you are chosen player and you're betting on a loss
      if (
        this.selectedWinsLoses() === 'Loses' &&
        this.playerService.userPlayer()?.player_id === eventPlayerId
      ) {
        return true;
      }

      // If bet opponent is chosen player and you're betting on a win (i.e. they're betting to lose)
      if (
        this.selectedWinsLoses() === 'Wins' &&
        this.selectedOpponent()?.player_id === eventPlayerId
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
      description: generateBetDescription(
        this.selectedBetType(),
        this.selectedDuel(),
        this.selectedWinner(),
        this.selectedSsEvent()?.ssEvent,
        this.selectedOuOption(),
        this.ouValue(),
        this.terms(),
        this.selectedChaosBetSubtype(),
        this.selectedChaosEvent(),
        this.selectedChaosPlayer(),
        this.selectedWinsLoses(),
      ),
      requester_player_id: this.userPlayer()?.player_id ?? 0,
      opponent_player_id: this.selectedOpponent()?.player_id ?? 0,
      requester_wager: this.requesterBet(),
      opponent_wager: this.opponentBet(),
      session_id: this.sessionService.session()?.id ?? 0,
      status: BetStatus.PendingAcceptance,
      bet_type: betType === BetType.Manual ? null : betType,
      details: generateBetDetails(
        this.selectedBetType(),
        this.selectedDuel(),
        this.selectedWinner(),
        this.selectedSsEvent()?.ssEvent,
        this.selectedOuOption(),
        this.ouValue(),
        this.selectedChaosBetSubtype(),
        this.selectedChaosEvent(),
        this.selectedChaosPlayer(),
        this.selectedWinsLoses(),
      ),
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
