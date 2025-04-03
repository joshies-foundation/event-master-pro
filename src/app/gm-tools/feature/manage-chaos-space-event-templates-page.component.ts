import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-manage-chaos-space-event-templates-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RouterLink,
    SkeletonModule,
  ],
  template: `
    <joshies-page-header headerText="Chaos Space Events" alwaysSmall>
      <div class="w-full flex justify-between">
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

    @if (chaosSpaceEventTemplates(); as specialSpaceEventTemplates) {
      @for (
        eventTemplate of specialSpaceEventTemplates;
        track eventTemplate.id;
        let first = $first
      ) {
        <a
          class="w-full flex items-center border-b border-surface-100 dark:border-surface-700 p-4 text-color no-underline"
          [class.mt-5]="first"
          [routerLink]="[eventTemplate.id]"
        >
          <div class="grow">
            <h4 class="mt-0 mb-2">{{ eventTemplate.name }}</h4>
            <p class="m-0 text-sm text-surface-600 dark:text-surface-200">
              {{ eventTemplate.description }}
            </p>
          </div>
          <i
            class="pi pi-angle-right ml-2 text-surface-300 dark:text-surface-500"
          ></i>
        </a>
      } @empty {
        <p
          class="mt-12 pt-12 text-center text-surface-500 dark:text-surface-300 italic"
        >
          Tap <span class="font-bold text-primary">+</span> to add a Chaos Space
          event
        </p>
      }
    } @else if (chaosSpaceEventTemplates() === null) {
      <p
        class="mt-12 pt-12 text-center text-surface-500 dark:text-surface-300 italic"
      >
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

  readonly chaosSpaceEventTemplates = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );
}
