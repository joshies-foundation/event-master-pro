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
import { PlayerRollHistory } from '../../shared/util/supabase-types';
import { GameboardSpaceComponent } from '../../gm-tools/ui/gameboard-space.component';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';

@Component({
  selector: 'joshies-roll-history-page',
  standalone: true,
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
    <joshies-page-header headerText="Roll History" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (rollHistory(); as rollHistory) {
      <!-- Lifetime Rankings Table -->
      <p-table
        [value]="rollHistory"
        [defaultSortOrder]="-1"
        sortField="lifetime_score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
        styleClass="mt-5"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            @for (turnIndex of turnIndices(); track turnIndex) {
              <th class="text-center">{{ turnIndex + 1 | number }}</th>
            }
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="rollHistory"
          let-player
        >
          <tr
            [ngClass]="{
              'font-semibold bg-highlight': player.user_id === userId(),
            }"
          >
            <td pFrozenColumn>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                />
                {{ player.display_name }}
              </div>
            </td>

            @for (
              move of player.gameboard_moves;
              track moveIndex;
              let moveIndex = $index
            ) {
              <td>
                <div
                  class="flex align-items-center justify-content-center gap-3 text-600"
                >
                  {{ move.distance }}
                  @if (move.gameboard_space.color) {
                    <joshies-gameboard-space
                      [model]="$any(move.gameboard_space)"
                    />
                  }
                </div>
              </td>
            }
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p class="text-red-700">Error loading data</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RollHistoryPageComponent {
  readonly rollHistoryQueryResult =
    input.required<PostgrestResponse<PlayerRollHistory>>(); // route resolver param

  readonly rollHistory = computed(() => this.rollHistoryQueryResult().data);

  readonly turnIndices = computed(() =>
    this.rollHistory()?.[0]?.gameboard_moves.map((move, index) => index),
  );

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly authService = inject(AuthService);

  readonly userId = computed(() => this.authService.user()?.id);
}
