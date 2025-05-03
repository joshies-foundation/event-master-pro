import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  Signal,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../shared/data-access/player.service';
import { AvatarModule } from 'primeng/avatar';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { SkeletonModule } from 'primeng/skeleton';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { Select } from 'primeng/select';
import {
  DuelModel,
  DuelSpaceEffectData,
  PlayerModel,
  SpecialSpaceEventModel,
  UserModel,
} from '../../shared/util/supabase-types';
import { BetStatus, DuelStatus } from '../../shared/util/supabase-helpers';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { DuelService } from '../../shared/data-access/duel.service';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BetService } from '../../shared/data-access/bet.service';
import { InputNumber } from 'primeng/inputnumber';

interface PlayerWithScoreChanges extends PlayerWithUserAndRankInfo {
  scoreChange: number;
}

@Component({
  selector: 'joshies-duel-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    AvatarModule,
    SkeletonModule,
    Select,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    TableModule,
    StronglyTypedTableRowDirective,
    NumberWithSignAndColorPipe,
    SelectButtonModule,
    InputNumber,
  ],
  template: `
    <joshies-page-header headerText="Duel" alwaysSmall>
      <joshies-header-link
        text="Duels"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.duel) {
        <div class="grow flex flex-col justify-between">
          <div>
            <!-- Players -->
            <div class="mt-8 flex items-center justify-center gap-4">
              <div class="flex flex-col items-center gap-1 text-neutral-500">
                <p-avatar
                  size="xlarge"
                  shape="circle"
                  [image]="vm.duel.challenger?.avatar_url ?? ''"
                />
                {{ vm.duel.challenger?.display_name }}
              </div>

              <span class="mb-6">vs.</span>

              @if (vm.duel.opponent; as opponent) {
                <div class="flex flex-col items-center gap-1 text-neutral-500">
                  <p-avatar
                    size="xlarge"
                    shape="circle"
                    [image]="opponent.avatar_url"
                  />
                  {{ opponent.display_name }}
                </div>
              } @else {
                <i
                  class="pi pi-question-circle text-6xl text-neutral-300 mb-6"
                ></i>
              }
            </div>

            @switch (vm.duel.status) {
              @case (DuelStatus.OpponentNotSelected) {
                <!-- Select Game -->
                <label class="mt-8 flex flex-col gap-2">
                  Select Opponent
                  <p-select
                    [options]="vm.allPlayersExceptChallenger"
                    optionLabel="display_name"
                    optionValue="player_id"
                    styleClass="w-full"
                    [(ngModel)]="selectedOpponentPlayerId"
                    [disabled]="backendActionInProgress()"
                  />
                </label>

                @if (selectedOpponent(); as selectedOpponent) {
                  <!-- "Lock in Game" Button -->
                  <p-button
                    label="Lock in Opponent"
                    styleClass="mt-4 w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="selectingOpponent()"
                    (onClick)="
                      confirmSelectOpponent(
                        vm.duel.id,
                        selectedOpponent.player_id,
                        selectedOpponent.display_name
                      )
                    "
                  />
                }
              }
              @case (DuelStatus.WagerNotSelected) {
                <!-- Select Wager -->
                <label class="mt-8 flex flex-col gap-2">
                  Select Wager

                  <p-inputNumber
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    [step]="5"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    inputStyleClass="w-full text-center"
                    styleClass="w-full"
                    suffix="%"
                    [min]="1"
                    [max]="100"
                    [(ngModel)]="selectedWagerPercentage"
                    [disabled]="backendActionInProgress()"
                  />
                </label>

                <!-- "Lock in Wager" Button -->
                <p-button
                  label="Lock in Wager"
                  styleClass="mt-4 w-full"
                  [disabled]="backendActionInProgress()"
                  [loading]="selectingWagerPercentage()"
                  (onClick)="
                    confirmSelectWagerPercentage(
                      vm.duel.id,
                      selectedWagerPercentage()
                    )
                  "
                />
              }
              @case (DuelStatus.GameNotSelected) {
                <p class="mb-4 mt-8 text-neutral-500">
                  Wager:
                  <span class="font-bold">
                    {{ vm.duel.wager_percentage }}%
                  </span>
                  of the loser's points
                </p>

                <!-- Select Game -->
                <label class="mt-8 flex flex-col gap-2">
                  Select Game
                  <p-select
                    [options]="gameOptions()"
                    styleClass="w-full"
                    [(ngModel)]="selectedGame"
                    [disabled]="backendActionInProgress()"
                  />
                </label>

                @if (selectedGame(); as selectedGame) {
                  <!-- "Lock in Game" Button -->
                  <p-button
                    label="Lock in Game (Opens Betting)"
                    styleClass="mt-4 w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="selectingGame()"
                    (onClick)="confirmSelectGame(vm.duel.id, selectedGame)"
                  />
                }
              }
              @case (DuelStatus.WaitingToBegin) {
                <h2 class="font-bold mt-8 mb-2">{{ vm.duel.game_name }}</h2>

                <p class="mb-4 text-neutral-500">
                  Wager:
                  <span class="font-bold">
                    {{ vm.duel.wager_percentage }}%
                  </span>
                  of the loser's points
                </p>

                <p-button
                  label="Start Duel (Closes Betting)"
                  severity="success"
                  styleClass="w-full"
                  [disabled]="backendActionInProgress()"
                  [loading]="startingDuel()"
                  (onClick)="confirmStartDuel(vm.duel.id)"
                />
              }
              @case (DuelStatus.InProgress) {
                <h2 class="font-bold mt-8 mb-2">{{ vm.duel.game_name }}</h2>

                <p class="mb-4 text-neutral-500">
                  Wager:
                  <span class="font-bold">
                    {{ vm.duel.wager_percentage }}%
                  </span>
                  of the loser's points
                </p>

                <label class="flex items-center gap-4 mt-8 mb-6">
                  Winner:
                  <p-selectButton
                    [options]="winnerOptions()"
                    optionLabel="name"
                    optionValue="challengerWon"
                    [(ngModel)]="selectedChallengerWon"
                  />
                </label>

                @if (playersWithScoreChanges(); as playersWithScoreChanges) {
                  <p-table [value]="playersWithScoreChanges">
                    <ng-template #header>
                      <tr>
                        <th>Player</th>
                        <th class="text-right">Current Score</th>
                        <th class="text-right">Change</th>
                      </tr>
                    </ng-template>
                    <ng-template
                      #body
                      let-player
                      [joshiesStronglyTypedTableRow]="playersWithScoreChanges"
                    >
                      <tr>
                        <td>
                          <div class="flex items-center gap-2">
                            <p-avatar
                              [image]="player.avatar_url"
                              shape="circle"
                            />
                            {{ player.display_name }}
                          </div>
                        </td>
                        <td class="text-right">{{ player.score }}</td>
                        <td
                          class="text-right"
                          [innerHTML]="
                            player.scoreChange | numberWithSignAndColor
                          "
                        ></td>
                      </tr>
                    </ng-template>
                  </p-table>

                  <p-button
                    label="Submit Results"
                    styleClass="mt-8 w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="submittingResults()"
                    (onClick)="
                      confirmSubmitResults(
                        vm.duel.id,
                        selectedChallengerWon(),
                        playersWithScoreChanges
                      )
                    "
                  />
                } @else {
                  Loading score changes...
                }
              }
            }
          </div>

          @if (vm.showCancelButton) {
            <p-button
              [text]="true"
              severity="danger"
              label="Cancel this Duel"
              styleClass="mt-12 w-full"
              [disabled]="backendActionInProgress()"
              [loading]="cancelingDuel()"
              (onClick)="
                confirmCancelDuel(
                  vm.duel.id,
                  vm.duel.challenger?.display_name ?? 'the challenger'
                )
              "
            />
          }
        </div>
      } @else {
        <p class="mb-4 mt-8">
          No special space event found with ID
          <strong>{{ vm.duelId }}</strong>
        </p>
      }
    } @else {
      <p-skeleton height="30rem" styleClass="mt-8" />
    }
  `,
  host: {
    class: 'flex flex-col h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DuelPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly playerService = inject(PlayerService);
  private readonly duelService = inject(DuelService);
  private readonly gameStateService = inject(GameStateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly betService = inject(BetService);

  readonly duelId = input<string>();
  readonly duelId$ = toObservable(this.duelId);

  private readonly duels = toSignal(this.duelService.duels$);

  readonly duel$ = combineLatest({
    duelId: this.duelId$,
    duels: this.duelService.duels$,
  }).pipe(
    map(({ duelId, duels }) =>
      duelId === undefined
        ? null
        : duels.find((event) => event.id === Number(duelId)),
    ),
  );

  readonly duel = toSignal(this.duel$);

  private readonly roundNumber = this.gameStateService.roundNumber;

  private readonly allPlayersExceptChallenger = computed(() =>
    this.playerService
      .players()
      ?.filter(
        (player) => player.player_id !== this.duel()?.challenger_player_id,
      ),
  );

  readonly gameOptions = toSignal(
    this.duel$.pipe(
      distinctUntilChanged((a, b) => a?.status === b?.status),
      filter((duel) => duel?.status === DuelStatus.GameNotSelected),
      switchMap((duel) =>
        this.gameboardService.gameboardSpaces$.pipe(
          map((spaces) =>
            spaces?.find((space) => space.id === duel?.duel_space_id),
          ),
        ),
      ),
      map(
        (duelSpace) =>
          (duelSpace?.effect_data as DuelSpaceEffectData)?.duelGames ?? [],
      ),
    ),
  );

  readonly selectedGame = signal<DuelModel['game_name'] | null>(null);

  readonly selectedWagerPercentage = signal<DuelModel['wager_percentage']>(25);

  readonly selectedOpponentPlayerId = signal<
    DuelModel['opponent_player_id'] | null
  >(null);

  readonly selectedOpponent: Signal<PlayerWithUserAndRankInfo | undefined> =
    computed(() =>
      this.playerService
        .players()
        ?.find(
          (player) => player.player_id === this.selectedOpponentPlayerId(),
        ),
    );

  readonly selectedChallengerWon = signal(true);

  readonly allBets = toSignal(this.betService.allBetsForThisSession$);

  readonly playersWithScoreChanges: Signal<
    PlayerWithScoreChanges[] | undefined
  > = computed((): PlayerWithScoreChanges[] | undefined => {
    const duel = this.duel();
    if (!duel) return;

    const challenger = duel.challenger;
    if (!challenger) return;

    const opponent = duel.opponent;
    if (!opponent) return;

    const wagerPercentage = (duel.wager_percentage ?? 0) / 100;

    const activeBets =
      this.allBets()?.filter((bet) => bet.status === BetStatus.Active) ?? [];
    const challengerActiveRequesterBets = activeBets.filter(
      (bet) => bet.requester_player_id === challenger.player_id,
    );
    const challengerActiveOpponentBets = activeBets.filter(
      (bet) => bet.opponent_player_id === challenger.player_id,
    );
    let challengerTotalPoints = challenger.score;
    challengerActiveRequesterBets.forEach((bet) => {
      challengerTotalPoints += bet.requester_wager;
    });
    challengerActiveOpponentBets.forEach((bet) => {
      challengerTotalPoints += bet.opponent_wager;
    });

    const opponentActiveRequesterBets = activeBets.filter(
      (bet) => bet.requester_player_id === opponent.player_id,
    );
    const opponentActiveOpponentBets = activeBets.filter(
      (bet) => bet.opponent_player_id === opponent.player_id,
    );
    let opponentTotalPoints = opponent.score;
    opponentActiveRequesterBets.forEach((bet) => {
      opponentTotalPoints += bet.requester_wager;
    });
    opponentActiveOpponentBets.forEach((bet) => {
      opponentTotalPoints += bet.opponent_wager;
    });

    return [
      {
        ...challenger,
        scoreChange: Math.round(
          this.selectedChallengerWon()
            ? opponentTotalPoints * wagerPercentage
            : challengerTotalPoints * -wagerPercentage,
        ),
      },
      {
        ...opponent,
        scoreChange: Math.round(
          this.selectedChallengerWon()
            ? opponentTotalPoints * -wagerPercentage
            : challengerTotalPoints * wagerPercentage,
        ),
      },
    ];
  });

  readonly winnerOptions = computed(() => [
    {
      name: this.duel()?.challenger?.display_name ?? 'Challenger',
      challengerWon: true,
    },
    {
      name: this.duel()?.opponent?.display_name ?? 'Opponent',
      challengerWon: false,
    },
  ]);

  private readonly showCancelButton = computed(
    () =>
      ![
        DuelStatus.Canceled,
        DuelStatus.ChallengerWon,
        DuelStatus.OpponentWon,
        undefined,
      ].includes(this.duel()?.status),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      duelId: this.duelId(),
      duel: this.duel(),
      roundNumber: this.roundNumber(),
      showCancelButton: this.showCancelButton(),
      allPlayersExceptChallenger: this.allPlayersExceptChallenger(),
    }),
  );

  readonly selectingOpponent = signal(false);
  readonly selectingWagerPercentage = signal(false);
  readonly selectingGame = signal(false);
  readonly startingDuel = signal(false);
  readonly cancelingDuel = signal(false);
  readonly submittingResults = signal(false);

  readonly backendActionInProgress = computed(
    () =>
      this.selectingOpponent() ||
      this.selectingWagerPercentage() ||
      this.selectingGame() ||
      this.startingDuel() ||
      this.cancelingDuel() ||
      this.submittingResults(),
  );

  confirmSelectOpponent(
    duelId: DuelModel['id'],
    opponentPlayerId: NonNullable<DuelModel['opponent_player_id']>,
    opponentPlayerDisplayName: UserModel['display_name'],
  ): void {
    confirmBackendAction({
      action: async () =>
        this.duelService.selectOpponent(duelId, opponentPlayerId),
      confirmationMessageText: `Are you sure you want to lock in ${opponentPlayerDisplayName} as the opponent? This cannot be changed.`,
      successMessageText: 'Opponent locked in',
      submittingSignal: this.selectingOpponent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSelectWagerPercentage(
    duelId: DuelModel['id'],
    wagerPercentage: DuelModel['wager_percentage'],
  ): void {
    confirmBackendAction({
      action: async () =>
        this.duelService.selectWagerPercentage(duelId, wagerPercentage),
      confirmationMessageText: `Are you sure you want to lock in ${wagerPercentage}%? This cannot be changed.`,
      successMessageText: 'Wager locked in',
      submittingSignal: this.selectingWagerPercentage,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSelectGame(
    duelId: DuelModel['id'],
    game: DuelModel['game_name'],
  ): void {
    confirmBackendAction({
      action: async () => this.duelService.selectGame(duelId, game),
      confirmationMessageText: `Are you sure you want to lock in "${game}"? This cannot be changed. Betting will open for this duel.`,
      successMessageText: 'Game locked in. Betting is now open!',
      submittingSignal: this.selectingGame,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmStartDuel(duelId: SpecialSpaceEventModel['id']): void {
    confirmBackendAction({
      action: async () => this.duelService.startDuel(duelId),
      confirmationMessageText: `Are you sure you want to start? Betting will close for this event.`,
      successMessageText: 'Betting is now closed',
      submittingSignal: this.startingDuel,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSubmitResults(
    duelId: DuelModel['id'],
    challengerWon: boolean,
    playersWithScoreChanges: PlayerWithScoreChanges[],
  ): void {
    const playerScoreChanges = playersWithScoreChanges.reduce<
      Record<PlayerModel['id'], number>
    >(
      (prev, player) => ({
        ...prev,
        [player.player_id]: player.scoreChange,
      }),
      {},
    );

    confirmBackendAction({
      action: async () =>
        this.duelService.submitDuelResults(
          duelId,
          challengerWon,
          playerScoreChanges,
        ),
      confirmationMessageText: `Are you sure you want to submit these results?`,
      successMessageText: 'Scores updated',
      submittingSignal: this.submittingResults,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmCancelDuel(
    duelId: SpecialSpaceEventModel['id'],
    displayName: string,
  ): void {
    confirmBackendAction({
      action: async () => this.duelService.cancelDuel(duelId),
      confirmationMessageText: `Are you sure you cancel ${displayName}'s duel? This cannot be undone.`,
      successMessageText: 'Duel canceled',
      submittingSignal: this.cancelingDuel,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  protected readonly DuelStatus = DuelStatus;
}
