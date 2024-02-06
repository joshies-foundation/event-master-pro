import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../shared/data-access/user.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../shared/data-access/player.service';

@Component({
  selector: 'joshies-rankings-page',
  standalone: true,
  imports: [TableModule, InputNumberModule, FormsModule],
  templateUrl: './rankings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankingsPageComponent {
  private readonly userService = inject(UserService);
  private readonly playerService = inject(PlayerService);

  readonly userIsGameMaster = this.userService.userIsGameMaster;

  private scoreUpdates: Record<string, NodeJS.Timeout> = {};

  readonly rankings = computed(
    () =>
      this.playerService
        .players()
        ?.sort((player1, player2) => player2.score - player1.score)
        .map((player, index) => ({ ...player, rank: index + 1 })),
  );

  updateScore(userId: string, score: number): void {
    if (this.scoreUpdates[userId]) {
      clearTimeout(this.scoreUpdates[userId]);
    }

    const timerId = setTimeout(() => {
      this.userService.updateScore(userId, score);
      delete this.scoreUpdates[userId];
    }, 2000);

    this.scoreUpdates[userId] = timerId;
  }
}
