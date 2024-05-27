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
  PlayerWithUserInfo,
} from '../../shared/data-access/player.service';
import { AvatarModule } from 'primeng/avatar';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { SkeletonModule } from 'primeng/skeleton';
import { filter, map, shareReplay, switchMap } from 'rxjs';
import {
  defined,
  distinctUntilIdChanged,
  whenNotNull,
} from '../../shared/util/rxjs-helpers';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { DropdownModule } from 'primeng/dropdown';
import {
  PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails,
  SpecialSpaceEffectData,
  SpecialSpaceEventModel,
  SpecialSpaceEventTemplateModel,
} from '../../shared/util/supabase-types';
import { SpaceEventStatus } from '../../shared/util/supabase-helpers';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'joshies-special-space-event-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    AvatarModule,
    SkeletonModule,
    NgOptimizedImage,
    DropdownModule,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    TitleCasePipe,
  ],
  template: `
    <joshies-page-header headerText="Special Space Events" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.specialSpaceEvent) {
        @if (vm.player) {
          <div class="flex-grow-1 flex flex-column justify-content-between">
            <div>
              <!-- Player -->
              <div class="mt-5 flex align-items-center gap-3">
                <p-avatar
                  size="large"
                  shape="circle"
                  [image]="vm.player.avatar_url"
                />
                {{ vm.player.display_name }}'s Special Space event for turn
                {{ vm.roundNumber }}
              </div>

              @switch (vm.specialSpaceEvent.status) {
                @case (SpaceEventStatus.EventNotSelected) {
                  <!-- Select Event -->
                  <!-- eslint-disable-next-line -->
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
                @case (SpaceEventStatus.WaitingToBegin) {
                  @if (vm.specialSpaceEventTemplate) {
                    <h3 class="mt-5 mb-2">
                      {{ vm.specialSpaceEventTemplate.name }}
                    </h3>
                    <pre class="mt-0 mb-5 pre-wrap">{{
                      vm.specialSpaceEventTemplate.description
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
                  @if (vm.specialSpaceEventTemplate) {
                    <h3 class="mt-5 mb-2">
                      {{ vm.specialSpaceEventTemplate.name }}
                    </h3>
                    <pre class="mt-0 mb-5 pre-wrap">{{
                      vm.specialSpaceEventTemplate.description
                    }}</pre>

                    <!-- eslint-disable-next-line -->
                    <label class="flex flex-column gap-2">
                      {{
                        $any(vm.specialSpaceEventTemplate.details)
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
                          vm.player.display_name
                        )
                      "
                    />
                  } @else {
                    Event template not found
                  }
                }
              }
            </div>

            <p-button
              [text]="true"
              severity="danger"
              label="Cancel this Special Space Event"
              styleClass="w-full"
              [disabled]="backendActionInProgress()"
            />
          </div>
        } @else {
          <p class="mt-5">
            No player found with ID
            <strong>{{ vm.specialSpaceEvent.player_id }}</strong>
          </p>
        }
      } @else {
        <p class="mt-5">
          No special space event found with ID
          <strong>{{ specialSpaceEventId() }}</strong>
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

  readonly specialSpaceEventId = input.required<string>();
  readonly specialSpaceEventId$ = toObservable(this.specialSpaceEventId);

  readonly specialSpaceEvent$ = this.specialSpaceEventId$.pipe(
    defined(),
    switchMap((specialSpaceEventId) =>
      this.gameboardService.getRealtimeUpdatesFromSpecialSpaceEvent(
        Number(specialSpaceEventId),
      ),
    ),
    shareReplay(1),
  );

  readonly specialSpaceEvent = toSignal(this.specialSpaceEvent$);

  readonly specialSpaceEventTemplate: Signal<
    SpecialSpaceEventTemplateModel | null | undefined
  > = toSignal(
    this.specialSpaceEvent$.pipe(
      whenNotNull((specialSpaceEvent) =>
        this.gameboardService.specialSpaceEventTemplates$.pipe(
          map(
            (templates) =>
              templates?.find(
                (template) => template.id === specialSpaceEvent.template_id,
              ) ?? null,
          ),
        ),
      ),
    ),
  );

  readonly player: Signal<PlayerWithUserInfo | null | undefined> = computed(
    () => {
      const players = this.playerService.players();
      const specialSpaceEvent = this.specialSpaceEvent();

      if (!players) return players;
      if (!specialSpaceEvent) return specialSpaceEvent;

      return (
        players.find(
          (player) => player.player_id === specialSpaceEvent.player_id,
        ) ?? null
      );
    },
  );

  readonly roundNumber = this.gameStateService.roundNumber;

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

  readonly selectedEventTemplate: Signal<
    SpecialSpaceEventTemplateModel | null | undefined
  > = toSignal(
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
    ),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      specialSpaceEventId: this.specialSpaceEventId(),
      specialSpaceEvent: this.specialSpaceEvent(),
      specialSpaceEventTemplate: this.specialSpaceEventTemplate(),
      player: this.player(),
      roundNumber: this.roundNumber(),
    }),
  );

  readonly score = signal(0);

  readonly sessionPoints = computed(
    () =>
      this.score() *
      ((
        this.specialSpaceEventTemplate()?.details as
          | PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails
          | undefined
      )?.sessionPointsPerGamePoint ?? 0),
  );

  readonly selectingEvent = signal(false);
  readonly startingEvent = signal(false);
  readonly submittingScore = signal(false);

  readonly backendActionInProgress = computed(
    () =>
      this.selectingEvent() || this.startingEvent() || this.submittingScore(),
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

  protected readonly SpaceEventStatus = SpaceEventStatus;
}
