import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import {
  EventParticipantWithPlayerInfo,
  EventService,
  EventTeamWithParticipantInfo,
} from '../../shared/data-access/event.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  confirmBackendAction,
  LocalErrorResponse,
} from '../../shared/util/dialog-helpers';
import { teamsWithParticipantInfo } from '../../shared/util/event-helpers';
import { EventModel, EventTeamModel } from '../../shared/util/supabase-types';

const dropListIdPrefix = 'drop-list-';
const unassignedPlayerDropListId = `${dropListIdPrefix}unassigned`;

@Component({
  selector: 'joshies-edit-event-teams-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    NgOptimizedImage,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropListGroup,
    Dialog,
    InputNumber,
    FormsModule,
    Message,
  ],
  template: `
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <div class="flex w-full items-center justify-between">
        <joshies-header-link
          text="Events"
          routerLink="/gm-tools/events"
          chevronDirection="left"
        />

        <button
          pButton
          text
          icon="ci ci-dice text-2xl !p-0"
          (click)="randomizerDialogVisible.set(true)"
        ></button>
      </div>
    </joshies-page-header>

    <div class="mt-5 flex flex-col gap-5">
      <!-- Unassigned players -->
      <div class="flex flex-col gap-2">
        <h2>Unassigned Players</h2>

        <div
          cdkDropList
          [cdkDropListConnectedTo]="dropListIds()"
          [id]="unassignedPlayerDropListId"
          [cdkDropListData]="undefined"
          class="relative flex min-h-[3.2rem] flex-wrap rounded-md border border-neutral-200 bg-neutral-50"
          (cdkDropListDropped)="onParticipantDrop($event)"
        >
          @if (unassignedPlayers().length) {
            @for (player of unassignedPlayers(); track player.player_id) {
              <div
                cdkDrag
                [cdkDragData]="player"
                [cdkDragDisabled]="pendingRequests() > 0"
                class="transform-none-unless-preview m-1 flex items-center rounded-md bg-neutral-200 p-2"
              >
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="24"
                  height="24"
                  class="mr-1 size-6 rounded-full bg-neutral-100"
                />
                <span>{{ player.display_name }}</span>
                <div
                  class="absolute top-0 left-0 h-full w-full !transform-none rounded-md bg-neutral-300 opacity-50"
                  *cdkDragPlaceholder
                ></div>
              </div>
            }
          } @else {
            <p class="self-center px-2 text-sm text-neutral-400 italic">
              Drop players here to remove from a team
            </p>
          }
        </div>
      </div>

      <!-- Event Teams -->
      <div
        cdkDropList
        class="flex flex-col gap-2"
        (cdkDropListDropped)="onTeamDrop($event)"
      >
        <div class="flex items-end justify-between">
          <h2>Teams</h2>
          @if (userIsGameMaster()) {
            <button
              pButton
              outlined
              icon="pi pi-plus"
              [disabled]="pendingRequests() > 0"
              (click)="onAddTeamButtonClick()"
            >
              Add Team
            </button>
          }
        </div>

        @for (team of teamsWithParticipantInfo(); track team.id) {
          <div
            cdkDrag
            cdkDropListGroup
            [cdkDragDisabled]="!userIsGameMaster() || pendingRequests() > 0"
            class="flex gap-2"
          >
            <!-- Team drag handle -->
            @if (userIsGameMaster()) {
              <i
                cdkDragHandle
                class="pi pi-bars flex-none self-center p-2 text-neutral-400"
              ></i>
            }

            <!-- Team drop list -->
            <div
              cdkDropList
              [cdkDropListConnectedTo]="dropListIds()"
              [cdkDropListData]="team"
              [id]="dropListIdByTeamId()[team.id]"
              class="relative flex min-h-[3.2rem] grow rounded-md border border-neutral-200 bg-neutral-50"
              (cdkDropListDropped)="onParticipantDrop($event)"
            >
              <p class="self-center px-2 text-sm text-neutral-400">
                {{ team.seed ?? '[?]' }}
              </p>
              <div class="flex flex-wrap gap-1 p-1">
                @for (
                  participant of team.participants;
                  track participant.participant_id
                ) {
                  <div
                    cdkDrag
                    [cdkDragData]="participant"
                    [cdkDragDisabled]="
                      !userIsGameMaster() || pendingRequests() > 0
                    "
                    class="transform-none-unless-preview flex items-center gap-2 rounded-md bg-neutral-200 p-2"
                  >
                    <img
                      [ngSrc]="participant.avatar_url"
                      alt=""
                      width="24"
                      height="24"
                      class="size-6 rounded-full"
                    />
                    <span>{{ participant.display_name }}</span>
                    @if (userIsGameMaster()) {
                      <button
                        pButton
                        class="size-6 w-auto p-0 text-neutral-500"
                        text
                        icon="pi pi-times-circle"
                        (click)="onDeleteParticipantButtonClick(participant)"
                      ></button>
                    }
                    <div
                      class="absolute top-0 left-0 h-full w-full !transform-none rounded-md bg-neutral-300 opacity-50"
                      *cdkDragPlaceholder
                    ></div>
                  </div>
                } @empty {
                  <p class="self-center px-2 text-sm text-neutral-400 italic">
                    Drop players here to add to this team
                  </p>
                }
              </div>
            </div>

            <!-- Delete team button -->
            @if (userIsGameMaster()) {
              <button
                pButton
                class="flex-none"
                icon="pi pi-trash"
                text
                [disabled]="pendingRequests() > 0"
                (click)="onDeleteTeamButtonClick(team.id)"
              ></button>
            }

            <div *cdkDragPlaceholder class="h-[3.2rem] bg-neutral-50"></div>
          </div>
        } @empty {
          <p class="px-4 py-4 text-center text-neutral-400 italic">
            Click
            <button
              pButton
              outlined
              severity="secondary"
              class="mx-1 mb-1 border-neutral-400 p-[0.4rem]"
              icon="pi pi-plus"
              [disabled]="pendingRequests() > 0"
              (click)="onAddTeamButtonClick()"
            >
              Add Team
            </button>
            to add your first team.
          </p>
        }
      </div>
    </div>

    <p-dialog
      styleClass="max-w-[20rem]"
      header="Randomize Teams"
      [closable]="pendingRequests() <= 0"
      [(visible)]="randomizerDialogVisible"
      [dismissableMask]="pendingRequests() <= 0"
      [modal]="true"
    >
      <div class="flex flex-col gap-5">
        <div class="min-h-[4rem]">
          @let warning = this.unevenParticipantCountWarning();
          <p-message
            class="mt-[0.25rem]"
            [severity]="warning ? 'warn' : 'secondary'"
            [icon]="warning ? 'pi pi-exclamation-triangle' : 'pi pi-face-smile'"
            [class.text-neutral-400]="!warning"
          >
            {{ warning || 'Teams will be even.' }}
          </p-message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="random-team-count-input">Number of teams</label>
          <p-inputNumber
            class="w-full"
            inputStyleClass="w-full"
            inputId="random-team-count-input"
            [(ngModel)]="randomTeamCount"
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            [min]="1"
            [max]="playerCount()"
            [disabled]="pendingRequests() > 0"
          ></p-inputNumber>
        </div>

        <button
          pButton
          icon="ci ci-dice"
          label="Create teams"
          [loading]="pendingRequests() > 0"
          (click)="onRandomizeTeamsButtonClick()"
        ></button>
      </div>
    </p-dialog>
  `,
  styles: `
    /* Avoid layout shift issues in default drag/drop */
    .transform-none-unless-preview:not(.cdk-drag-preview) {
      transform: none !important;
    }

    /* Elevate the drag preview with a shadow so it floats above the list */
    :host ::ng-deep .cdk-drag-preview {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 6px;
    }

    :host ::ng-deep .p-dialog-title {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditEventTeamsPageComponent {
  // *** Injected Dependencies ***
  private readonly playerService = inject(PlayerService);
  private readonly eventService = inject(EventService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // *** State ***
  readonly userIsGameMaster = this.playerService.userIsGameMaster;
  readonly players = this.playerService.players;

  // *** Inputs ***
  readonly event = input.required<EventModel>(); // from route resolver

  // *** Computed Signals ***
  readonly headerText = computed(() => `Edit ${this.event().name} Teams`);
  readonly teamsWithParticipantInfo = computed(() =>
    teamsWithParticipantInfo(this.teams(), this.participants()),
  );
  readonly assignedPlayerIdSet = computed(
    () =>
      new Set(this.participants().map((participant) => participant.player_id)),
  );
  readonly unassignedPlayers = computed(
    () =>
      this.players()?.filter(
        (player) => !this.assignedPlayerIdSet().has(player.player_id),
      ) ?? [],
  );
  readonly dropListIdByTeamId = computed(() =>
    this.teams().reduce(
      (prev, team) => ({ ...prev, [team.id]: `${dropListIdPrefix}${team.id}` }),
      {} as Record<EventTeamModel['id'], string>,
    ),
  );
  readonly dropListIds = computed(() => [
    unassignedPlayerDropListId,
    ...Object.values(this.dropListIdByTeamId()),
  ]);
  readonly playerCount = computed(() => this.players()?.length ?? 1);
  readonly unevenParticipantCountWarning = computed(() => {
    const playerCount = this.playerCount();
    const teamCount = this.randomTeamCount();

    const playerSurplus = playerCount % teamCount;

    if (playerSurplus === 0) {
      return null;
    }

    const playerDefecit = teamCount - playerSurplus;

    if (playerSurplus <= playerDefecit) {
      const teamOrTeams = playerSurplus > 1 ? 'teams' : 'team';
      return `${playerSurplus} ${teamOrTeams} will have an extra player.`;
    }

    const teamOrTeams = playerDefecit > 1 ? 'teams' : 'team';
    return `${playerDefecit} ${teamOrTeams} will be down a player.`;
  });

  // *** Writable Signals ***
  readonly teams = linkedSignal(() => {
    const unsortedTeams =
      this.eventService
        .eventTeams()
        ?.filter((team) => team.event_id === this.event().id) ?? [];
    return unsortedTeams.sort(
      (team1, team2) => (team1.seed ?? 0) - (team2.seed ?? 0),
    );
  });
  readonly participants = linkedSignal(
    () =>
      this.eventService
        .eventParticipantsWithPlayerInfo()
        ?.filter((participant) =>
          this.teams().some((team) => team.id === participant.team_id),
        ) ?? [],
  );
  readonly pendingRequests = signal(0);
  readonly nextTempId = signal(-1);
  readonly randomizerDialogVisible = signal(false);
  readonly randomTeamCount = signal(1);

  // *** Event Handlers ***
  onTeamDrop(ev: CdkDragDrop<EventTeamWithParticipantInfo[]>): void {
    if (ev.previousIndex === ev.currentIndex) return;

    const previousTeams = this.teams();

    this.teams.update((teams) => {
      const reordered = [...teams];
      moveItemInArray(reordered, ev.previousIndex, ev.currentIndex);
      return reordered.map((team, index) => ({ ...team, seed: index + 1 }));
    });

    this.trackRequest(() =>
      this.eventService
        .batchUpdateEventTeamSeeds(
          this.teams().map((team) => ({ id: team.id, seed: team.seed! })),
        )
        .then(({ error }) => {
          if (error) {
            this.teams.set(previousTeams);
          }
        }),
    );
  }

  onAddTeamButtonClick(): void {
    const tempId = this.consumeTempId();

    const newTeamParams = {
      event_id: this.event().id,
      name: null,
      seed: this.teams().length + 1,
    };

    this.teams.update((teams) => [
      ...teams,
      {
        ...newTeamParams,
        id: tempId,
        created_at: '',
        updated_at: '',
      },
    ]);

    this.trackRequest(() =>
      this.eventService
        .createEventTeam(newTeamParams)
        .then(({ data, error }) => {
          if (error) {
            this.teams.update((teams) =>
              teams.filter((team) => team.id !== tempId),
            );
          } else {
            this.teams.update((teams) => [
              ...teams.slice(0, teams.length - 1),
              data[0],
            ]);
          }
        }),
    );
  }

  onDeleteTeamButtonClick(deletedTeamId: EventTeamModel['id']): void {
    confirmBackendAction({
      action: () => {
        const deletedTeam = this.teams().find(
          (team) => team.id === deletedTeamId,
        );

        if (!deletedTeam) {
          return Promise.resolve({
            error: { message: 'Unable to find a team to delete.' },
          }) as Promise<LocalErrorResponse>;
        }

        const previousParticipants = this.participants();

        this.teams.update((teams) =>
          teams
            .filter((team) => team.id !== deletedTeamId)
            .map((team, index) => ({ ...team, seed: index + 1 })),
        );

        this.participants.update((participants) =>
          participants.filter((p) => p.team_id !== deletedTeamId),
        );

        return this.trackRequest(() =>
          this.eventService
            .deleteEventTeamAndUpdateSeeds(
              deletedTeamId,
              this.teams().map((team) => ({ id: team.id, seed: team.seed! })),
            )
            .then((res) => {
              if (res.error) {
                this.teams.update((teams) => {
                  const revertedTeams = [...teams, deletedTeam];
                  revertedTeams.sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0));
                  return revertedTeams.map((team, index) => ({
                    ...team,
                    seed: index + 1,
                  }));
                });
                this.participants.set(previousParticipants);
              }
              return res;
            }),
        );
      },
      confirmationMessageText: 'Delete this team and unassign all its players?',
      submittingSignal: null,
      successMessageText: null, // messages clutter screen if there are multiple deletes in a row
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      successNavigation: null,
    });
  }

  onDeleteParticipantButtonClick(
    participant: EventParticipantWithPlayerInfo,
  ): void {
    this.deleteParticipant(participant);
  }

  onParticipantDrop(
    ev:
      | CdkDragDrop<
          EventTeamWithParticipantInfo,
          EventTeamWithParticipantInfo,
          EventParticipantWithPlayerInfo
        >
      | CdkDragDrop<
          undefined,
          EventTeamWithParticipantInfo,
          EventParticipantWithPlayerInfo
        >
      | CdkDragDrop<
          EventTeamWithParticipantInfo,
          undefined,
          EventParticipantWithPlayerInfo
        >,
  ): void {
    const newTeamId: number | null = ev.container.data?.id ?? null;
    const oldTeamId: number | null = ev.previousContainer.data?.id ?? null;

    if (newTeamId === oldTeamId) return;

    const previousParticipants = this.participants();
    const draggedItem = ev.item.data;

    const isFromUnassigned = oldTeamId === null;
    const isToUnassigned = newTeamId === null;

    if (isFromUnassigned) {
      const player = draggedItem;
      const tempId = this.consumeTempId();

      this.participants.update((participants) => [
        ...participants,
        {
          participant_id: tempId,
          player_id: player.player_id,
          team_id: newTeamId!,
          avatar_url: player.avatar_url,
          display_name: player.display_name,
        } as EventParticipantWithPlayerInfo,
      ]);

      this.trackRequest(() =>
        this.eventService
          .createEventParticipant({
            player_id: player.player_id,
            team_id: newTeamId!,
          })
          .then(({ data, error }) => {
            if (error) {
              this.participants.set(previousParticipants);
            } else {
              this.participants.update((participants) =>
                participants.map((p) =>
                  p.participant_id === tempId
                    ? { ...p, participant_id: data[0].id }
                    : p,
                ),
              );
            }
          }),
      );
    } else if (isToUnassigned) {
      this.deleteParticipant(draggedItem);
    } else {
      const participant = draggedItem;

      this.participants.update((participants) =>
        participants.map((p) =>
          p.participant_id === participant.participant_id
            ? { ...p, team_id: newTeamId! }
            : p,
        ),
      );

      this.trackRequest(() =>
        this.eventService
          .updateEventParticipant(participant.participant_id, {
            team_id: newTeamId!,
            player_id: participant.player_id,
          })
          .then(({ error }) => {
            if (error) {
              this.participants.set(previousParticipants);
            }
          }),
      );
    }
  }

  async onRandomizeTeamsButtonClick(): Promise<void> {
    this.pendingRequests.update((requests) => requests + 1);

    await this.eventService.randomizeEventTeams(
      this.event().id,
      this.randomTeamCount(),
    );

    this.pendingRequests.update((requests) => requests - 1);
    this.randomizerDialogVisible.set(false);
  }

  // *** Helper Methods ***
  private trackRequest<T>(request: () => Promise<T>): Promise<T> {
    this.pendingRequests.update((n) => n + 1);
    return request().finally(() => this.pendingRequests.update((n) => n - 1));
  }

  private consumeTempId(): number {
    const id = this.nextTempId();
    this.nextTempId.update((id) => id - 1);
    return id;
  }

  private deleteParticipant(participant: EventParticipantWithPlayerInfo): void {
    const previousParticipants = this.participants();

    this.participants.update((participants) =>
      participants.filter(
        (p) => p.participant_id !== participant.participant_id,
      ),
    );

    this.trackRequest(() =>
      this.eventService
        .deleteEventParticipant(participant.participant_id)
        .then(({ error }) => {
          if (error) {
            this.participants.set(previousParticipants);
          }
        }),
    );
  }

  // *** Constants ***
  protected readonly unassignedPlayerDropListId = unassignedPlayerDropListId;
}
