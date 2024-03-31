import { CommonModule, NgClass, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { PlayerWithUserInfo } from '../../data-access/player.service';

@Component({
  selector: 'joshies-rankings-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    NgClass,
    InputNumberModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: './rankings-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingsTableComponent {
  players = input.required<PlayerWithUserInfo[]>();
  userId = input.required<string | null>();
  editable = input(false);

  scoreUpdate = output<{
    playerId: number;
    score: number;
  }>();

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

  onScoreUpdate(playerId: number, score: number): void {
    this.scoreUpdate.emit({ playerId, score });
  }
}
