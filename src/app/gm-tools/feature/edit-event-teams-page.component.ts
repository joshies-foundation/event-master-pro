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
import { EventModel } from '../../shared/util/supabase-types';
import { EventService } from '../../shared/data-access/event.service';
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

@Component({
  selector: 'joshies-edit-event-teams-page',
  standalone: true,
  template: `
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <joshies-header-link
        text="Events"
        routerLink="../.."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Unassigned players -->
    @if (localSortedEventTeams(); as teams) {
      <p class="font-semibold mb-1">Unassigned Players</p>
      <div
        cdkDropList
        [cdkDropListEnterPredicate]="eventTeamListEnterPredicate"
        class="flex flex-wrap border-1 border-200 border-round-md"
        #unassignedPlayerList="cdkDropList"
      >
        @for (
          player of unassignedPlayers();
          track player.player_id;
          let first = $first
        ) {
          <div
            class="flex border-round-md p-2 m-1 text-color no-underline surface-200"
            cdkDrag
            [cdkDragDisabled]="!userIsGameMaster()"
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
            <div class="surface-200 h-1rem w-full" *cdkDragPlaceholder></div>
          </div>
        } @empty {
          <p class="text-center text-400 ml-2">
            Drag players here to remove them from a team
          </p>
        }
      </div>

      <!-- Event Teams -->
      <p class="font-semibold">Teams</p>
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
            <div
              class="flex flex-wrap flex-grow-1 border-1 border-200 border-round-md my-2"
              cdkDropList
              [cdkDropListConnectedTo]="unassignedPlayerList"
            >
              <p class="text-sm text-400 px-2">{{ index + 1 }}</p>
              @for (
                player of team.players;
                track player.player_id;
                let first = $first
              ) {
                <div
                  class="flex border-round-md p-2 m-1 text-color no-underline surface-200"
                  cdkDrag
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
                <p class="mt-5 text-center font-italic text-400">
                  No teams assigned
                </p>
              }
            </div>
            <div class="surface-200 h-3rem w-full" *cdkDragPlaceholder></div>
          </div>
        }
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
  readonly unassignedPlayers = computed(() =>
    this.players()?.filter(
      (player) =>
        !this.localSortedEventTeams()?.some((team) =>
          team.players?.some(
            (teamPlayer) => teamPlayer.player_id === player.player_id,
          ),
        ),
    ),
  );

  readonly databaseEventTeams = computed(() =>
    this.eventService
      .eventTeamsWithPlayerUserInfo()
      ?.filter((eventTeam) => eventTeam.event_id === this.eventId())
      ?.sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0)),
  );

  readonly localSortedEventTeams = signal(this.databaseEventTeams()?.slice());

  private readonly updateLocalEventsArrayOnDatabaseUpdates = effect(
    () => this.localSortedEventTeams.set(this.databaseEventTeams()?.slice()),
    { allowSignalWrites: true },
  );

  onEventTeamDrop(drop: CdkDragDrop<string[]>): void {
    console.dir(drop.previousIndex);
    console.dir(drop.currentIndex);
    this.localSortedEventTeams.update((eventTeams) => {
      moveItemInArray(eventTeams!, drop.previousIndex, drop.currentIndex);
      return [...eventTeams!];
    });
  }

  eventTeamListEnterPredicate(item: CdkDrag): boolean {
    console.dir(item);
    return false;
  }
}
