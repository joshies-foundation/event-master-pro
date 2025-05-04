import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-manage-special-space-events-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    SkeletonModule,
  ],
  template: `
    <joshies-page-header headerText="Special Space Events" alwaysSmall>
      <div class="flex w-full justify-between">
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
          class="flex w-full items-center border-b border-neutral-100 p-4 no-underline"
          [class.mt-5]="first"
          [routerLink]="[eventTemplate.id]"
        >
          <div class="grow">
            <h4 class="mb-2 font-bold">{{ eventTemplate.name }}</h4>
            <p class="m-0 text-sm text-neutral-600">
              {{ eventTemplate.description }}
            </p>
          </div>
          <i class="pi pi-angle-right ml-2 text-neutral-300"></i>
        </a>
      } @empty {
        <p class="mt-12 mb-4 pt-12 text-center text-neutral-500 italic">
          Tap <span class="font-bold text-primary">+</span> to add a Special
          Space event
        </p>
      }
    } @else if (specialSpaceEventTemplates() === null) {
      <p class="mt-12 mb-4 pt-12 text-center text-neutral-500 italic">
        No active session
      </p>
    } @else {
      <p-skeleton height="5rem" styleClass="mt-8 mb-2" />
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
