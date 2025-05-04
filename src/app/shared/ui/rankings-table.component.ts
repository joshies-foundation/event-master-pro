import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PlayerWithUserAndRankInfo } from '../data-access/player.service';
import { trackByUserId } from '../util/supabase-helpers';
import { StronglyTypedTableRowDirective } from './strongly-typed-table-row.directive';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'joshies-rankings-table',
  imports: [
    TableModule,
    NgClass,
    FormsModule,
    StronglyTypedTableRowDirective,
    ImageModule,
    DecimalPipe,
  ],
  template: `
    <!-- Rankings Table -->
    <p-table [value]="players()" [rowTrackBy]="trackByUserId">
      <ng-template #header>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th class="text-right">Score</th>
        </tr>
      </ng-template>
      <ng-template #body [joshiesStronglyTypedTableRow]="players()" let-player>
        <tr
          [ngClass]="{
            'font-semibold bg-highlight': player.user_id === userId(),
          }"
        >
          <td class="text-center">
            @if (player.rankEmoji) {
              {{ player.rankEmoji }}
            } @else {
              {{ player.rank | number }}
            }
          </td>
          <td>
            <div class="-py-2 flex items-center gap-2">
              <p-image
                [src]="player.avatar_url"
                alt=""
                width="32"
                height="32"
                styleClass="bg-neutral-100 rounded-full overflow-hidden"
                [preview]="true"
              />
              {{ player.display_name }}
            </div>
          </td>
          <td class="text-right">
            {{ player.score | number }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingsTableComponent {
  players = input.required<PlayerWithUserAndRankInfo[]>();
  userId = input.required<string | null>();

  protected readonly trackByUserId = trackByUserId;
}
