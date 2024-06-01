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

    @if (localSortedEventTeams(); as teams) {
      <p class="font-semibold mb-0">Unassigned Players</p>
      <div cdkDropList (cdkDropListDropped)="onEventTeamDrop($event)">
        @for (player of players(); track player.player_id; let first = $first) {
          <div
            class="w-full flex border-bottom-1 border-100 pt-3 pb-3 pr-3 text-color no-underline surface-card"
            cdkDrag
            [cdkDragDisabled]="!userIsGameMaster()"
          >
            @if (userIsGameMaster()) {
              <div class="flex" cdkDragHandle>
                <i class="pi pi-bars text-300 align-self-center pl-2 pr-3"></i>
              </div>
            }
            <img
              [ngSrc]="player.avatar_url"
              alt=""
              width="32"
              height="32"
              class="border-circle surface-100 mr-2"
            />
            <span class="text-800 align-self-center">
              {{ player.display_name }}
            </span>
            <div class="surface-200 h-1rem w-full" *cdkDragPlaceholder></div>
          </div>
        } @empty {
          <p class="mt-5 text-center font-italic text-400">No teams assigned</p>
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

  readonly players = this.playerService.players;

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
    this.localSortedEventTeams.update((eventTeams) => {
      moveItemInArray(eventTeams!, drop.previousIndex, drop.currentIndex);
      return [...eventTeams!];
    });
  }
}
