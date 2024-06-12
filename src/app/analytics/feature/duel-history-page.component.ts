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
import { RouterLink } from '@angular/router';
import { DuelHistoryRecord } from '../../shared/util/supabase-types';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';
import { PostgrestResponse } from '@supabase/supabase-js';
import { DuelHistoryRecordToDuelPipe } from '../ui/duel-history-record-to-duel.pipe';

@Component({
  selector: 'joshies-duel-history-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    DecimalPipe,
    NumberWithSignAndColorPipe,
    TableModule,
    StronglyTypedTableRowDirective,
    DuelTableAvatarsComponent,
    DuelHistoryRecordToDuelPipe,
    RouterLink,
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
        <p-table [value]="duels" [rowTrackBy]="trackById" styleClass="mt-5">
          <ng-template pTemplate="header">
            <tr>
              <th>Turn</th>
              <th>Players</th>
              <th>Game</th>
              <th class="text-right">Points</th>
            </tr>
          </ng-template>

          <ng-template
            pTemplate="body"
            let-duel
            [joshiesStronglyTypedTableRow]="duels"
          >
            <tr [routerLink]="[duel.id]">
              <td class="text-center">{{ duel.round_number | number }}</td>
              <td>
                <joshies-duel-table-avatars
                  [duel]="duel | duelHistoryRecordToDuel"
                />
              </td>
              <td class="text-sm">
                {{ duel.game_name }}
              </td>
              <td
                class="text-right"
                [innerHTML]="
                  duel.points_gained_by_winner | numberWithSignAndColor
                "
              ></td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="my-6 py-6 text-center text-500 font-italic">No duels yet</p>
      }
    } @else {
      <p class="text-red-700">Error loading data</p>
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
