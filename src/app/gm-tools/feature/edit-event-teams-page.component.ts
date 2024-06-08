import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import {
  EventModel,
  EventParticipantModel,
} from '../../shared/util/supabase-types';
import {
  EventService,
  EventTeamWithPlayerUserInfo,
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

@Component({
  selector: 'joshies-edit-event-teams-page',
  standalone: true,
  template: `
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <div class="w-full flex justify-content-between align-items-center">
        <joshies-header-link
          text="Events"
          routerLink="../.."
          chevronDirection="left"
        />

        <!-- Save Changes Button-->
        @if (unsavedChangesExist()) {
          <p-button [text]="true" (onClick)="saveChanges()">
            <i class="pi pi-save text-xl text-primary"></i>
          </p-button>
        }
      </div>
    </joshies-page-header>

    @if (localSortedEventTeams(); as teams) {
      <!-- Unassigned players -->
      <p class="mb-1">Unassigned Players</p>
      <div
        class="flex flex-wrap border-1 border-200 border-round-md surface-50 relative"
        cdkDropList
        [cdkDropListData]="unassignedPlayerTeam()"
        (cdkDropListDropped)="onEventParticipantDrop($event)"
        [cdkDropListConnectedTo]="dropListIds()"
        id="unassigned-player-list"
      >
        @for (
          player of unassignedPlayerTeam().players;
          track player.player_id;
          let first = $first
        ) {
          <div
            class="flex border-round-md p-2 m-1 text-color no-underline surface-200"
            cdkDrag
            [cdkDragDisabled]="!userIsGameMaster()"
            [cdkDragData]="player"
          >
            <img
              [ngSrc]="player.avatar_url"
              alt=""
              width="24"
              height="24"
              class="border-circle surface-100 mr-1"
            />
            <span class="align-self-center">
              {{ player.display_name }}
            </span>
          </div>
        } @empty {
          <p class="text-center text-400 ml-2">
            Drag players here to remove them from a team
          </p>
        }
      </div>

      <!-- Event Teams -->
      <p class="mb-0">Teams</p>

      <!-- Drop List for Reordering Teams -->
      <div cdkDropList (cdkDropListDropped)="onEventTeamDrop($event)">
        @for (
          team of localSortedEventTeams();
          track team.id;
          let index = $index
        ) {
          <div class="flex" cdkDrag>
            @if (userIsGameMaster()) {
              <div class="flex" cdkDragHandle>
                <i class="pi pi-bars text-300 pl-2 pr-3 align-self-center"></i>
              </div>
            }

            <!-- Drop List for Adding/Removing Players from Teams -->
            <div
              class="flex flex-wrap flex-grow-1 border-1 border-200 border-round-md my-2 surface-50 relative"
              cdkDropList
              [cdkDropListData]="team"
              [cdkDropListConnectedTo]="dropListIds()"
              (cdkDropListDropped)="onEventParticipantDrop($event)"
              [id]="team.id!.toString()"
            >
              <p class="text-sm text-400 px-2 mb-0">{{ index + 1 }}</p>
              <p class="text-sm text-400 px-2 mb-0">{{ team.id! }}</p>
              @for (
                player of team.players;
                track player.player_id;
                let first = $first
              ) {
                <div
                  class="flex border-round-md p-2 m-1 text-color no-underline surface-200"
                  cdkDrag
                  [cdkDragData]="player"
                >
                  <img
                    [ngSrc]="player.avatar_url"
                    alt=""
                    width="24"
                    height="24"
                    class="border-circle surface-100 mr-1"
                  />
                  <span class="align-self-center">
                    {{ player.display_name }}
                  </span>
                </div>
              } @empty {
                <p class="text-center font-italic text-400">
                  No participants assigned to this team
                </p>
              }
            </div>

            <div class="surface-200 h-3rem w-full" *cdkDragPlaceholder></div>
          </div>
        }
        <div
          class="flex w-full border-1 border-200 border-round-md my-2 surface-50"
          cdkDropList
          [cdkDropListData]="newPlayerTeam"
          (cdkDropListDropped)="onEventParticipantDrop($event)"
          [cdkDropListConnectedTo]="dropListIds()"
          id="new-player-team"
        >
          <p class="text-center text-400 ml-2">
            Drag players here to create a new team
          </p>
        </div>
      </div>
    } @else if (databaseEventTeams === null) {
      <p class="mt-6 pt-6 text-center text-500 font-italic">
        No active session
      </p>
    } @else {
      <p-skeleton height="5rem" styleClass="mt-5 mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" styleClass="mb-2" />
      <p-skeleton height="5rem" />
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

  readonly userIsGameMaster = this.playerService.userIsGameMaster;

  readonly headerText = computed(
    () => `Edit ${this.originalEvent()?.name ?? ''} Teams`,
  );

  readonly eventId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalEvent: Signal<EventModel | null> = input.required(); // route resolve data

  private readonly players = this.playerService.players;

  readonly databaseEventTeams = computed(
    () =>
      this.eventService
        .eventTeamsWithPlayerUserInfo()
        ?.filter((eventTeam) => eventTeam.event_id === this.eventId())
        ?.sort(
          (a, b) => (a.seed ?? 0) - (b.seed ?? 0),
        ) as Partial<EventTeamWithPlayerUserInfo>[],
  );

  readonly localSortedEventTeams = signal(
    structuredClone(this.databaseEventTeams()),
  );

  readonly unassignedPlayerTeam = computed(
    () =>
      ({
        id: -1,
        players: this.players()?.filter(
          (player) =>
            !this.localSortedEventTeams()?.some((team) =>
              team.players?.some(
                (teamPlayer) => teamPlayer.player_id === player.player_id,
              ),
            ),
        ),
      }) as Partial<EventTeamWithPlayerUserInfo>,
  );

  readonly newPlayerTeam = { id: -2 } as Partial<EventTeamWithPlayerUserInfo>;

  readonly dropListIds = computed(() => [
    'unassigned-player-list',
    'new-player-team',
    ...(this.localSortedEventTeams()?.map((eventTeam) =>
      eventTeam.id!.toString(),
    ) ?? []),
  ]);

  private readonly updateLocalEventsArrayOnDatabaseUpdates = effect(
    () =>
      this.localSortedEventTeams.set(
        structuredClone(this.databaseEventTeams()),
      ),
    { allowSignalWrites: true },
  );

  readonly unsavedChangesExist = computed(() => {
    // teams are reordered
    if (
      this.localSortedEventTeams()?.some(
        (eventTeam, index) => eventTeam.seed !== index + 1,
      )
    ) {
      return true;
    }

    // team has been removed or player has changed teams
    if (
      this.databaseEventTeams()?.some((dbEventTeam) => {
        const localEventTeamPlayers = this.localSortedEventTeams()?.find(
          (localEventTeam) => localEventTeam.id === dbEventTeam.id,
        )?.players;

        return (
          localEventTeamPlayers?.length !== dbEventTeam.players?.length ||
          !dbEventTeam.players?.every((dbPlayer) =>
            localEventTeamPlayers?.some(
              (localPlayer) => dbPlayer.player_id === localPlayer.player_id,
            ),
          )
        );
      })
    ) {
      return true;
    }

    return false;
  });

  private readonly nextAvailableTeamId = computed(() =>
    this.localSortedEventTeams()?.length
      ? Math.max(
          ...this.localSortedEventTeams().map((eventTeam) => eventTeam.id!),
        ) + 1
      : 1,
  );

  onEventTeamDrop(
    drop: CdkDragDrop<EventTeamWithPlayerUserInfo[] | undefined>,
  ): void {
    this.localSortedEventTeams.update((eventTeams) => {
      moveItemInArray(eventTeams, drop.previousIndex, drop.currentIndex);
      return [...eventTeams];
    });
  }

  onEventParticipantDrop(
    drop: CdkDragDrop<Partial<EventTeamWithPlayerUserInfo>>,
  ): void {
    if (drop.previousContainer.data.id === drop.container.data.id) {
      return;
    }

    this.localSortedEventTeams.update((eventTeams) => {
      const previousTeam = eventTeams.find(
        (eventTeam) => eventTeam.id === drop.previousContainer.data.id,
      );

      previousTeam?.players?.splice(drop.previousIndex, 1);

      if (drop.container.data.id === -2) {
        eventTeams.push({
          id: this.nextAvailableTeamId(),
          created_at: '',
          updated_at: '',
          event_id: this.eventId(),
          seed: this.localSortedEventTeams.length,
          name: null,
          players: [drop.item.data],
        } as EventTeamWithPlayerUserInfo);
      } else {
        eventTeams
          .find((eventTeam) => eventTeam.id === drop.container.data.id)
          ?.players?.push(drop.item.data);
      }

      if (previousTeam?.players?.length === 0) {
        const eventTeamIndex = eventTeams.findIndex(
          (eventTeam) => eventTeam.id === previousTeam.id,
        );
        eventTeams.splice(eventTeamIndex, 1);
      }

      return [...eventTeams];
    });
  }

  saveChanges() {
    const newTeamIdsWithSeeds = this.localSortedEventTeams()
      .map((localEventTeam, index) => ({
        id: localEventTeam.id,
        seed: index + 1,
      }))
      .filter(
        (localEventTeam) =>
          !this.databaseEventTeams()
            .map((dbEventTeam) => dbEventTeam.id)
            .includes(localEventTeam.id),
      );

    const databaseParticipants = this.databaseEventTeams().reduce(
      (prev, eventTeam) => [
        ...prev,
        ...eventTeam.players!.map((player) => ({
          player_id: player.player_id,
          team_id: eventTeam.id!,
        })),
      ],
      [] as Partial<EventParticipantModel>[],
    );

    const localParticipants = this.localSortedEventTeams().reduce(
      (prev, eventTeam) => [
        ...prev,
        ...eventTeam.players!.map((player) => ({
          player_id: player.player_id,
          team_id: eventTeam.id!,
        })),
      ],
      [] as Partial<EventParticipantModel>[],
    );

    const newParticipants = localParticipants.filter(
      (localParticipant) =>
        !databaseParticipants
          .map((dbParticipant) => dbParticipant.player_id)
          .includes(localParticipant.player_id),
    );

    const eventTeamUpdates = {
      newTeamIdsWithSeeds: newTeamIdsWithSeeds,

      updatedTeamIdsWithSeeds: this.localSortedEventTeams().reduce(
        (prev, eventTeam, index) => [
          ...prev,
          ...(eventTeam.seed !== index + 1 &&
          !newTeamIdsWithSeeds.some(
            (newEventTeam) => newEventTeam.id === eventTeam.id,
          )
            ? [{ id: eventTeam.id!, seed: index + 1 }]
            : []),
        ],
        [] as { id: number; seed: number }[],
      ),

      removedTeamIds: this.databaseEventTeams()
        .map((dbEventTeam) => dbEventTeam.id)
        .filter(
          (dbEventTeamId) =>
            !this.localSortedEventTeams()
              .map((localEventTeam) => localEventTeam.id)
              .includes(dbEventTeamId),
        ),

      newParticipants: newParticipants,

      updatedParticipants: localParticipants.filter(
        (localParticipant) =>
          databaseParticipants.find(
            (dbParticipant) =>
              dbParticipant.player_id === localParticipant.player_id,
          )?.team_id !== localParticipant.team_id &&
          !newParticipants
            .map((participant) => participant.player_id)
            .includes(localParticipant.player_id),
      ),

      removedPlayerIds: databaseParticipants
        .filter(
          (dbParticipant) =>
            !localParticipants
              .map((localParticipant) => localParticipant.player_id)
              .includes(dbParticipant.player_id),
        )
        .map((dbParticipant) => dbParticipant.player_id),
    };

    console.log('\n' + JSON.stringify(eventTeamUpdates));

    // console.log(
    //   `new teams: ${eventTeamUpdates.newTeamIdsWithSeeds.map((team) => JSON.stringify(team))}`,
    // );
    // console.log(
    //   `removed teams: ${eventTeamUpdates.removedTeamIds.map((team) => JSON.stringify(team))}`,
    // );
    // console.log(
    //   `updated teams: ${eventTeamUpdates.updatedTeamIdsWithSeeds.map((team) => JSON.stringify(team))}`,
    // );

    // console.log(
    //   `added players: ${eventTeamUpdates.newParticipants.map((playerWithSeed) => JSON.stringify(playerWithSeed))}`,
    // );

    // console.log(
    //   `updated players: ${eventTeamUpdates.updatedParticipants.map((playerWithSeed) => JSON.stringify(playerWithSeed))}`,
    // );

    // console.log(
    //   `removed players: ${eventTeamUpdates.removedPlayerIds.map((playerId) => JSON.stringify(playerId))}`,
    // );
  }
}
