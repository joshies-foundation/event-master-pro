import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import {
  undefinedUntilAllPropertiesAreDefined,
  withAllDefined,
} from '../../../shared/util/signal-helpers';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { SessionService } from '../../../shared/data-access/session.service';

@Component({
  selector: 'joshies-rankings-page',
  standalone: true,
  imports: [
    TableModule,
    InputNumberModule,
    FormsModule,
    SkeletonModule,
    DecimalPipe,
    NgClass,
    NgOptimizedImage,
  ],
  templateUrl: './rankings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankingsPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);

  private scoreUpdates: Record<number, NodeJS.Timeout> = {};

  private readonly rankings = computed(() =>
    withAllDefined({ players: this.playerService.players() }, ({ players }) =>
      players
        ? players
            .sort((player1, player2) => player2.score - player1.score)
            .map((player, index, players) => ({
              player_id: player.player_id,
              display_name: player.display_name,
              score: player.score,
              avatar_url: player.avatar_url,
              rank: index + 1,
              rankEmoji:
                index === 0
                  ? '👑'
                  : index === players.length - 1
                    ? '💩'
                    : undefined,
            }))
        : null,
    ),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      rankings: this.rankings(),
      userIsGameMaster: this.playerService.userIsGameMaster(),
      userPlayerId: this.playerService.userPlayerId(),
    }),
  );

  updateScore(playerId: number, score: number): void {
    if (this.scoreUpdates[playerId]) {
      clearTimeout(this.scoreUpdates[playerId]);
    }

    this.scoreUpdates[playerId] = setTimeout(() => {
      this.playerService.updateScore(playerId, score);
      delete this.scoreUpdates[playerId];
    }, 2000);
  }
}
