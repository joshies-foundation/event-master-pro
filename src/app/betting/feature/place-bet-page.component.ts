import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  Signal,
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
  DuelModel,
  SpecialSpaceEventModel,
  OmitAutoGeneratedColumns,
  EventModel,
  GameboardSpaceModel,
  BetModel,
} from '../../shared/util/supabase-types';
import { SessionService } from '../../shared/data-access/session.service';
import { DropdownModule } from 'primeng/dropdown';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import {
  BetStatus,
  BetSubtype,
  BetType,
  DuelStatus,
  EventFormat,
  Table,
} from '../../shared/util/supabase-helpers';
import { DuelService } from '../../shared/data-access/duel.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import {
  generateBetDescription,
  generateBetDetails,
  generateBetTypeObject,
} from '../util/place-bet-helpers';
import { Tables } from '../../shared/util/schema';
import { CardComponent } from '../../shared/ui/card.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import {
  EventService,
  EventTeamWithParticipantInfo,
} from '../../shared/data-access/event.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  ConfirmPlaceBetDialogComponent,
  confirmPlaceBetDialogKey,
} from '../ui/confirm-place-bet-dialog.component';
import { DecimalPipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { DuelWinnerBetComponent } from '../ui/bet-types/duel-winner-bet.component';
import { SSEventBetComponent } from '../ui/bet-types/ss-event-bet.component';
import { ChaosSpaceBetComponent } from '../ui/bet-types/chaos-space-bet.component';
import { EventBetComponent } from '../ui/bet-types/event-bet.component';

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
      <h4 class="mt-5">Your score: {{ userPlayer()?.score }}</h4>

      <div class="flex flex-column gap-3">
        <joshies-card padded styleClass="flex flex-column gap-3">
          <!-- Opponent Dropdown -->
          <label class="flex flex-column gap-2">
            Opponent
            <p-dropdown
              [options]="staticPlayersWithoutUser"
              [(ngModel)]="staticSelectedOpponent"
              optionLabel="nameAndScore"
              styleClass="flex"
              placeholder="Select an opponent"
            >
              <ng-template pTemplate="item" let-player>
                <div class="flex gap-2 align-items-center">
                  <p-avatar
                    [image]="player.avatar_url"
                    shape="circle"
                    styleClass="h-1.5rem w-1.5rem"
                  />
                  {{ player.display_name }} ({{ player.score | number }} points)
                </div>
              </ng-template>
              <ng-template pTemplate="selectedItem" let-player>
                <div class="flex gap-2 align-items-center">
                  <p-avatar
                    [image]="player.avatar_url"
                    shape="circle"
                    styleClass="h-1.5rem w-1.5rem"
                  />
                  {{ player.display_name }} ({{ player.score | number }} points)
                </div>
              </ng-template>
            </p-dropdown>
          </label>
        </joshies-card>

        <joshies-card padded styleClass="flex flex-column gap-3">
          <!-- Bet Type Dropdown -->
          <label class="flex flex-column gap-2">
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
              <joshies-duel-winner
                [(selectedDuelId)]="selectedDuelId"
                [(selectedWinner)]="selectedWinner"
                (selectedDuel)="selectedDuel.set($event)"
              />
            }
            @case (BetType.SpecialSpaceEvent) {
              <joshies-ss-event-bet
                [(selectedSsEventId)]="selectedSsEventId"
                [(ouValue)]="ouValue"
                [(selectedOuOption)]="selectedOuOption"
                (selectedSsEvent)="selectedSsEvent.set($event)"
              />
            }
            @case (BetType.ChaosSpaceEvent) {
              <joshies-chaos-space-bet
                [(selectedChaosEventId)]="selectedChaosEventId"
                [(selectedChaosBetSubtype)]="selectedChaosBetSubtype"
                (selectedChaosEvent)="selectedChaosEvent.set($event)"
                [(selectedOuOption)]="selectedOuOption"
                [(selectedChaosPlayer)]="selectedChaosPlayer"
                [(selectedWinsLoses)]="selectedWinsLoses"
              />
            }
            @case (BetType.MainEvent) {
              <joshies-event-bet
                [(selectedMainEventId)]="selectedMainEventId"
                [(selectedEventBetSubtype)]="selectedEventBetSubtype"
                (selectedMainEvent)="selectedMainEvent.set($event)"
                [(selectedEventTeam)]="selectedEventTeam"
                [(selectedTopBottomOption)]="selectedTopBottomOption"
                [(selectedNumberOfTeams)]="selectedNumberOfTeams"
                [(selectedOuOption)]="selectedOuOption"
                [(ouValue)]="ouValue"
              />
            }
            @case (BetType.GameboardMove) {
              <!-- Bet Player Dropdown -->
              <label class="flex flex-column gap-2">
                Player
                <p-dropdown
                  [options]="playerService.players() ?? []"
                  [(ngModel)]="selectedGameboardPlayer"
                  optionLabel="display_name"
                  styleClass="flex"
                  placeholder="Select a player"
                />
              </label>

              <!-- Gameboard Space Dropdown -->
              <label class="flex flex-column gap-2">
                Next Gameboard Space
                <p-dropdown
                  [options]="gameboardSpaces()"
                  [(ngModel)]="selectedGameboardSpace"
                  optionLabel="name"
                  styleClass="flex"
                  placeholder="Select a space type"
                />
              </label>
            }
            @default {
              <!-- Bet terms -->
              <label class="flex flex-column gap-2">
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
        </joshies-card>

        <joshies-card padded styleClass="flex flex-column gap-3">
          <!-- Even Odds Checkbox -->
          <div class="flex align-items-center justify-content-end gap-3">
            <label for="even-odds"> Even Odds </label>
            <p-inputSwitch
              inputId="event-odds"
              [(ngModel)]="evenOdds"
              (ngModelChange)="checkEvenOdds()"
            />
          </div>

          <!-- Requester bet -->
          <label class="flex flex-column gap-2">
            {{
              evenOdds()
                ? 'Both Wager'
                : (userPlayer()?.display_name ?? 'Bettor') + ' Wagers'
            }}
            <p-inputNumber
              #inputRequesterBet
              [(ngModel)]="requesterBet"
              [showButtons]="true"
              buttonLayout="horizontal"
              [step]="1"
              min="1"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              inputStyleClass="w-full font-semibold text-center"
              styleClass="w-full"
              (ngModelChange)="checkEvenOdds()"
              (onFocus)="
                inputRequesterBet.input.nativeElement.selectionStart = 100
              "
            />
          </label>

          @if (!evenOdds()) {
            <!-- Opponent bet -->
            <label class="flex flex-column gap-2">
              {{ selectedOpponent()?.display_name ?? 'Opponent' }} Wagers
              <p-inputNumber
                #inputOpponentBet
                [(ngModel)]="opponentBet"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                min="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputStyleClass="w-full font-semibold text-center"
                styleClass="w-full"
                (onFocus)="
                  inputRequesterBet.input.nativeElement.selectionStart = 100
                "
              />
            </label>
          }
        </joshies-card>

        <!-- Submit Button -->
        @if (cannotSubmitMessage(); as cannotSubmitMessage) {
          <div class="text-sm text-red font-semibold">
            {{ cannotSubmitMessage }}
          </div>
        }
        <p-button
          label="Submit Bet"
          styleClass="w-full mt-2"
          (onClick)="confirmSubmit()"
          [disabled]="submitButtonDisabled()"
          [loading]="submitting()"
        />
      </div>
    }

    <joshies-confirm-place-bet-dialog
      [bet]="bet()"
      [userPlayerId]="userPlayer()?.player_id ?? 0"
    />
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
    CardComponent,
    InputSwitchModule,
    ConfirmPlaceBetDialogComponent,
    DecimalPipe,
    AvatarModule,
    DuelWinnerBetComponent,
    SSEventBetComponent,
    ChaosSpaceBetComponent,
    EventBetComponent,
  ],
})
export default class PlaceBetPageComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly betService = inject(BetService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly duelService = inject(DuelService);
  private readonly gameboardService = inject(GameboardService);
  private readonly eventService = inject(EventService);
  private readonly gameStateService = inject(GameStateService);
  readonly playerService = inject(PlayerService);
  readonly BetType = BetType;
  readonly BetSubtype = BetSubtype;
  readonly EventFormat = EventFormat;

  // query params
  readonly betType = input<BetType>();
  readonly duelId = input<string>();
  readonly eventId = input<string>();
  readonly ssEventId = input<string>();
  readonly chaosEventId = input<string>();

  readonly terms = signal('');
  readonly requesterBet = signal(1);
  readonly opponentBet = signal(1);
  readonly evenOdds = signal(true);
  readonly submitting = signal(false);
  readonly userPlayer = this.playerService.userPlayer;
  readonly selectedOpponent = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedDuelId = signal<DuelModel['id'] | null>(null);
  readonly selectedDuel = signal<DuelModel | null>(null);
  readonly selectedSsEventId = signal<SpecialSpaceEventModel['id'] | null>(
    null,
  );
  readonly selectedSsEvent = signal<{
    ssEventName: string;
    ssEvent: SpecialSpaceEventModel;
  } | null>(null);

  readonly betTypes = [
    generateBetTypeObject(BetType.MainEvent),
    generateBetTypeObject(BetType.DuelWinner),
    generateBetTypeObject(BetType.SpecialSpaceEvent),
    generateBetTypeObject(BetType.ChaosSpaceEvent),
    generateBetTypeObject(BetType.GameboardMove),
    generateBetTypeObject(BetType.Custom),
  ];
  readonly selectedBetType = signal<BetType>(BetType.Custom);
  readonly selectedWinner = signal<PlayerWithUserAndRankInfo | null>(null);

  readonly selectedOuOption = signal<'OVER' | 'UNDER'>('OVER');
  readonly ouValue = signal<number>(0.5);

  readonly selectedChaosEventId = signal<ChaosSpaceEventModel['id'] | null>(
    null,
  );
  readonly selectedChaosEvent = signal<ChaosSpaceEventModel | null>(null);
  readonly selectedChaosBetSubtype = signal<BetSubtype>(
    BetSubtype.NumberOfLosers,
  );
  readonly selectedChaosPlayer = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedWinsLoses = signal<'WINS' | 'LOSES'>('LOSES');
  readonly selectedMainEventId = signal<EventModel['id'] | null>(null);
  readonly selectedMainEvent = signal<EventModel | null>(null);

  readonly selectedEventBetSubtype = signal<BetSubtype>(
    BetSubtype.TeamPosition,
  );
  readonly selectedEventTeam = signal<EventTeamWithParticipantInfo | null>(
    null,
  );
  readonly selectedTopBottomOption = signal<'TOP' | 'BOTTOM'>('TOP');
  readonly selectedNumberOfTeams = signal<number>(1);
  readonly selectedGameboardPlayer = signal<PlayerWithUserAndRankInfo | null>(
    null,
  );
  readonly selectedGameboardSpace = signal<GameboardSpaceModel | null>(null);
  staticPlayersWithoutUser: PlayerWithUserAndRankInfo[] = [];
  staticSelectedOpponent = signal<PlayerWithUserAndRankInfo | null>(null);

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

  readonly playersWithoutUser = computed(() =>
    this.playerService
      .players()
      ?.filter((player) => player.user_id !== this.userPlayer()?.user_id),
  );

  readonly cannotSubmitMessage = computed(() => {
    const userPlayer = this.userPlayer();
    const requesterBet = this.requesterBet();
    const selectedOpponent = this.selectedOpponent();
    const opponentBet = this.opponentBet();

    if (userPlayer && userPlayer.score < requesterBet) {
      return 'Your wager cannot be higher than your current score';
    }

    if (selectedOpponent && selectedOpponent.score < opponentBet) {
      return (
        "Opponent's wager cannot be higher than their current score " +
        selectedOpponent.score +
        '.'
      );
    }

    return null;
  });

  readonly submitButtonDisabled = computed(() => {
    const selectedBetType = this.selectedBetType();
    const selectedMainEvent = this.selectedMainEvent();
    const selectedEventBetSubtype = this.selectedEventBetSubtype();
    const selectedEventTeam = this.selectedEventTeam();
    const selectedDuel = this.selectedDuel();
    const selectedWinner = this.selectedWinner();
    const betInvolvesLoser = this.betInvolvesLoser();
    const selectedSsEvent = this.selectedSsEvent();
    const ouValue = this.ouValue();
    const selectedNumberOfTeams = this.selectedNumberOfTeams();
    const selectedChaosEvent = this.selectedChaosEvent();
    const selectedChaosBetSubtype = this.selectedChaosBetSubtype();
    const selectedChaosPlayer = this.selectedChaosPlayer();
    const submitting = this.submitting();
    const selectedOpponent = this.selectedOpponent();
    const terms = this.terms();
    const userPlayer = this.userPlayer();
    const cannotSubmitMessage = this.cannotSubmitMessage();

    // Event Bet Requirements
    if (selectedBetType === BetType.MainEvent) {
      if (!selectedMainEvent) {
        return true;
      }

      // team_position bet requirements
      if (
        selectedEventBetSubtype === BetSubtype.TeamPosition &&
        (!selectedEventTeam || !selectedNumberOfTeams || betInvolvesLoser)
      ) {
        return true;
      }

      // score bet requirements
      if (
        selectedEventBetSubtype === BetSubtype.Score &&
        (!selectedEventTeam || !ouValue || betInvolvesLoser)
      ) {
        return true;
      }
    }

    // Duel bet requirements
    if (
      selectedBetType === BetType.DuelWinner &&
      (!selectedDuel || !selectedWinner || betInvolvesLoser)
    ) {
      return true;
    }

    // Special space event bet requirements
    if (
      selectedBetType === BetType.SpecialSpaceEvent &&
      (!selectedSsEvent || !ouValue || betInvolvesLoser)
    ) {
      console.log(JSON.stringify(selectedSsEvent));
      return true;
    }

    // Chaos space event bet requirements
    if (selectedBetType === BetType.ChaosSpaceEvent) {
      // All such bets require an event and a subtype
      if (!selectedChaosEvent || !selectedChaosBetSubtype) {
        return true;
      }

      // number_of_losers bet requirements
      if (selectedChaosBetSubtype === BetSubtype.NumberOfLosers && !ouValue) {
        return true;
      }

      // player_loses bet requirements
      if (
        selectedChaosBetSubtype === BetSubtype.PlayerLoses &&
        (!selectedChaosPlayer || betInvolvesLoser)
      ) {
        return true;
      }
    }

    // Manual bet requirements
    if (selectedBetType === BetType.Custom && !terms) {
      return true;
    }

    // Universal bet requirements
    return (
      submitting || !selectedOpponent || !userPlayer || cannotSubmitMessage
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

  readonly gameboardSpaces = computed(() => {
    return this.gameboardService.gameboardSpaces() ?? [];
  });

  // bet to be submitted to the database
  readonly dbBet: Signal<OmitAutoGeneratedColumns<Tables<Table.Bet>>> =
    computed(() => {
      const betType = this.selectedBetType();

      return {
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
          this.selectedEventTeam(),
          this.selectedTopBottomOption(),
          this.selectedNumberOfTeams(),
          this.selectedMainEvent(),
          this.selectedEventBetSubtype(),
          this.selectedGameboardPlayer(),
          this.selectedGameboardSpace(),
        ),
        requester_player_id: this.userPlayer()?.player_id ?? 0,
        opponent_player_id: this.selectedOpponent()?.player_id ?? 0,
        requester_wager: this.requesterBet(),
        opponent_wager: this.opponentBet(),
        session_id: this.sessionService.session()?.id ?? 0,
        status: BetStatus.PendingAcceptance,
        bet_type: betType === BetType.Custom ? null : betType,
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
          this.selectedEventTeam(),
          this.selectedTopBottomOption(),
          this.selectedNumberOfTeams(),
          this.selectedMainEvent(),
          this.selectedEventBetSubtype(),
          this.selectedGameboardPlayer(),
          this.selectedGameboardSpace(),
        ),
      };
    });

  // bet including more info about the requester and opponent
  readonly bet: Signal<OmitAutoGeneratedColumns<BetModel>> = computed(() => ({
    ...(this.dbBet() as BetModel),
    requester: this.userPlayer() ?? undefined,
    opponent: this.selectedOpponent() ?? undefined,
  }));

  private readonly betInvolvesLoser = computed(() => {
    const selectedBetType = this.selectedBetType();
    const selectedEventBetSubtype = this.selectedEventBetSubtype();
    const selectedEventTeam = this.selectedEventTeam();
    const selectedTopBottomOption = this.selectedTopBottomOption();
    const userPlayer = this.userPlayer();
    const selectedOpponent = this.selectedOpponent();
    const selectedDuel = this.selectedDuel();
    const selectedWinner = this.selectedWinner();
    const selectedSsEvent = this.selectedSsEvent();
    const selectedOuOption = this.selectedOuOption();
    const selectedChaosPlayer = this.selectedChaosPlayer();
    const selectedWinsLoses = this.selectedWinsLoses();

    if (selectedBetType === BetType.MainEvent) {
      if (selectedEventBetSubtype === BetSubtype.TeamPosition) {
        const selectedParticipants = selectedEventTeam?.participants ?? [];
        let involvesLoser = false;
        selectedParticipants.forEach((participant) => {
          if (
            (selectedTopBottomOption === 'BOTTOM' &&
              participant.player_id === userPlayer?.player_id) ||
            (selectedTopBottomOption === 'TOP' &&
              participant.player_id === selectedOpponent?.player_id)
          ) {
            involvesLoser = true;
          }
        });
        if (involvesLoser) {
          return true;
        }
      }

      if (selectedEventBetSubtype === BetSubtype.Score) {
        const selectedParticipants = selectedEventTeam?.participants ?? [];
        let involvesLoser = false;
        selectedParticipants.forEach((participant) => {
          if (
            (selectedOuOption === 'UNDER' &&
              participant.player_id === userPlayer?.player_id) ||
            (selectedOuOption === 'OVER' &&
              participant.player_id === selectedOpponent?.player_id)
          ) {
            involvesLoser = true;
          }
        });
        if (involvesLoser) {
          return true;
        }
      }
    }

    if (selectedBetType === BetType.DuelWinner) {
      const challengerPlayerId = selectedDuel?.challenger?.player_id;
      const opponentPlayerId = selectedDuel?.opponent?.player_id;

      // If user is challenger but not winner
      if (
        challengerPlayerId === userPlayer?.player_id &&
        challengerPlayerId !== selectedWinner?.player_id
      ) {
        return true;
      }

      // If bet opponent is challenger and winner (i.e. bet opponent doesn't pick themself)
      if (
        challengerPlayerId === selectedOpponent?.player_id &&
        challengerPlayerId === selectedWinner?.player_id
      ) {
        return true;
      }

      // If user is duel opponent but not winner
      if (
        opponentPlayerId === userPlayer?.player_id &&
        opponentPlayerId !== selectedWinner?.player_id
      ) {
        return true;
      }

      // If bet opponent is duel opponent and winner (i.e. bet opponent doesn't pick themself)
      if (
        opponentPlayerId === selectedOpponent?.player_id &&
        opponentPlayerId === selectedWinner?.player_id
      ) {
        return true;
      }
    }

    if (selectedBetType === BetType.SpecialSpaceEvent) {
      const eventPlayerId = selectedSsEvent?.ssEvent?.player_id;

      // If you are event player and you're betting the under
      if (
        selectedOuOption === 'UNDER' &&
        userPlayer?.player_id === eventPlayerId
      ) {
        return true;
      }

      // If bet opponent is event player and you're betting the over (i.e. they're betting their own under)
      if (
        selectedOuOption === 'OVER' &&
        selectedOpponent?.player_id === eventPlayerId
      ) {
        return true;
      }
    }

    if (selectedBetType === BetType.ChaosSpaceEvent) {
      const eventPlayerId = selectedChaosPlayer?.player_id;

      // If you are chosen player and you're betting on a loss
      if (
        selectedWinsLoses === 'LOSES' &&
        userPlayer?.player_id === eventPlayerId
      ) {
        return true;
      }

      // If bet opponent is chosen player and you're betting on a win (i.e. they're betting to lose)
      if (
        selectedWinsLoses === 'WINS' &&
        selectedOpponent?.player_id === eventPlayerId
      ) {
        return true;
      }
    }
    return false;
  });

  checkEvenOdds(): void {
    const requesterBet = this.requesterBet();
    if (this.evenOdds()) {
      this.opponentBet.set(requesterBet);
    }
  }

  async confirmSubmit(): Promise<void> {
    const opponentDisplayName =
      this.selectedOpponent()?.display_name ?? 'opponent';

    confirmBackendAction({
      confirmDialogKey: confirmPlaceBetDialogKey,
      action: async () => this.betService.createBet(this.dbBet()),
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

  constructor() {
    effect(
      () => {
        const playersWithoutUser = this.playersWithoutUser();
        if (playersWithoutUser && this.staticPlayersWithoutUser.length < 1) {
          this.staticPlayersWithoutUser = playersWithoutUser;
        }
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        const playersWithoutUser = this.playersWithoutUser();
        this.selectedOpponent.set(
          playersWithoutUser?.find(
            (player) =>
              player.player_id === this.staticSelectedOpponent()?.player_id,
          ) ?? null,
        );
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

    effect(
      () => {
        this.selectedMainEvent();
        this.selectedEventBetSubtype.set(BetSubtype.TeamPosition);
        this.selectedEventTeam.set(null);
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.selectedBetType.set(this.betType() ?? BetType.Custom);
    this.selectedDuelId.set(Number(this.duelId()) ?? null);
    this.selectedMainEventId.set(Number(this.eventId()) ?? null);
    this.selectedSsEventId.set(Number(this.ssEventId()) ?? null);
    this.selectedChaosEventId.set(Number(this.chaosEventId()) ?? null);
  }
}
