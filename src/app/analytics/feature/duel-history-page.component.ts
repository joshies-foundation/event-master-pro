import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { trackById } from '../../shared/util/supabase-helpers';
import { DecimalPipe } from '@angular/common';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { DuelHistoryRecord } from '../../shared/util/supabase-types';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';
import { PostgrestResponse } from '@supabase/supabase-js';
import { DuelHistoryRecordToDuelPipe } from '../ui/duel-history-record-to-duel.pipe';

@Component({
  selector: 'joshies-duel-history-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    DecimalPipe,
    NumberWithSignAndColorPipe,
    TableModule,
    StronglyTypedTableRowDirective,
    DuelTableAvatarsComponent,
    DuelHistoryRecordToDuelPipe,
  ],
  template: `
    <joshies-page-header headerText="Duel History" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (duelHistory(); as duels) {
      @if (duels.length) {
        <p-table
          [value]="duels"
          [rowTrackBy]="trackById"
          sortField="round_number"
          styleClass="mt-8"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="round_number">
                Turn
                <p-sortIcon field="round_number" />
              </th>
              <th>Players</th>
              <th pSortableColumn="game_name">
                Game
                <p-sortIcon field="game_name" />
              </th>
              <th class="text-right" pSortableColumn="points_gained_by_winner">
                Points <p-sortIcon field="points_gained_by_winner" />
              </th>
            </tr>
          </ng-template>

          <ng-template #body let-duel [joshiesStronglyTypedTableRow]="duels">
            <tr>
              <td class="text-center">{{ duel.round_number | number }}</td>
              <td>
                <joshies-duel-table-avatars
                  [duel]="duel | duelHistoryRecordToDuel"
                />
              </td>
              <td class="text-sm">
                {{ duel.game_name }}
              </td>
              <td class="text-right">
                <div
                  [innerHTML]="
                    duel.points_gained_by_winner | numberWithSignAndColor
                  "
                ></div>
                <div class="mt-1 text-sm text-neutral-500">
                  ({{ duel.wager_percentage }}%)
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="my-12 py-12 text-center text-neutral-500 italic">
          No duels yet
        </p>
      }
    } @else {
      <p class="text-danger-foreground">Error loading data</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DuelHistoryPageComponent {
  readonly duelHistoryQueryResult =
    input.required<PostgrestResponse<DuelHistoryRecord>>(); // route resolver param

  readonly duelHistory = computed(() => this.duelHistoryQueryResult().data);

  protected readonly trackById = trackById;
}
