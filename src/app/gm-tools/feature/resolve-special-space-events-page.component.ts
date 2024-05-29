import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ButtonModule } from 'primeng/button';
import {
  GameboardService,
  SpecialSpaceEventWithPlayerAndTemplateData,
} from '../../shared/data-access/gameboard.service';
import {
  GameboardSpaceEffect,
  trackById,
} from '../../shared/util/supabase-helpers';
import { MovesWithSpaceIdPipe } from '../ui/moves-with-space-id.pipe';
import { AvatarModule } from 'primeng/avatar';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { SpacesWithEffectPipe } from '../ui/spaces-with-effect.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LoseOrGainPipe } from '../ui/lose-or-gain.pipe';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SpaceEventStatusTagComponent } from '../ui/space-event-status-tag.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-resolve-special-space-events-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    ButtonModule,
    MovesWithSpaceIdPipe,
    AvatarModule,
    DecimalPipe,
    SpacesWithEffectPipe,
    SkeletonModule,
    SelectButtonModule,
    LoseOrGainPipe,
    TitleCasePipe,
    NumberWithSignAndColorPipe,
    FormsModule,
    TableModule,
    StronglyTypedTableRowDirective,
    SpaceEventStatusTagComponent,
    RouterLink,
  ],
  template: `
    <joshies-page-header headerText="Special Space Events" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (specialSpaceEvents(); as specialSpaceEvents) {
      <p class="mt-5">Special Space events for turn {{ roundNumber() }}</p>

      <p-table [value]="specialSpaceEvents" [rowTrackBy]="trackById">
        <ng-template pTemplate="header">
          <tr>
            <th class="px-0">Player</th>
            <th>Event</th>
            <th class="text-right px-0">Status</th>
            <th class="px-0"></th>
          </tr>
        </ng-template>

        <ng-template
          pTemplate="body"
          let-specialSpaceEvent
          [joshiesStronglyTypedTableRow]="specialSpaceEvents"
        >
          <tr [routerLink]="[specialSpaceEvent.id]">
            <td class="px-0">
              <div class="flex align-items-center">
                <p-avatar
                  [image]="specialSpaceEvent.avatar_url!"
                  shape="circle"
                  styleClass="mr-2"
                />
                {{ specialSpaceEvent.display_name }}
              </div>
            </td>
            <td>
              {{ specialSpaceEvent.template?.name ?? '?' }}
            </td>
            <td class="text-right px-0">
              <joshies-space-event-status-tag
                [spaceEventStatus]="specialSpaceEvent.status"
              />
            </td>
            <td class="pl-1 pr-0">
              <i class="pi pi-angle-right text-400"></i>
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else if (specialSpaceEvents() === null) {
      <p class="mt-6 pt-6 text-center text-500 font-italic">
        No special space events for this turn
      </p>
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveSpecialSpaceEventsPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly gameStateService = inject(GameStateService);

  readonly specialSpaceEvents: Signal<
    SpecialSpaceEventWithPlayerAndTemplateData[] | null | undefined
  > = toSignal(this.gameboardService.specialSpaceEventsForThisTurn$);

  readonly roundNumber = this.gameStateService.roundNumber;

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
  protected readonly trackById = trackById;
}
