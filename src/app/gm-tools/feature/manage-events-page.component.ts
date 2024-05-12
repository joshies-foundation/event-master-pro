import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { EventService } from '../../shared/data-access/event.service';
import { NgOptimizedImage } from '@angular/common';

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

    @if (events(); as events) {
      @for (event of events; track event.id; let first = $first) {
        <a
          class="w-full flex align-items-center border-bottom-1 border-100 p-3 text-color no-underline"
          [class.mt-5]="first"
          [routerLink]="[event.id]"
        >
          @if (event.image_url; as imageUrl) {
            <img [ngSrc]="imageUrl" alt="" />
          }
          <div class="flex-grow-1">
            <h4 class="mt-0 mb-2">{{ event.name }}</h4>
            <p>{{ event.description }}</p>
          </div>
          <i class="pi pi-angle-right ml-2 text-300"></i>
        </a>
      } @empty {
        <p class="mt-5 text-center font-italic text-400">No events</p>
      }
    } @else if (events() === null) {
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

  readonly events = this.eventService.events;
}
