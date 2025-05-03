import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { EventModel, EventTeamModel } from '../../shared/util/supabase-types';
import {
  EventParticipantWithPlayerInfo,
  EventService,
  EventTeamUpdateModel,
  EventTeamWithParticipantInfo,
} from '../../shared/data-access/event.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PlayerService } from '../../shared/data-access/player.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';

enum DropListIds {
  UnassignedTeam = 'unassigned-team',
  NewTeam = 'new-team',
}

enum TeamIds {
  UnassignedTeam = -1,
  NewTeam = -2,
}

@Component({
  selector: 'joshies-edit-event-teams-page',
  template: `
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <div class="w-full flex justify-between items-center">
        <joshies-header-link
          text="Events"
          routerLink="../.."
          chevronDirection="left"
        />

        <!-- Save Changes Button-->
        @if (unsavedChangesExist()) {
          <p-button
            [text]="true"
            (onClick)="
              saveChanges(
                this.localSortedEventTeams(),
                this.databaseEventTeams(),
                this.localEventParticipants(),
                this.databaseEventParticipants(),
                this.eventId()
              )
            "
          >
            <i class="pi pi-save text-xl text-primary"></i>
          </p-button>
        }
      </div>
    </joshies-page-header>

    @if (!submitting() && eventTeamsWithParticipantInfo(); as teams) {
      <!-- Unassigned players -->
      <p class="mt-4 mb-1">Unassigned Players</p>
      <div
        class="flex flex-wrap border border-neutral-200 rounded-md bg-neutral-50 relative"
        style="min-height: 3.2rem;"
        [id]="DropListIds.UnassignedTeam"
        cdkDropList
        [cdkDropListConnectedTo]="dropListIds()"
        [cdkDropListData]="teams[0]"
        (cdkDropListDropped)="onEventParticipantDrop($event)"
      >
        @for (
          participant of teams[0].participants;
          track participant.participant_id;
          let first = $first
        ) {
          <div
            class="flex rounded-md p-2 m-1 bg-neutral-200"
            cdkDrag
            [cdkDragData]="participant"
            [cdkDragDisabled]="!userIsGameMaster()"
          >
            <img
              [ngSrc]="participant.avatar_url"
              alt=""
              width="24"
              height="24"
              class="size-6 self-center rounded-full bg-neutral-100 mr-1"
            />
            <span class="self-center">
              {{ participant.display_name }}
            </span>
            <div
              class="absolute top-0 left-0 w-full h-full rounded-md bg-neutral-300"
              *cdkDragPlaceholder
            ></div>
          </div>
        } @empty {
          <p class="self-center text-neutral-400 ml-2">
            Drag players here to remove them from a team
          </p>
        }
      </div>

      <!-- Event Teams -->
      <p class="mt-4">Teams</p>

      <!-- Drop List for Reordering Teams -->
      <div cdkDropList (cdkDropListDropped)="onEventTeamDrop($event)">
        @for (
          team of teams;
          track team.id;
          let index = $index, first = $first, last = $last
        ) {
          @if (!(first || last)) {
            <div class="flex draggable-event-team" cdkDrag>
              @if (userIsGameMaster()) {
                <div class="flex" cdkDragHandle>
                  <i
                    class="pi pi-bars text-neutral-300 pl-2 pr-4 self-center"
                  ></i>
                </div>
              }

              <!-- Drop List for Adding/Removing Players from Teams -->
              <div
                class="flex grow border border-neutral-200 rounded-md my-2 bg-neutral-50 relative"
                style="min-height: 3.2rem;"
                [id]="team.id!.toString()"
                cdkDropList
                [cdkDropListConnectedTo]="dropListIds()"
                [cdkDropListData]="team"
                (cdkDropListDropped)="onEventParticipantDrop($event)"
              >
                <p class="self-center text-sm text-neutral-400 px-2">
                  {{ index }}
                </p>
                <div class="flex flex-wrap">
                  @for (
                    participant of team.participants;
                    track participant.participant_id;
                    let first = $first
                  ) {
                    <div
                      class="flex rounded-md p-2 m-1 bg-neutral-200"
                      cdkDrag
                      [cdkDragData]="participant"
                    >
                      <img
                        [ngSrc]="participant.avatar_url"
                        alt=""
                        width="24"
                        height="24"
                        class="size-6 rounded-full bg-neutral-100 mr-1"
                      />
                      <span class="self-center">
                        {{ participant.display_name }}
                      </span>
                      <div
                        class="absolute top-0 left-0 w-full h-full rounded-md bg-neutral-300"
                        *cdkDragPlaceholder
                      ></div>
                    </div>
                  } @empty {
                    <p class="italic text-neutral-400">
                      Oops, I shouldn't be here...
                    </p>
                  }
                </div>
              </div>
              <div
                class="bg-neutral-200 h-12 w-full draggable-event-team"
                *cdkDragPlaceholder
              ></div>
            </div>
          }
        }
        <div
          class="flex border border-neutral-200 rounded-md bg-neutral-50 mt-2 relative"
          style="min-height: 3.2rem;"
          [id]="DropListIds.NewTeam"
          cdkDropList
          [cdkDropListConnectedTo]="dropListIds()"
          [cdkDropListData]="teams[teams.length - 1]"
          (cdkDropListDropped)="onEventParticipantDrop($event)"
        >
          <p class="self-center text-neutral-400 ml-2">
            Drag players here to create a new team
          </p>
        </div>
      </div>
    } @else if (databaseEventTeams === null) {
      <p class="mt-12 pt-12 text-center text-neutral-500 italic">
        No active session
      </p>
    } @else {
      <p-skeleton height="5rem" styleClass="mt-8 mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" />
    }
  `,
  styles: `
    .cdk-drag:not(.cdk-drag-preview, .draggable-event-team) {
      transform: none !important;
    }

    .cdk-drag-placeholder:not(.draggable-event-team) {
      transform: none !important;
      opacity: 0.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    AvatarModule,
    AvatarGroupModule,
    NgOptimizedImage,
    ButtonModule,
  ],
})
export default class EditEventTeamsPageComponent {
  private readonly eventService = inject(EventService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly players = this.playerService.players;
  readonly userIsGameMaster = this.playerService.userIsGameMaster;

  readonly eventId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalEvent: Signal<EventModel | null> = input.required(); // route resolve data

  // make the DropListIds enum available in component template
  readonly DropListIds = DropListIds;

  readonly headerText = computed(
    () => `Edit ${this.originalEvent()?.name ?? ''} Teams`,
  );

  readonly submitting = signal(false);

  private readonly newTeamTemplate = computed(() => ({
    created_at: '',
    event_id: this.eventId(),
    name: '',
    updated_at: '',
  }));

  readonly databaseEventTeams: Signal<EventTeamModel[] | undefined> = computed(
    () =>
      this.eventService
        .eventTeams()
        ?.filter((eventTeam) => eventTeam.event_id === this.eventId())
        ?.sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0)),
  );

  readonly localSortedEventTeams: WritableSignal<EventTeamModel[] | undefined> =
    signal(structuredClone(this.databaseEventTeams()));

  readonly databaseEventParticipants: Signal<
    EventParticipantWithPlayerInfo[] | undefined
  > = computed(() =>
    this.eventService
      .eventParticipantsWithPlayerInfo()
      ?.filter((eventParticipant) =>
        this.databaseEventTeams()
          ?.map((eventTeam) => eventTeam.id)
          .includes(eventParticipant.team_id),
      ),
  );

  readonly localEventParticipants: WritableSignal<
    EventParticipantWithPlayerInfo[] | undefined
  > = signal([
    ...(this.players()
      ?.filter(
        (player) =>
          !this.databaseEventParticipants()
            ?.map((eventParticipant) => eventParticipant.player_id)
            .includes(player.player_id),
      )
      .map(
        (player) =>
          ({
            participant_id: -player.player_id,
            team_id: TeamIds.UnassignedTeam,
            player_id: player.player_id,
            display_name: player.display_name,
            avatar_url: player.avatar_url,
          }) as EventParticipantWithPlayerInfo,
      ) ?? ([] as EventParticipantWithPlayerInfo[])),
    ...(structuredClone(this.databaseEventParticipants()) ??
      ([] as EventParticipantWithPlayerInfo[])),
  ]);

  readonly eventTeamsWithParticipantInfo = computed(() => [
    // include a "team" for unassigned players so the container type matches for drag/drop
    {
      ...this.newTeamTemplate(),
      id: TeamIds.UnassignedTeam,
      participants: this.localEventParticipants()?.filter(
        (eventParticipant) =>
          eventParticipant.team_id === TeamIds.UnassignedTeam,
      ),
    } as EventTeamWithParticipantInfo,

    ...(this.localSortedEventTeams()?.map((eventTeam) => ({
      ...eventTeam,
      participants: this.localEventParticipants()?.filter(
        (eventParticipant) => eventParticipant.team_id === eventTeam.id,
      ),
    })) ?? []),

    // include a "new team" so the container type matches for drag/drop
    {
      ...this.newTeamTemplate(),
      id: TeamIds.NewTeam,
    } as EventTeamWithParticipantInfo,
  ]);

  readonly dropListIds = computed(() => [
    ...Object.values(this.DropListIds),
    ...(this.eventTeamsWithParticipantInfo()
      ?.filter((eventTeam) => eventTeam.id > 0)
      .map((eventTeam) => eventTeam.id.toString()) ?? []),
  ]);

  private readonly updateLocalEventTeamsArrayOnDatabaseUpdates = effect(() =>
    this.localSortedEventTeams.set(structuredClone(this.databaseEventTeams())),
  );

  private readonly updateLocalEventParticipantsArrayOnDatabaseUpdates = effect(
    () =>
      this.localEventParticipants.set([
        ...(this.players()
          ?.filter(
            (player) =>
              !structuredClone(this.databaseEventParticipants())
                ?.map((eventParticipant) => eventParticipant.player_id)
                .includes(player.player_id),
          )
          .map(
            (player) =>
              ({
                participant_id: -player.player_id,
                team_id: TeamIds.UnassignedTeam,
                player_id: player.player_id,
                display_name: player.display_name,
                avatar_url: player.avatar_url,
              }) as EventParticipantWithPlayerInfo,
          ) ?? ([] as EventParticipantWithPlayerInfo[])),
        ...(structuredClone(this.databaseEventParticipants()) ??
          ([] as EventParticipantWithPlayerInfo[])),
      ]),
  );

  readonly unsavedChangesExist = computed(() => {
    const eventParticipantsWithoutUnassigned =
      this.localEventParticipants()?.filter(
        (localEventParticipant) =>
          localEventParticipant.team_id !== TeamIds.UnassignedTeam,
      );

    if (
      eventParticipantsWithoutUnassigned?.length !==
        this.databaseEventParticipants()?.length ||
      eventParticipantsWithoutUnassigned?.some(
        (localEventParticipant) =>
          localEventParticipant.team_id !==
          this.databaseEventParticipants()?.find(
            (dbEventParticipant) =>
              dbEventParticipant.participant_id ===
              localEventParticipant?.participant_id,
          )?.team_id,
      )
    ) {
      return true;
    }

    if (
      this.localSortedEventTeams()?.length !==
        this.databaseEventTeams()?.length ||
      this.localSortedEventTeams()?.some(
        (localEventTeam, index) => localEventTeam.seed !== index + 1,
      )
    ) {
      return true;
    }

    return false;
  });

  private readonly nextAvailableTeamId = computed(() =>
    this.localSortedEventTeams()?.length
      ? Math.max(
          ...this.localSortedEventTeams()!.map((eventTeam) => eventTeam.id),
        ) + 1
      : 1,
  );

  onEventTeamDrop(
    drop: CdkDragDrop<EventTeamWithParticipantInfo[] | undefined>,
  ): void {
    this.localSortedEventTeams.update((eventTeams) => {
      moveItemInArray(eventTeams!, drop.previousIndex, drop.currentIndex);
      return [...eventTeams!];
    });
  }

  onEventParticipantDrop(
    drop: CdkDragDrop<EventTeamWithParticipantInfo>,
  ): void {
    if (drop.previousContainer.data.id === drop.container.data.id) {
      return;
    }

    let newTeamId = drop.container.data.id;

    this.localSortedEventTeams.update((eventTeams) => {
      if (newTeamId === TeamIds.NewTeam) {
        newTeamId = this.nextAvailableTeamId();
        eventTeams!.push({
          ...this.newTeamTemplate(),
          seed: 0,
          id: newTeamId,
        });
      }

      const previousTeamParticipantCount =
        this.localEventParticipants()?.filter(
          (eventParticipant) =>
            eventParticipant.team_id === drop.previousContainer.data.id,
        ).length;

      if (
        previousTeamParticipantCount! <= 1 &&
        drop.previousContainer.data.id !== TeamIds.UnassignedTeam
      ) {
        const previousTeamIndex = eventTeams?.findIndex(
          (eventTeam) => eventTeam.id === drop.previousContainer.data.id,
        );
        eventTeams?.splice(previousTeamIndex!, 1);
      }

      return [...eventTeams!];
    });

    this.localEventParticipants.update((eventParticipants) => {
      const droppedEventParticipant = eventParticipants!.find(
        (eventParticipant) =>
          eventParticipant.participant_id === drop.item.data.participant_id,
      );

      droppedEventParticipant!.team_id = newTeamId;

      return [...eventParticipants!];
    });
  }

  saveChanges(
    localSortedEventTeams: EventTeamModel[] | undefined,
    databaseEventTeams: EventTeamModel[] | undefined,
    localEventParticipants: EventParticipantWithPlayerInfo[] | undefined,
    databaseEventParticipants: EventParticipantWithPlayerInfo[] | undefined,
    eventId: number,
  ) {
    const newEventTeams = localSortedEventTeams?.filter(
      (localEventTeam) =>
        !databaseEventTeams?.some(
          (dbEventTeam) => dbEventTeam.id === localEventTeam.id,
        ),
    );

    const newEventParticipants = localEventParticipants?.filter(
      (localParticipant) =>
        !databaseEventParticipants?.some(
          (dbParticipant) =>
            dbParticipant.participant_id === localParticipant.participant_id,
        ) && localParticipant.team_id !== TeamIds.UnassignedTeam,
    );

    const eventTeamUpdates: EventTeamUpdateModel = {
      newEventTeams: newEventTeams?.map((newEventTeam) => ({
        id: newEventTeam.id,
        event_id: eventId,
        seed:
          localSortedEventTeams!.findIndex(
            (localEventTeam) => localEventTeam.id === newEventTeam.id,
          ) + 1,
      })),

      updatedTeams: localSortedEventTeams
        ?.map((eventTeam, index) => ({
          id: eventTeam.id,
          seed: index + 1,
        }))
        .filter(
          (localEventTeam) =>
            localEventTeam.seed !==
              databaseEventTeams?.find(
                (dbEventTeam) => dbEventTeam.id === localEventTeam.id,
              )?.seed &&
            !newEventTeams?.some(
              (newEventTeam) => newEventTeam.id === localEventTeam.id,
            ),
        ),

      removedTeams: databaseEventTeams
        ?.filter(
          (dbEventTeam) =>
            !localSortedEventTeams?.some(
              (localEventTeam) => localEventTeam.id === dbEventTeam.id,
            ),
        )
        .map((eventTeam) => ({ id: eventTeam.id })),

      newParticipants: newEventParticipants?.map((eventParticipant) => ({
        team_id: eventParticipant.team_id,
        player_id: eventParticipant.player_id,
      })),

      updatedParticipants: localEventParticipants
        ?.filter(
          (localEventParticipant) =>
            localEventParticipant.team_id !==
              databaseEventParticipants?.find(
                (dbEventParticipant) =>
                  dbEventParticipant.participant_id ===
                  localEventParticipant.participant_id,
              )?.team_id &&
            !newEventParticipants?.some(
              (newEventParticipant) =>
                newEventParticipant.participant_id ===
                localEventParticipant.participant_id,
            ) &&
            localEventParticipant.team_id !== TeamIds.UnassignedTeam,
        )
        .map((eventParticipant) => ({
          id: eventParticipant.participant_id,
          team_id: eventParticipant.team_id,
        })),

      removedParticipants: databaseEventParticipants
        ?.filter(
          (dbEventParticipant) =>
            !localEventParticipants
              ?.filter(
                (localEventParticipant) =>
                  localEventParticipant.team_id !== TeamIds.UnassignedTeam,
              )
              .some(
                (localEventParticipant) =>
                  localEventParticipant.participant_id ===
                  dbEventParticipant.participant_id,
              ),
        )
        .map((eventParticipant) => ({ id: eventParticipant.participant_id })),
    };

    confirmBackendAction({
      confirmationMessageText: `Save changes to ${this.originalEvent()?.name ?? 'event'} teams?`,
      successMessageText: `${this.originalEvent()?.name ?? 'Event'} teams updated successfully`,
      action: async () =>
        this.eventService.updateEventTeams(
          JSON.parse(JSON.stringify(eventTeamUpdates)),
        ),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.submitting,
      successNavigation: null,
    });
  }
}
