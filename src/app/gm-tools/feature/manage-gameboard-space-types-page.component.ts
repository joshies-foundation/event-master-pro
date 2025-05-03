import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { RouterLink } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { GameboardService } from '../../shared/data-access/gameboard.service';

@Component({
  selector: 'joshies-manage-gameboard-space-types-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    GameboardSpaceDescriptionPipe,
    RouterLink,
    GameboardSpaceComponent,
  ],
  template: `
    <joshies-page-header headerText="Space Types" alwaysSmall>
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

    @if (gameboardSpaces(); as gameboardSpaces) {
      @for (
        gameboardSpace of gameboardSpaces;
        track gameboardSpace.id;
        let first = $first
      ) {
        <a
          class="w-full flex items-center border-b border-neutral-100 p-4 no-underline"
          [class.mt-5]="first"
          [routerLink]="[gameboardSpace.id]"
        >
          <joshies-gameboard-space class="mr-4" [model]="gameboardSpace" />
          <div class="grow">
            <h4 class="font-bold mb-2">{{ gameboardSpace.name }} Space</h4>
            <div
              class="text-sm text-neutral-600"
              [innerHTML]="gameboardSpace | gameboardSpaceDescription"
            ></div>
          </div>
          <i class="pi pi-angle-right ml-2 text-neutral-300"></i>
        </a>
      }
    } @else if (gameboardSpaces() === null) {
      <p class="mt-12 pt-12 text-center text-neutral-500 italic">
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
export default class ManageGameboardSpaceTypesPageComponent {
  private readonly gameboardService = inject(GameboardService);

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;

  readonly gameboardSpaces = this.gameboardService.gameboardSpaces;
}
