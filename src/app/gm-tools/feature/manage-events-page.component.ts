import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { EventService } from '../../shared/data-access/event.service';
import { NgOptimizedImage } from '@angular/common';
import {
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../shared/data-access/player.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { EventModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-manage-events-page',
  standalone: true,
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
      <div class="w-full flex justify-content-between align-items-center">
        <!-- TODO: Add a save confirmation when leaving page if edits have been made -->
        <joshies-header-link
          text="GM Tools"
          routerLink=".."
          chevronDirection="left"
        />
        <div class="flex align-items-center">
          <!-- Save Changes Button-->
          @if (unsavedChangesExist()) {
            <p-button
              [text]="true"
              class="mr-3"
              (onClick)="saveChanges(sortedEvents()!, sortedEventsLocal()!)"
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

    @if (sortedEventsLocal(); as sortedEvents) {
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
          <a
            class="w-full h-5rem flex border-bottom-1 border-100 pt-3 pb-3 pr-3 text-color no-underline surface-card"
            [class.mt-2]="first"
            [routerLink]="[event.id]"
            cdkDrag
            [cdkDragDisabled]="
              !userIsGameMaster() || index + 1 < currentRoundNumber()
            "
          >
            @if (userIsGameMaster() && index + 1 >= currentRoundNumber()) {
              <div class="flex" cdkDragHandle>
                <i class="pi pi-bars text-300 align-self-center pl-2 pr-3"></i>
              </div>
            }

            <!-- Event Image -->
            <img
              [ngSrc]="event.image_url || '/assets/icons/icon-96x96.png'"
              alt=""
              width="48"
              height="48"
              class="border-round mr-3"
            />
            <div class="flex-grow-1">
              <!-- Event Name -->
              <h4 class="mt-0 mb-1">{{ event.name }}</h4>

              <!-- Event Description -->
              <p
                class="m-0 w-13rem white-space-nowrap overflow-hidden text-overflow-ellipsis"
              >
                {{ event.description }}
              </p>
            </div>
            <i class="pi pi-angle-right ml-2 text-300 align-self-center"></i>
            <div class="surface-200 h-5rem w-full" *cdkDragPlaceholder></div>
          </a>
        } @empty {
          <p class="mt-5 text-center font-italic text-400">No events</p>
        }
      </div>
    } @else if (sortedEvents === null) {
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
})
export default class ManageEventsPageComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);
  private readonly messageService = inject(MessageService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);

  private readonly events = this.eventService.events;
  readonly userIsGameMaster = this.playerService.userIsGameMaster;

  readonly currentRoundNumber = computed(
    () => this.gameStateService.roundNumber() ?? -1,
  );

  readonly sortedEvents = computed(() =>
    this.events()
      ?.slice()
      .sort((event1, event2) => event1.round_number - event2.round_number),
  );

  readonly sortedEventsLocal = signal(this.sortedEvents()?.slice());
  private readonly submitting = signal(false);

  readonly unsavedChangesExist = computed(() => {
    const dbEvents = this.sortedEvents();
    const localEvents = this.sortedEventsLocal();

    if (!dbEvents || !localEvents) return false;

    return dbEvents.some(
      (dbEvent, index) => dbEvent.id !== localEvents[index].id,
    );
  });

  onEventDrop(drop: CdkDragDrop<string[]>): void {
    this.sortedEventsLocal.update((events) => {
      moveItemInArray(events!, drop.previousIndex, drop.currentIndex);
      return [...events!];
    });
  }

  private readonly updateLocalEventsArrayOnDatabaseUpdates = effect(
    () => this.sortedEventsLocal.set(this.sortedEvents()?.slice()),
    { allowSignalWrites: true },
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
