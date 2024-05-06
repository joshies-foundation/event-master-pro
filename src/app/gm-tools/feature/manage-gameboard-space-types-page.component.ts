import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SessionService } from '../../shared/data-access/session.service';
import { SkeletonModule } from 'primeng/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';

@Component({
  selector: 'joshies-manage-gameboard-space-types-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    StronglyTypedTableRowDirective,
    GameboardSpaceDescriptionPipe,
    RouterLink,
    GameboardSpaceComponent,
  ],
  template: `
    <joshies-page-header headerText="Space Types" alwaysSmall>
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

    @if (gameboardSpaces(); as gameboardSpaces) {
      @for (
        gameboardSpace of gameboardSpaces;
        track gameboardSpace.id;
        let first = $first
      ) {
        <a
          class="w-full flex align-items-center border-bottom-1 border-100 p-3 text-color no-underline"
          [class.mt-5]="first"
          [routerLink]="[gameboardSpace.id]"
        >
          <joshies-gameboard-space class="mr-3" [model]="gameboardSpace" />
          <div class="flex-grow-1">
            <h4 class="mt-0 mb-2">{{ gameboardSpace.name }} Space</h4>
            <div
              class="text-sm text-600"
              [innerHTML]="gameboardSpace | gameboardSpaceDescription"
            ></div>
          </div>
          <i class="pi pi-angle-right ml-2 text-300"></i>
        </a>
      }
    } @else if (gameboardSpaces() === null) {
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
export default class ManageGameboardSpaceTypesPageComponent {
  private readonly sessionService = inject(SessionService);

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;

  readonly gameboardSpaces = this.sessionService.gameboardSpaces;
}
