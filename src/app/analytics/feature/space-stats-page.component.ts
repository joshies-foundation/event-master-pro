import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../auth/data-access/auth.service';
import { PostgrestResponse } from '@supabase/supabase-js';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { PlayerSpaceStats } from '../../shared/util/supabase-types';
import { GameboardSpaceComponent } from '../../gm-tools/ui/gameboard-space.component';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { GameboardService } from '../../shared/data-access/gameboard.service';

@Component({
  selector: 'joshies-space-stats-page',
  imports: [
    DecimalPipe,
    NgOptimizedImage,
    TableModule,
    NgClass,
    PageHeaderComponent,
    HeaderLinkComponent,
    StronglyTypedTableRowDirective,
    GameboardSpaceComponent,
  ],
  template: `
    <joshies-page-header headerText="Space Stats" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mt-8 mb-4">How many times each player landed on each space</p>

    @if (spaceStats(); as spaceStats) {
      <!-- Lifetime Rankings Table -->
      <p-table
        [value]="spaceStats"
        [defaultSortOrder]="-1"
        sortField="lifetime_score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            @for (space of gameboardSpaces(); track space.id) {
              <th class="text-center">
                <joshies-gameboard-space [model]="space" class="mx-auto" />
              </th>
            }
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="spaceStats"
          let-player
        >
          <tr
            [ngClass]="{
              'font-semibold bg-highlight': player.user_id === userId(),
            }"
          >
            <td pFrozenColumn>
              <div class="flex items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                />
                {{ player.display_name }}
              </div>
            </td>

            @for (space of gameboardSpaces(); track space.id) {
              <td class="text-center">
                @if (player.space_stats[space.id]; as numTimesLandedOnSpace) {
                  {{ numTimesLandedOnSpace | number }}
                } @else {
                  <span class="text-neutral-300">–</span>
                }
              </td>
            }
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p class="text-danger-foreground">Error loading data</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpaceStatsPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly authService = inject(AuthService);

  readonly spaceStatsQueryResult =
    input.required<PostgrestResponse<PlayerSpaceStats>>(); // route resolver param

  readonly gameboardSpaces = this.gameboardService.gameboardSpaces;

  readonly spaceStats = computed(() => this.spaceStatsQueryResult().data);

  readonly userId = computed(() => this.authService.user()?.id);

  protected readonly trackByPlayerId = trackByPlayerId;
}
