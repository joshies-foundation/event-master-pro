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
  filter,
  map,
  Observable,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import {
  defined,
  distinctUntilIdChanged,
  whenNotNull,
} from '../../shared/util/rxjs-helpers';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { DropdownModule } from 'primeng/dropdown';
import {
  EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails,
  PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails,
  PlayerModel,
  SpecialSpaceEffectData,
  SpecialSpaceEventModel,
  SpecialSpaceEventTemplateModel,
  SpecialSpaceEventType,
} from '../../shared/util/supabase-types';
import { SpaceEventStatus } from '../../shared/util/supabase-helpers';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';

interface PlayerWithScoreChanges extends PlayerWithUserAndRankInfo {
  scoreChange: number;
}

@Component({
  selector: 'joshies-special-space-event-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    AvatarModule,
    SkeletonModule,
    DropdownModule,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    TitleCasePipe,
    TableModule,
    StronglyTypedTableRowDirective,
    NumberWithSignAndColorPipe,
    JsonPipe,
  ],
  template: `
    <joshies-page-header headerText="Special Space Event" alwaysSmall>
      <joshies-header-link
        text="Events"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.specialSpaceEvent) {
        <div class="flex-grow-1 flex flex-column justify-content-between">
          <div>
            <!-- Player -->
            <div class="mt-5 flex align-items-center gap-3">
              <p-avatar
                size="large"
                shape="circle"
                [image]="vm.specialSpaceEvent.player?.avatar_url ?? ''"
              />
              {{ vm.specialSpaceEvent.player?.display_name }}'s Special Space
              event for turn
              {{ vm.roundNumber }}
            </div>

            @switch (vm.specialSpaceEvent.status) {
              @case (SpaceEventStatus.EventNotSelected) {
                <!-- Select Event -->
                <label class="mt-5 flex flex-column gap-2">
                  Select Event
                  <p-dropdown
                    [options]="eventOptions()"
                    optionLabel="name"
                    optionValue="id"
                    styleClass="w-full"
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
                    @case (
                      SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank
                    ) {
                      @if (
                        playersWithScoreChanges();
                        as playersWithScoreChanges
                      ) {
                        <p-table [value]="playersWithScoreChanges">
                          <ng-template pTemplate="header">
                            <tr>
                              <th>Player</th>
                              <th class="text-right">Current Score</th>
                              <th class="text-right">Change</th>
                            </tr>
                          </ng-template>
                          <ng-template
                            pTemplate="body"
                            let-player
                            [joshiesStronglyTypedTableRow]="
                              playersWithScoreChanges
                            "
                          >
                            <tr>
                              <td>
                                <div class="flex align-items-center gap-2">
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
                          styleClass="mt-4 w-full"
                          [disabled]="backendActionInProgress()"
                          [loading]="selectingEvent()"
                          (onClick)="
                            confirmSubmitScoreChanges(
                              vm.specialSpaceEvent.id,
                              selectedEventTemplateId()!,
                              playersWithScoreChanges
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
                            vm.specialSpaceEvent.id,
                            selectedEventTemplate
                          )
                        "
                      />
                    }
                  }
                }
              }
              @case (SpaceEventStatus.WaitingToBegin) {
                @if (vm.specialSpaceEvent.template) {
                  <h3 class="mt-5 mb-2">
                    {{ vm.specialSpaceEvent.template.name }}
                  </h3>
                  <pre class="mt-0 mb-5 pre-wrap">{{
                    vm.specialSpaceEvent.template.description
                  }}</pre>

                  <p-button
                    label="Start Event (Closes Betting)"
                    severity="success"
                    styleClass="w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="startingEvent()"
                    (onClick)="confirmStartEvent(vm.specialSpaceEvent.id)"
                  />
                } @else {
                  Event template not found
                }
              }
              @case (SpaceEventStatus.InProgress) {
                @if (vm.specialSpaceEvent.template) {
                  <h3 class="mt-5 mb-2">
                    {{ vm.specialSpaceEvent.template.name }}
                  </h3>
                  <pre class="mt-0 mb-5 pre-wrap">{{
                    vm.specialSpaceEvent.template.description
                  }}</pre>

                  <label class="flex flex-column gap-2">
                    {{
                      $any(vm.specialSpaceEvent.template.details)
                        ?.pointsLabelPlural ?? 'points' | titlecase
                    }}
                    <p-inputNumber
                      [(ngModel)]="score"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      [step]="1"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                      inputStyleClass="w-full font-semibold text-right"
                      styleClass="w-full"
                      [disabled]="backendActionInProgress()"
                    />
                  </label>

                  <p>
                    Session Points: <strong>{{ sessionPoints() }}</strong>
                  </p>

                  <p-button
                    label="Submit Score"
                    styleClass="mt-5 w-full"
                    [disabled]="backendActionInProgress()"
                    [loading]="startingEvent()"
                    (onClick)="
                      confirmSubmitScore(
                        vm.specialSpaceEvent.id,
                        score(),
                        sessionPoints(),
                        vm.specialSpaceEvent.player?.display_name ?? ''
                      )
                    "
                  />
                } @else {
                  Event template not found
                }
              }
              @default {
                <h3>
                  {{
                    vm.specialSpaceEvent.template?.name ??
                      'Cannot find Special Space Event Template with ID ' +
                        vm.specialSpaceEvent.template_id
                  }}
                </h3>
                <h4>Results</h4>
                <p>{{ vm.specialSpaceEvent.results | json }}</p>
              }
            }
          </div>

          @if (vm.showCancelButton) {
            <p-button
              [text]="true"
              severity="danger"
              label="Cancel this Special Space Event"
              styleClass="mt-6 w-full"
              [disabled]="backendActionInProgress()"
              [loading]="cancelingEvent()"
              (onClick)="
                confirmCancelSpecialSpaceEvent(
                  vm.specialSpaceEvent.id,
                  vm.specialSpaceEvent.player?.display_name ?? ''
                )
              "
            />
          }
        </div>
      } @else {
        <p class="mt-5">
          No special space event found with ID
          <strong>{{ vm.specialSpaceEventId }}</strong>
        </p>
      }
    } @else {
      <p-skeleton height="30rem" styleClass="mt-5" />
    }
  `,
  host: {
    class: 'flex flex-column h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpecialSpaceEventPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly specialSpaceEventId = input<string>();
  readonly specialSpaceEventId$ = toObservable(this.specialSpaceEventId);

  private readonly specialSpaceEvents = toSignal(
    this.gameboardService.specialSpaceEvents$,
  );

  readonly specialSpaceEvent$ = combineLatest({
    specialSpaceEventId: this.specialSpaceEventId$,
    specialSpaceEvents: this.gameboardService.specialSpaceEvents$,
  }).pipe(
    map(({ specialSpaceEventId, specialSpaceEvents }) =>
      specialSpaceEventId === undefined
        ? null
        : specialSpaceEvents.find(
            (event) => event.id === Number(specialSpaceEventId),
          ),
    ),
  );

  readonly specialSpaceEvent = toSignal(this.specialSpaceEvent$);

  private readonly roundNumber = this.gameStateService.roundNumber;

  readonly eventOptions = toSignal(
    this.specialSpaceEvent$.pipe(
      distinctUntilIdChanged(),
      filter(
        (specialSpaceEvent) =>
          specialSpaceEvent?.status === SpaceEventStatus.EventNotSelected,
      ),
      switchMap((specialSpaceEvent) =>
        this.gameboardService.gameboardSpaces$.pipe(
          map((spaces) =>
            spaces?.find(
              (space) => space.id === specialSpaceEvent?.special_space_id,
            ),
          ),
        ),
      ),
      switchMap((specialSpace) =>
        this.gameboardService.specialSpaceEventTemplates$.pipe(
          map((eventTemplates) =>
            eventTemplates?.filter((eventTemplate) =>
              (
                specialSpace?.effect_data as SpecialSpaceEffectData | undefined
              )?.specialSpaceEventTemplateIds?.includes(eventTemplate.id),
            ),
          ),
        ),
      ),
    ),
  );

  readonly selectedEventTemplateId = signal<
    SpecialSpaceEventModel['id'] | null
  >(null);
  readonly selectedEventTemplateId$ = toObservable(
    this.selectedEventTemplateId,
  );

  readonly selectedEventTemplate$: Observable<SpecialSpaceEventTemplateModel | null> =
    this.selectedEventTemplateId$.pipe(
      whenNotNull((selectedEventTemplateId) =>
        this.gameboardService.specialSpaceEventTemplates$.pipe(
          map(
            (templates) =>
              templates?.find(
                (template: SpecialSpaceEventTemplateModel) =>
                  template.id === selectedEventTemplateId,
              ) ?? null,
          ),
        ),
      ),
    );

  readonly selectedEventTemplate: Signal<
    SpecialSpaceEventTemplateModel | null | undefined
  > = toSignal(this.selectedEventTemplate$);

  readonly playersWithScoreChanges: Signal<
    PlayerWithScoreChanges[] | undefined
  > = toSignal(
    this.selectedEventTemplate$.pipe(
      defined(),
      withLatestFrom(this.playerService.players$),
      map(([specialSpaceEventTemplate, players]) =>
        players!.map((player) => ({
          ...player,
          scoreChange: Math.round(
            (((
              specialSpaceEventTemplate.details as EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails
            )?.lastPlacePoints ?? 0) /
              players!.length) *
              player.rank,
          ),
        })),
      ),
    ),
  );

  private readonly showCancelButton = computed(
    () =>
      ![
        SpaceEventStatus.Canceled,
        SpaceEventStatus.Finished,
        undefined,
      ].includes(this.specialSpaceEvent()?.status),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      specialSpaceEventId: this.specialSpaceEventId(),
      specialSpaceEvent: this.specialSpaceEvent(),
      roundNumber: this.roundNumber(),
      showCancelButton: this.showCancelButton(),
    }),
  );

  readonly score = signal(0);

  readonly sessionPoints = computed(() =>
    Math.floor(
      this.score() *
        ((
          this.specialSpaceEvent()?.template?.details as
            | PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails
            | undefined
        )?.sessionPointsPerGamePoint ?? 0),
    ),
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
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    specialSpaceEventTemplate: SpecialSpaceEventTemplateModel,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.selectSpecialSpaceEventTemplate(
          specialSpaceEventId,
          specialSpaceEventTemplate.id,
        ),
      confirmationMessageText: `Are you sure you want to lock in "${specialSpaceEventTemplate.name}"? This cannot be changed. Betting will open for this event.`,
      successMessageText: 'Event locked in. Betting is now open!',
      submittingSignal: this.selectingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmStartEvent(specialSpaceEventId: SpecialSpaceEventModel['id']): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.startSpecialSpaceEvent(specialSpaceEventId),
      confirmationMessageText: `Are you sure you want to start? Betting will close for this event.`,
      successMessageText: 'Betting is now closed',
      submittingSignal: this.startingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSubmitScore(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    score: number,
    sessionPoints: number,
    displayName: string,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.submitSpecialSpaceEventScore(
          specialSpaceEventId,
          score,
        ),
      confirmationMessageText: `Are you sure you want to submit? ${displayName} will receive ${sessionPoints} points.`,
      successMessageText: 'Special Space Event score submitted',
      submittingSignal: this.startingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  confirmSubmitScoreChanges(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    specialSpaceEventTemplateId: SpecialSpaceEventTemplateModel['id'],
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
        this.gameboardService.submitGainPointsBasedOnRankSpecial(
          specialSpaceEventId,
          specialSpaceEventTemplateId,
          playerScoreChanges,
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

  confirmCancelSpecialSpaceEvent(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    displayName: string,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.cancelSpecialSpaceEvent(specialSpaceEventId),
      confirmationMessageText: `Are you sure you cancel ${displayName}'s Special Space Event? This cannot be undone.`,
      successMessageText: 'Special Space Event canceled',
      submittingSignal: this.startingEvent,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  protected readonly SpaceEventStatus = SpaceEventStatus;
  protected readonly SpecialSpaceEventType = SpecialSpaceEventType;
}
