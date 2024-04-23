import { CommonModule, NgClass, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PlayerWithUserInfo } from '../data-access/player.service';

@Component({
  selector: 'joshies-rankings-table',
  standalone: true,
  imports: [CommonModule, TableModule, NgClass, FormsModule, NgOptimizedImage],
  template: `
    <!-- Rankings Table -->
    <p-table [value]="rankings()">
      <ng-template pTemplate="header">
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th class="text-right">Score</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-ranking>
        <tr
          [ngClass]="{
            'font-semibold bg-highlight': ranking.user_id === userId()
          }"
        >
          <td class="text-center">
            @if (ranking.rankEmoji) {
              {{ ranking.rankEmoji }}
            } @else {
              {{ ranking.rank | number }}
            }
          </td>
          <td>
            <div class="flex align-items-center gap-2 -py-2">
              <img
                [ngSrc]="ranking.avatar_url"
                alt=""
                width="32"
                height="32"
                class="border-circle surface-100"
              />
              {{ ranking.display_name }}
            </div>
          </td>
          <td class="text-right">
            {{ ranking.score | number }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingsTableComponent {
  players = input.required<PlayerWithUserInfo[]>();
  userId = input.required<string | null>();
  editable = input(false);

  readonly rankings = computed(() => {
    const sortedPlayers = this.players()
      .slice()
      .sort((player1, player2) => player2.score - player1.score);

    let currentRank = 1;
    let previousScore = sortedPlayers[0]?.score;

    return sortedPlayers.map((player, index) => {
      if (player.score !== previousScore) {
        currentRank = index + 1;
      }
      previousScore = player.score;
      return {
        user_id: player.user_id,
        player_id: player.player_id,
        display_name: player.display_name,
        score: player.score,
        avatar_url: player.avatar_url,
        rank: currentRank,
        rankEmoji:
          currentRank === 1
            ? '👑'
            : currentRank === sortedPlayers.length
              ? '💩'
              : undefined,
      };
    });
  });
}
