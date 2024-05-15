import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { EventService } from '../../shared/data-access/event.service';
import { NgOptimizedImage } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { EventModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-manage-events-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    StronglyTypedTableRowDirective,
    GameboardSpaceDescriptionPipe,
    RouterLink,
    GameboardSpaceComponent,
    NgOptimizedImage,
    DragDropModule,
  ],
  styles: [
    `
      :host ::ng-deep {
        .drop-column {
          border-radius: 0.2rem;
          transition: background-color 0.2s;

          &.p-draggable-enter {
            background: rgb(235, 240, 240);
          }
        }

        [pDraggable] {
          cursor: move;
        }
      }
    `,
  ],
  template: `
    <joshies-page-header headerText="Events" alwaysSmall>
      <div class="w-full flex justify-content-between">
        <joshies-header-link
          text="GM Tools"
          routerLink=".."
          chevronDirection="left"
        />
        <a routerLink="./new">
          <i class="pi pi-plus text-xl text-primary"></i>
        </a>
      </div>
    </joshies-page-header>

    @if (sortedEvents(); as sortedEvents) {
      <div
        class="drop-column h-1rem mt-5"
        pDroppable="events"
        (onDrop)="eventDrop(0)"
      ></div>
      @for (event of sortedEvents; track event.id; let first = $first) {
        <a
          class="w-full flex border-bottom-1 border-100 p-3 text-color no-underline"
          [routerLink]="[event.id]"
          pDraggable="events"
          (onDragStart)="eventDragStart(event)"
          (onDragEnd)="eventDragEnd()"
        >
          @if (event.image_url; as imageUrl) {
            <img
              [ngSrc]="imageUrl"
              alt=""
              width="48"
              height="48"
              class="border-round mr-3"
            />
          }
          <div class="flex-grow-1">
            <h4 class="mt-0 mb-2">{{ event.name }}</h4>
            <p class="m-0">{{ event.description }}</p>
          </div>
          <i class="pi pi-angle-right ml-2 text-300 align-self-center"></i>
        </a>
        <div
          class="drop-column h-1rem"
          pDroppable="events"
          (onDrop)="eventDrop(event.round_number)"
        ></div>
      } @empty {
        <p class="mt-5 text-center font-italic text-400">No events</p>
      }
    } @else if (sortedEvents() === null) {
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
  private readonly eventService = inject(EventService);

  private readonly events = this.eventService.events;
  private eventOrderUpdateInProgress = signal(false);

  private draggedEvent: EventModel | null = null;

  readonly sortedEvents = computed(() =>
    this.events()
      ?.slice()
      .sort((event1, event2) => event1.round_number - event2.round_number),
  );

  eventDragStart(event: EventModel): void {
    this.draggedEvent = event;
  }

  eventDragEnd(): void {
    this.draggedEvent = null;
  }

  async eventDrop(selectedEventPosition: number): Promise<void> {
    if (this.draggedEvent) {
      const updatedEventPosition =
        selectedEventPosition - (this.draggedEvent.round_number - 1) <= 0
          ? selectedEventPosition
          : selectedEventPosition - 1;

      const eventIdArray = this.sortedEvents()!.map((ev) => ev.id);

      eventIdArray.splice(this.draggedEvent.round_number - 1, 1);
      eventIdArray.splice(updatedEventPosition, 0, this.draggedEvent.id);

      this.eventOrderUpdateInProgress.set(true);
      for (let index = 1; index < eventIdArray.length; index++) {
        await this.eventService.updateEvent(eventIdArray[index], {
          round_number: index + 1,
        });
      }

      this.eventOrderUpdateInProgress.set(false);

      this.draggedEvent = null;
    }
  }
}
