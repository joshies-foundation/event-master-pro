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
  combineLatestWith,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import {
  defined,
  distinctUntilIdChanged,
  whenAllValuesNotNull,
  whenNotNull,
} from '../../shared/util/rxjs-helpers';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { Select } from 'primeng/select';
import {
  ChaosSpaceEffectData,
  ChaosSpaceEventModel,
  ChaosSpaceEventTemplateModel,
  ChaosSpaceEventType,
  EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails,
  EveryoneLosesPercentageOfTheirPointsChaosSpaceDetails,
} from '../../shared/util/supabase-types';
import {
  BetStatus,
  SpaceEventStatus,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { playersWithScoreChangesToPlayerScoreChanges } from '../util/score-change-helpers';
import { CheckboxModule } from 'primeng/checkbox';
import { BetService } from '../../shared/data-access/bet.service';

interface PlayerWithScoreChanges extends PlayerWithUserAndRankInfo {
  scoreChange: number;
}

@Component({
  selector: 'joshies-chaos-space-event-page',
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
    CheckboxModule,
    DecimalPipe,
    JsonPipe,
  ],
  template: `
    <joshies-page-header headerText="Chaos Space Event" alwaysSmall>
      <joshies-header-link
        text="Events"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.chaosSpaceEvent) {
        <div class="flex grow flex-col justify-between">
          <div>
            <!-- Player -->
            <div class="mt-8 flex items-center gap-4">
              <p-avatar
                size="large"
                shape="circle"
                [image]="vm.chaosSpaceEvent.player?.avatar_url ?? ''"
              />
              {{ vm.chaosSpaceEvent.player?.display_name }}'s Chaos Space event
              for turn
              {{ vm.roundNumber }}
            </div>

            @switch (vm.chaosSpaceEvent.status) {
              @case (SpaceEventStatus.EventNotSelected) {
                <!-- Select Event -->
                <label class="mt-8 flex flex-col gap-2">
                  Select Event
                  <p-select
                    [options]="eventOptions()"
                    optionLabel="name"
                    optionValue="id"
                    class="w-full"
                    [(ngModel)]="selectedEventTemplateId"
                    [disabled]="backendActionInProgress()"
                  />
                </label>

                @if (selectedEventTemplate(); as selectedEventTemplate) {
                  <!-- Event Description -->
                  <p class="pre-wrap">
                    {{ selectedEventTemplate.description }}
                  </p>

                  @switch (selectedEventTemplate.type) {
                    @case (ChaosSpaceEventType.EveryoneGainsPointsBasedOnRank) {
                      @if (
                        playersWithScoreChanges();
                        as playersWithScoreChanges
                      ) {
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
                            [joshiesStronglyTypedTableRow]="
                              playersWithScoreChanges
                            "
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

                        <!-- Submit Changes Button -->
                        <p-button
                          label="Submit Score Changes"
                          styleClass="mt-6 w-full"
                          [disabled]="backendActionInProgress()"
                          [loading]="submittingScoreChanges()"
                          (onClick)="
                            confirmSubmitGainPointsBasedOnRank(
                              vm.chaosSpaceEvent.id,
                              selectedEventTemplateId()!,
                              playersWithScoreChanges
                            )
                          "
                        />
                      } @else {
                        Loading score changes...
                      }
                    }
                    @case (
                      ChaosSpaceEventType.EveryoneLosesPercentageOfTheirPoints
                    ) {
                      @if (
                        playersWithEveryonePointLosses();
                        as playersWithEveryonePointLosses
                      ) {
                        <p>
                          Percentage Loss:
                          <strong>{{ percentageLossFromSelected() }}%</strong>
                        </p>

                        <p-table
                          [value]="playersWithEveryonePointLosses"
                          [rowTrackBy]="trackByPlayerId"
                        >
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
                            [joshiesStronglyTypedTableRow]="
                              playersWithEveryonePointLosses
                            "
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

                        <!-- Submit Changes Button -->
                        <p-button
                          label="Submit Score Changes"
                          styleClass="mt-6 w-full"
                          [disabled]="backendActionInProgress()"
                          [loading]="submittingScoreChanges()"
                          (onClick)="
                            confirmSubmitEveryoneLosesPercentageOfPoints(
                              vm.chaosSpaceEvent.id,
                              selectedEventTemplateId()!,
                              percentageLossFromSelected()!,
                              playersWithEveryonePointLosses
                            )
                          "
                        />
                      } @else {
                        Loading score changes...
                      }
                    }
                    @case (ChaosSpaceEventType.PointSwap) {
                      @if (
                        playersWithSwappedPointScoreChanges();
                        as playersWithSwappedPointScoreChanges
                      ) {
                        <h4 class="my-4 font-bold">
                          Choose 2 players who will swap points:
                        </h4>

                        <p-table
                          [value]="playersWithSwappedPointScoreChanges"
                          [rowTrackBy]="trackByPlayerId"
                          selectionMode="multiple"
                          [(selection)]="playerIdsWhoWillSwapPoints"
                        >
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
                            [joshiesStronglyTypedTableRow]="
                              playersWithSwappedPointScoreChanges
                            "
                          >
                            <tr>
                              <td>
                                <div class="flex items-center gap-2">
                                  <p-tableCheckbox
                                    [value]="player.player_id"
                                    [disabled]="
                                      playerIdsWhoWillSwapPoints().length ===
                                        2 &&
                                      !playerIdsWhoWillSwapPoints().includes(
                                        player.player_id
                                      )
                                    "
                                  />
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

                        <!-- Submit Changes Button -->
                        <p-button
                          label="Submit Score Changes"
                          styleClass="mt-6 w-full"
                          [disabled]="
                            backendActionInProgress() ||
                            playerIdsWhoWillSwapPoints().length !== 2
                          "
                          [loading]="submittingScoreChanges()"
                          (onClick)="
                            confirmPointSwap(
                              vm.chaosSpaceEvent.id,
                              selectedEventTemplateId()!,
                              playersWithSwappedPointScoreChanges
                            )
                          "
                        />
                      } @else {
                        Loading score changes...
                      }
                    }
                    @default {
                      <!-- "Lock in Event" Button -->
                      <p-button
                        label="Lock in Event (Opens Betting)"
                        styleClass="w-full"
                        [disabled]="backendActionInProgress()"
                        [loading]="selectingEvent()"
                        (onClick)="
                          confirmSelectEventTemplate(
                            vm.chaosSpaceEvent.id,
                            selectedEventTemplate
                          )
                        "
                      />
                    }
                  }
                }
              }
              @case (SpaceEventStatus.WaitingToBegin) {
                @if (vm.chaosSpaceEvent.template) {
                  <h3 class="mt-8 mb-2 text-lg font-bold">
                    {{ vm.chaosSpaceEvent.template.name }}
                  </h3>
                  <pre class="pre-wrap mb-8">{{
                    vm.chaosSpaceEvent.template.description
                  }}</pre>

                  <p-button
                    label="Start Event (Closes Betting)"
                    severity="success"
                    styleClass="w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="startingEvent()"
                    (onClick)="confirmStartEvent(vm.chaosSpaceEvent.id)"
                  />
                } @else {
                  Event template not found
                }
              }
              @case (SpaceEventStatus.InProgress) {
                @if (vm.chaosSpaceEvent.template) {
                  <h3 class="mt-8 mb-2 text-lg font-bold">
                    {{ vm.chaosSpaceEvent.template.name }}
                  </h3>
                  <pre class="pre-wrap mb-8">{{
                    vm.chaosSpaceEvent.template.description
                  }}</pre>

                  <p>
                    Percentage Loss for Failure:
                    <strong>{{ percentageLoss() }}%</strong>
                  </p>

                  <h4 class="my-4 font-bold">Who failed?</h4>

                  @if (
                    playersWithScoreChangesBasedOnTaskFailure();
                    as playersWithScoreChangesBasedOnTaskFailure
                  ) {
                    <p-table
                      [value]="playersWithScoreChangesBasedOnTaskFailure"
                      [rowTrackBy]="trackByPlayerId"
                      selectionMode="multiple"
                      [(selection)]="playerIdsWhoFailedTask"
                    >
                      <ng-template #header>
                        <tr>
                          <th>Player</th>
                          <th class="pl-0 text-right">Current Score</th>
                          <th class="pl-0 text-right">Change</th>
                        </tr>
                      </ng-template>
                      <ng-template
                        #body
                        let-player
                        [joshiesStronglyTypedTableRow]="
                          playersWithScoreChangesBasedOnTaskFailure
                        "
                      >
                        <tr>
                          <td>
                            <div class="flex items-center gap-2">
                              <p-tableCheckbox [value]="player.player_id" />
                              <p-avatar
                                [image]="player.avatar_url"
                                shape="circle"
                              />
                              {{ player.display_name }}
                            </div>
                          </td>
                          <td class="pl-0 text-right">
                            {{ player.score | number }}
                          </td>
                          <td
                            class="pl-0 text-right"
                            [innerHTML]="
                              player.scoreChange | numberWithSignAndColor
                            "
                          ></td>
                        </tr>
                      </ng-template>
                    </p-table>

                    <!-- Submit Changes Button -->
                    <p-button
                      label="Submit Score Changes"
                      styleClass="mt-6 w-full"
                      [disabled]="backendActionInProgress()"
                      [loading]="submittingScoreChanges()"
                      (onClick)="
                        confirmSubmitLosePercentageOfTheirPointsBasedOnTaskFailure(
                          vm.chaosSpaceEvent.id,
                          vm.chaosSpaceEvent.template_id!,
                          percentageLoss()!,
                          $any(vm.chaosSpaceEvent.template.details).taskName ??
                            'do the task',
                          playersWithScoreChangesBasedOnTaskFailure
                        )
                      "
                    />
                  } @else {
                    Loading data...
                  }
                } @else {
                  Event template not found
                }
              }
              @default {
                <h3 class="text-lg font-bold">
                  {{
                    vm.chaosSpaceEvent.template?.name ??
                      'Cannot find Chaos Space Event Template with ID ' +
                        vm.chaosSpaceEvent.template_id
                  }}
                </h3>
                <h4 class="my-4 font-bold">Results</h4>
                <p>{{ vm.chaosSpaceEvent.results | json }}</p>
              }
            }
          </div>

          @if (vm.showCancelButton) {
            <p-button
              [text]="true"
              severity="danger"
              label="Cancel this Chaos Space Event"
              styleClass="mt-12 w-full"
              [disabled]="backendActionInProgress()"
              [loading]="cancelingEvent()"
              (onClick)="
                confirmCancelChaosSpaceEvent(
                  vm.chaosSpaceEvent.id,
                  vm.chaosSpaceEvent.player?.display_name ?? ''
                )
              "
            />
          }
        </div>
      } @else {
        <p class="mt-8">
          No chaos space event found with ID
          <strong>{{ vm.chaosSpaceEventId }}</strong>
        </p>
      }
    } @else {
      <p-skeleton height="30rem" class="mt-8" />
    }
  `,
  host: {
    class: 'flex flex-col h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChaosSpaceEventPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly betService = inject(BetService);

  readonly chaosSpaceEventId = input<string>();
  readonly chaosSpaceEventId$ = toObservable(this.chaosSpaceEventId);

  private readonly chaosSpaceEvents = toSignal(
    this.gameboardService.chaosSpaceEvents$,
  );

  readonly chaosSpaceEvent$ = combineLatest({
    chaosSpaceEventId: this.chaosSpaceEventId$,
    chaosSpaceEvents: this.gameboardService.chaosSpaceEvents$,
  }).pipe(
    map(({ chaosSpaceEventId, chaosSpaceEvents }) =>
      chaosSpaceEventId === undefined
        ? null
        : chaosSpaceEvents.find(
            (event) => event.id === Number(chaosSpaceEventId),
          ),
    ),
  );

  readonly chaosSpaceEvent = toSignal(this.chaosSpaceEvent$);

  private readonly roundNumber = this.gameStateService.roundNumber;

  readonly eventOptions = toSignal(
    this.chaosSpaceEvent$.pipe(
      distinctUntilIdChanged(),
      filter(
        (chaosSpaceEvent) =>
          chaosSpaceEvent?.status === SpaceEventStatus.EventNotSelected,
      ),
      switchMap((chaosSpaceEvent) =>
        this.gameboardService.gameboardSpaces$.pipe(
          map((spaces) =>
            spaces?.find(
              (space) => space.id === chaosSpaceEvent?.chaos_space_id,
            ),
          ),
        ),
      ),
      switchMap((chaosSpace) =>
        this.gameboardService.chaosSpaceEventTemplates$.pipe(
          map((eventTemplates) =>
            eventTemplates?.filter((eventTemplate) =>
              (
                chaosSpace?.effect_data as ChaosSpaceEffectData | undefined
              )?.chaosSpaceEventTemplateIds?.includes(eventTemplate.id),
            ),
          ),
        ),
      ),
    ),
  );

  readonly selectedEventTemplateId = signal<ChaosSpaceEventModel['id'] | null>(
    null,
  );
  readonly selectedEventTemplateId$ = toObservable(
    this.selectedEventTemplateId,
  );

  readonly selectedEventTemplate$: Observable<ChaosSpaceEventTemplateModel | null> =
    this.selectedEventTemplateId$.pipe(
      whenNotNull((selectedEventTemplateId) =>
        this.gameboardService.chaosSpaceEventTemplates$.pipe(
          map(
            (templates) =>
              templates?.find(
                (template: ChaosSpaceEventTemplateModel) =>
                  template.id === selectedEventTemplateId,
              ) ?? null,
          ),
        ),
      ),
    );

  readonly selectedEventTemplate: Signal<
    ChaosSpaceEventTemplateModel | null | undefined
  > = toSignal(this.selectedEventTemplate$);

  readonly playersWithScoreChanges: Signal<
    PlayerWithScoreChanges[] | undefined
  > = toSignal(
    this.selectedEventTemplate$.pipe(
      defined(),
      withLatestFrom(this.playerService.players$),
      map(([chaosSpaceEventTemplate, players]) =>
        players!.map((player) => ({
          ...player,
          scoreChange: Math.round(
            (((
              chaosSpaceEventTemplate.details as EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails
            )?.lastPlacePoints ?? 0) /
              players!.length) *
              player.rank,
          ),
        })),
      ),
    ),
  );

  readonly percentageLossFromSelected$ = this.selectedEventTemplate$.pipe(
    defined(),
    map(
      (chaosSpaceEventTemplate) =>
        (
          chaosSpaceEventTemplate.details as EveryoneLosesPercentageOfTheirPointsChaosSpaceDetails
        )?.percentageLoss ?? 0,
    ),
    shareReplay(1),
  );

  readonly percentageLossFromSelected = toSignal(
    this.percentageLossFromSelected$,
  );

  readonly percentageLoss$ = this.chaosSpaceEvent$.pipe(
    defined(),
    map(
      (chaosSpaceEvent) =>
        (
          chaosSpaceEvent.template
            ?.details as EveryoneLosesPercentageOfTheirPointsChaosSpaceDetails
        )?.percentageLoss ?? 0,
    ),
    shareReplay(1),
  );

  readonly percentageLoss = toSignal(this.percentageLoss$);

  readonly playersWithEveryonePointLosses: Signal<
    PlayerWithScoreChanges[] | undefined
  > = toSignal(
    this.percentageLossFromSelected$.pipe(
      defined(),
      combineLatestWith(this.playerService.players$),
      map(([percentageLoss, players]) =>
        players!.map((player) => ({
          ...player,
          scoreChange: Math.min(
            player.score ? -1 : 0,
            Math.round((percentageLoss / -100) * player.score),
          ),
        })),
      ),
    ),
  );

  readonly playerIdsWhoWillSwapPoints = signal<
    PlayerWithScoreChanges['player_id'][]
  >([]);

  readonly playerIdsWhoWillSwapPoints$ = toObservable(
    this.playerIdsWhoWillSwapPoints,
  );

  readonly playersWithSwappedPointScoreChanges: Signal<
    PlayerWithScoreChanges[] | null | undefined
  > = toSignal(
    this.playerIdsWhoWillSwapPoints$.pipe(
      defined(),
      combineLatestWith(this.playerService.players$),
      map(([playerIdsWhoWillSwapPoints, players]) => ({
        playerIdsWhoWillSwapPoints,
        players,
      })),
      whenAllValuesNotNull(({ playerIdsWhoWillSwapPoints, players }) =>
        of(
          players!.map((player) => ({
            ...player,
            scoreChange: playerIdsWhoWillSwapPoints.includes(player.player_id)
              ? Math.round(
                  (players.find(
                    (otherPlayer) =>
                      playerIdsWhoWillSwapPoints.includes(
                        otherPlayer.player_id,
                      ) && otherPlayer.player_id !== player.player_id,
                  )?.score ?? 0) - player.score,
                )
              : 0,
          })),
        ),
      ),
    ),
  );

  readonly playerIdsWhoFailedTask = signal<
    PlayerWithScoreChanges['player_id'][]
  >([]);

  readonly playerIdsWhoFailedTask$ = toObservable(this.playerIdsWhoFailedTask);

  readonly playersWithScoreChangesBasedOnTaskFailure: Signal<
    PlayerWithScoreChanges[] | undefined
  > = toSignal(
    combineLatest({
      players: this.playerService.players$,
      percentageLoss: this.percentageLoss$,
      playerIdsWhoFailedTask: this.playerIdsWhoFailedTask$,
      allBets: this.betService.allBetsForThisSession$,
    }).pipe(
      map(({ players, percentageLoss, playerIdsWhoFailedTask, allBets }) => {
        const activeBets =
          allBets?.filter((bet) => bet.status === BetStatus.Active) ?? [];
        return players!.map((player) => {
          const playerActiveRequesterBets = activeBets.filter(
            (bet) => bet.requester_player_id === player.player_id,
          );
          const playerActiveOpponentBets = activeBets.filter(
            (bet) => bet.opponent_player_id === player.player_id,
          );
          let totalPoints = player.score;
          playerActiveRequesterBets.forEach((bet) => {
            totalPoints += bet.requester_wager;
          });
          playerActiveOpponentBets.forEach((bet) => {
            totalPoints += bet.opponent_wager;
          });

          return {
            ...player,
            scoreChange: playerIdsWhoFailedTask.includes(player.player_id)
              ? Math.min(
                  totalPoints ? -1 : 0,
                  Math.round((percentageLoss / -100) * totalPoints),
                )
              : 0,
          };
        });
      }),
    ),
  );

  private readonly showCancelButton = computed(
    () =>
      ![
        SpaceEventStatus.Canceled,
        SpaceEventStatus.Finished,
        undefined,
      ].includes(this.chaosSpaceEvent()?.status),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      chaosSpaceEventId: this.chaosSpaceEventId(),
      chaosSpaceEvent: this.chaosSpaceEvent(),
      roundNumber: this.roundNumber(),
      showCancelButton: this.showCancelButton(),
    }),
  );

  readonly selectingEvent = signal(false);
  readonly startingEvent = signal(false);
  readonly cancelingEvent = signal(false);
  readonly submittingScore = signal(false);
  readonly submittingScoreChanges = signal(false);

  readonly backendActionInProgress = computed(
    () =>
      this.selectingEvent() ||
      this.startingEvent() ||
      this.cancelingEvent() ||
      this.submittingScore() ||
      this.submittingScoreChanges(),
  );

  confirmSelectEventTemplate(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    chaosSpaceEventTemplate: ChaosSpaceEventTemplateModel,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.selectChaosSpaceEventTemplate(
          chaosSpaceEventId,
          chaosSpaceEventTemplate.id,
        ),
      confirmationMessageText: `Are you sure you want to lock in "${chaosSpaceEventTemplate.name}"? This cannot be changed. Betting will open for this event.`,
      successMessageText: 'Event locked in. Betting is now open!',
      submittingSignal: this.selectingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmStartEvent(chaosSpaceEventId: ChaosSpaceEventModel['id']): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.startChaosSpaceEvent(chaosSpaceEventId),
      confirmationMessageText: `Are you sure you want to start? Betting will close for this event.`,
      successMessageText: 'Betting is now closed',
      submittingSignal: this.startingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSubmitGainPointsBasedOnRank(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    chaosSpaceEventTemplateId: ChaosSpaceEventTemplateModel['id'],
    playersWithScoreChanges: PlayerWithScoreChanges[],
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.submitGainPointsBasedOnRankChaos(
          chaosSpaceEventId,
          chaosSpaceEventTemplateId,
          playersWithScoreChangesToPlayerScoreChanges(playersWithScoreChanges),
        ),
      confirmationMessageText: `Are you sure you want to submit score changes?`,
      successMessageText: 'Scores updated',
      submittingSignal: this.submittingScoreChanges,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmPointSwap(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    chaosSpaceEventTemplateId: ChaosSpaceEventTemplateModel['id'],
    playersWithScoreChanges: PlayerWithScoreChanges[],
  ): void {
    const player1 = playersWithScoreChanges.find(
      (player) => player.scoreChange !== 0,
    );

    const player1DisplayName = player1?.display_name ?? 'Player 1';

    const player2 = playersWithScoreChanges.find(
      (player) =>
        player.scoreChange !== 0 && player.player_id !== player1?.player_id,
    );

    const player2DisplayName = player2?.display_name ?? 'Player @';

    confirmBackendAction({
      action: async () =>
        this.gameboardService.submitPointSwap(
          chaosSpaceEventId,
          chaosSpaceEventTemplateId,
          player1DisplayName,
          player2DisplayName,
          playersWithScoreChangesToPlayerScoreChanges(playersWithScoreChanges),
        ),
      confirmationMessageText: `Are you sure you want to swap ${player1DisplayName} and ${player2DisplayName}'s points?`,
      successMessageText: 'Scores updated',
      submittingSignal: this.submittingScoreChanges,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmSubmitEveryoneLosesPercentageOfPoints(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    chaosSpaceEventTemplateId: ChaosSpaceEventTemplateModel['id'],
    percentageLoss: number,
    playersWithScoreChanges: PlayerWithScoreChanges[],
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.submitEveryoneLosesPercentageOfTheirPoints(
          chaosSpaceEventId,
          chaosSpaceEventTemplateId,
          percentageLoss,
          playersWithScoreChangesToPlayerScoreChanges(playersWithScoreChanges),
        ),
      confirmationMessageText: `Are you sure you want to submit score changes?`,
      successMessageText: 'Scores updated',
      submittingSignal: this.submittingScoreChanges,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmSubmitLosePercentageOfTheirPointsBasedOnTaskFailure(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    chaosSpaceEventTemplateId: ChaosSpaceEventTemplateModel['id'],
    percentageLoss: number,
    taskName: string,
    playersWithScoreChanges: PlayerWithScoreChanges[],
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.submitLosePercentageOfTheirPointsBasedOnTaskFailure(
          chaosSpaceEventId,
          chaosSpaceEventTemplateId,
          percentageLoss,
          taskName,
          playersWithScoreChangesToPlayerScoreChanges(playersWithScoreChanges),
        ),
      confirmationMessageText: `Are you sure you want to submit score changes?`,
      successMessageText: 'Scores updated',
      submittingSignal: this.submittingScoreChanges,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmCancelChaosSpaceEvent(
    chaosSpaceEventId: ChaosSpaceEventModel['id'],
    displayName: string,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.cancelChaosSpaceEvent(chaosSpaceEventId),
      confirmationMessageText: `Are you sure you cancel ${displayName}'s Chaos Space Event? This cannot be undone.`,
      successMessageText: 'Chaos Space Event canceled',
      submittingSignal: this.startingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  protected readonly SpaceEventStatus = SpaceEventStatus;
  protected readonly ChaosSpaceEventType = ChaosSpaceEventType;
  protected readonly trackByPlayerId = trackByPlayerId;
}
