import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { EventService } from '../../shared/data-access/event.service';
import { NgOptimizedImage } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../shared/data-access/player.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { EventModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-manage-events-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    RouterLink,
    NgOptimizedImage,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    ButtonModule,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Events" alwaysSmall>
      <div class="flex w-full items-center justify-between">
        <!-- TODO: Add a save confirmation when leaving page if edits have been made -->
        <joshies-header-link
          text="GM Tools"
          routerLink=".."
          chevronDirection="left"
        />
        <div class="flex items-center">
          <!-- Save Changes Button-->
          @if (unsavedChangesExist()) {
            <p-button
              [text]="true"
              class="mr-4"
              (onClick)="saveChanges(databaseEvents()!, localSortedEvents()!)"
            >
              <i class="pi pi-save text-xl text-primary"></i>
            </p-button>
          }

          <!-- New Event Button -->
          <a routerLink="./new">
            <i class="pi pi-plus text-xl text-primary"></i>
          </a>
        </div>
      </div>
    </joshies-page-header>

    @if (localSortedEvents(); as sortedEvents) {
      <div
        cdkDropList
        (cdkDropListDropped)="onEventDrop($event)"
        [cdkDropListSortPredicate]="sortPredicate()"
      >
        @for (
          event of sortedEvents;
          track event.id;
          let first = $first;
          let index = $index
        ) {
          <div
            class="flex h-24 w-full border-b border-neutral-100 bg-neutral-0 pt-4 pr-4 pb-4"
            [class.mt-2]="first"
            cdkDrag
            [cdkDragDisabled]="
              !userIsGameMaster() || index + 1 < currentRoundNumber()
            "
          >
            <div
              class="flex flex-col items-center justify-center text-center text-sm"
            >
              {{ index + 1 }}
              @if (userIsGameMaster() && index + 1 >= currentRoundNumber()) {
                <i
                  class="pi pi-bars self-center pr-4 pl-2 text-neutral-300"
                  cdkDragHandle
                ></i>
              }
            </div>

            <!-- Event Image -->
            <img
              [ngSrc]="event.image_url || '/icons/icon-96x96.png'"
              alt=""
              width="48"
              height="48"
              class="mr-4 size-12 rounded-border"
            />
            <div class="grow">
              <!-- Event Name -->
              <h4 class="mb-1 font-bold">{{ event.name }}</h4>

              <!-- Event Description -->
              <p
                class="mt-2 w-44 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {{ event.description }}
              </p>
            </div>

            <!-- Event Edit Links -->
            @if (userIsGameMaster() && index + 1 >= currentRoundNumber()) {
              <div class="flex flex-col">
                <a
                  class="mb-2 rounded-md bg-primary px-2 py-1 text-center text-primary-contrast"
                  [routerLink]="'edit/' + [event.id]"
                >
                  <i class="pi pi-pencil"></i>
                </a>
                <a
                  class="rounded-md bg-primary px-2 py-1 text-center text-primary-contrast"
                  [routerLink]="'teams/' + [event.id]"
                >
                  <i class="pi pi-users"></i>
                </a>
              </div>
              <div class="h-24 w-full bg-neutral-200" *cdkDragPlaceholder></div>
            }
          </div>
        } @empty {
          <p class="mt-8 mb-4 text-center text-neutral-400 italic">No events</p>
        }
      </div>
    } @else if (databaseEvents === null) {
      <p class="mt-12 mb-4 pt-12 text-center text-neutral-500 italic">
        No active session
      </p>
    } @else {
      <p-skeleton height="5rem" class="mt-8 mb-2" />
      <p-skeleton height="5rem" class="mb-2" />
      <p-skeleton height="5rem" class="mb-2" />
      <p-skeleton height="5rem" class="mb-2" />
      <p-skeleton height="5rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ManageEventsPageComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);
  private readonly messageService = inject(MessageService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);

  readonly databaseEvents = this.eventService.events;
  readonly userIsGameMaster = this.playerService.userIsGameMaster;

  readonly currentRoundNumber = computed(
    () => this.gameStateService.roundNumber() ?? -1,
  );

  readonly localSortedEvents = signal(this.databaseEvents()?.slice());
  private readonly submitting = signal(false);

  readonly unsavedChangesExist = computed(() => {
    const dbEvents = this.databaseEvents();
    const localEvents = this.localSortedEvents();

    if (!dbEvents || !localEvents) return false;

    return dbEvents.some(
      (dbEvent, index) => dbEvent.id !== localEvents[index].id,
    );
  });

  onEventDrop(drop: CdkDragDrop<string[]>): void {
    this.localSortedEvents.update((events) => {
      moveItemInArray(events!, drop.previousIndex, drop.currentIndex);
      return [...events!];
    });
  }

  private readonly updateLocalEventsArrayOnDatabaseUpdates = effect(() =>
    this.localSortedEvents.set(this.databaseEvents()?.slice()),
  );

  // prevent user from dragging an event into a round that is already over
  sortPredicate(): (index: number) => boolean {
    return (index: number) => index + 1 >= this.currentRoundNumber();
  }

  saveChanges(dbEvents: EventModel[], localEvents: EventModel[]): void {
    const eventsWithNewRoundNumber = localEvents.reduce<Record<number, number>>(
      (prev, event, index) => ({
        ...prev,
        ...(event.id === dbEvents[index].id ? {} : { [event.id]: index + 1 }), // only add entries for events that have a different round number
      }),
      {},
    );

    confirmBackendAction({
      confirmationMessageText: 'Save changes to event order?',
      successMessageText: 'Event order updated successfully',
      action: async () =>
        this.eventService.reorderEvents(eventsWithNewRoundNumber),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.submitting,
      successNavigation: null,
    });
  }
}
