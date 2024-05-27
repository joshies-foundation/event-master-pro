import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ButtonModule } from 'primeng/button';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import {
  GameboardSpaceEffect,
  trackById,
} from '../../shared/util/supabase-helpers';
import { SpecialSpaceEventsForCurrentRoundModel } from '../../shared/util/supabase-types';
import { PostgrestResponse } from '@supabase/supabase-js';
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
import { SessionService } from '../../shared/data-access/session.service';
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

    @if (error()) {
      <p class="text-red">Error: {{ error() }}</p>
    } @else {
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
                {{ specialSpaceEvent.template_name ?? '?' }}
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
      } @else {
        <p-skeleton height="30rem" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveSpecialSpaceEventsPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly gameStateService = inject(GameStateService);
  private readonly sessionService = inject(SessionService);

  readonly specialSpaceEventsForCurrentRoundResponse =
    input.required<PostgrestResponse<SpecialSpaceEventsForCurrentRoundModel>>();

  readonly error = computed(
    () => this.specialSpaceEventsForCurrentRoundResponse().error?.message,
  );

  readonly specialSpaceEvents: Signal<
    SpecialSpaceEventsForCurrentRoundModel[]
  > = computed(() => this.specialSpaceEventsForCurrentRoundResponse().data!);

  readonly specialSpaceEventTemplates = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );

  readonly roundNumber = this.gameStateService.roundNumber;

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
  protected readonly trackById = trackById;
}
