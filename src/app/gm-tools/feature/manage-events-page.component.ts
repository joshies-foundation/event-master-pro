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
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { EventService } from '../../shared/data-access/event.service';
import { NgOptimizedImage } from '@angular/common';
import {
  CdkDropList,
  CdkDrag,
  DragDropModule,
  moveItemInArray,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { EventModel } from '../../shared/util/supabase-types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../shared/data-access/player.service';

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
    CdkDropList,
    CdkDrag,
    DragDropModule,
    ButtonModule,
  ],
  template: `
    <joshies-page-header headerText="Events" alwaysSmall>
      <div class="w-full flex justify-content-between align-items-center">
        <!-- TODO: Add a save confirmation when leaving page if edits have been made -->
        <joshies-header-link
          text="GM Tools"
          routerLink=".."
          chevronDirection="left"
        />
        <div class="flex align-items-center">
          @if (unsavedChangesExist()) {
            <p-button [text]="true" class="mr-3" (onClick)="saveChanges()">
              <i class="pi pi-save text-xl text-primary"></i>
            </p-button>
          }
          <a routerLink="./new">
            <i class="pi pi-plus text-xl text-primary"></i>
          </a>
        </div>
      </div>
    </joshies-page-header>
    @if (sortedEventsLocal(); as sortedEvents) {
      <div cdkDropList (cdkDropListDropped)="eventDrop($event)">
        @for (event of sortedEvents; track event.id; let first = $first) {
          <a
            class="w-full h-5rem flex border-bottom-1 border-100 pt-3 pb-3 pr-3 text-color no-underline"
            [class.mt-2]="first"
            [routerLink]="[event.id]"
            cdkDrag
            [cdkDragDisabled]="!userIsGameMaster()"
          >
            @if (userIsGameMaster()) {
              <div class="flex" cdkDragHandle>
                <i
                  class="pi pi-ellipsis-v text-400 align-self-center pl-2 pr-3"
                ></i>
              </div>
            }
            @if (event.image_url; as imageUrl) {
              <img
                [ngSrc]="imageUrl"
                alt=""
                width="48"
                height="48"
                class="border-round mr-3"
              />
            } @else {
              <img
                [ngSrc]="'/assets/icons/icon-72x72.png'"
                alt=""
                width="48"
                height="48"
                class="border-round mr-3"
              />
            }
            <div class="flex-grow-1">
              <h4 class="mt-0 mb-1">{{ event.name }}</h4>
              <p
                class="m-0 w-13rem white-space-nowrap overflow-hidden text-overflow-ellipsis"
              >
                {{ event.description }}
              </p>
            </div>
            <i class="pi pi-angle-right ml-2 text-300 align-self-center"></i>
            <div
              class="w-full h-5rem flex border-bottom-1 border-100 pt-3 pb-3 pr-3"
              style="background-color: var(--surface-200);"
              *cdkDragPlaceholder
            ></div>
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
  styles: `
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-preview {
      border: none;
      background-color: var(--surface-card);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ManageEventsPageComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly playerService = inject(PlayerService);

  private readonly events = this.eventService.events;
  readonly userIsGameMaster = this.playerService.userIsGameMaster;

  readonly sortedEvents = computed(() =>
    this.events()
      ?.slice()
      .sort((event1, event2) => event1.round_number - event2.round_number),
  );

  readonly sortedEventsLocal = signal([] as EventModel[]);
  readonly unsavedChangesExist = signal(false);
  private readonly submitting = signal(false);

  eventDrop(ev: CdkDragDrop<string[]>): void {
    const sortedEventsTemp = this.sortedEventsLocal();
    moveItemInArray(sortedEventsTemp, ev.previousIndex, ev.currentIndex);
    this.sortedEventsLocal.set(sortedEventsTemp);
    this.unsavedChangesExist.set(true);
  }

  private readonly getInitialSortedEventsArray = effect(
    () => {
      if (this.sortedEvents() && this.sortedEventsLocal().length === 0) {
        this.sortedEventsLocal.set(this.sortedEvents()!);
      }
    },
    { allowSignalWrites: true },
  );

  saveChanges(): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Save changes to event order?',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        this.submitting.set(true);

        let newRoundNumber = 1;
        for (const event of this.sortedEventsLocal()) {
          const { error } = await showMessageOnError(
            this.eventService.updateEvent(event.id, {
              round_number: newRoundNumber,
            }),
            this.messageService,
          );

          newRoundNumber++;

          if (error) {
            this.submitting.set(false);
            return;
          }
        }

        this.unsavedChangesExist.set(false);

        showSuccessMessage(
          'Event order updated successfully',
          this.messageService,
        );
      },
    });
  }
}
