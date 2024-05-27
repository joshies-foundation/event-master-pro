import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-manage-special-space-events-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    GameboardSpaceComponent,
    GameboardSpaceDescriptionPipe,
    SkeletonModule,
  ],
  template: `
    <joshies-page-header headerText="Special Space Events" alwaysSmall>
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

    @if (specialSpaceEventTemplates(); as specialSpaceEventTemplates) {
      @for (
        eventTemplate of specialSpaceEventTemplates;
        track eventTemplate.id;
        let first = $first
      ) {
        <a
          class="w-full flex align-items-center border-bottom-1 border-100 p-3 text-color no-underline"
          [class.mt-5]="first"
          [routerLink]="[eventTemplate.id]"
        >
          <div class="flex-grow-1">
            <h4 class="mt-0 mb-2">{{ eventTemplate.name }}</h4>
            <p class="m-0 text-sm text-600">{{ eventTemplate.description }}</p>
          </div>
          <i class="pi pi-angle-right ml-2 text-300"></i>
        </a>
      }
    } @else if (specialSpaceEventTemplates() === null) {
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
export default class ManageSpecialSpaceEventTemplatesPageComponent {
  private readonly gameboardService = inject(GameboardService);

  readonly specialSpaceEventTemplates = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );
}
