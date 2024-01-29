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
import { GameMasterService } from '../../../shared/data-access/game-master.service';

@Component({
  selector: 'joshies-rankings-page',
  standalone: true,
  imports: [TableModule, InputNumberModule, FormsModule],
  templateUrl: './rankings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankingsPageComponent {
  private readonly userService = inject(UserService);
  private readonly gameMasterService = inject(GameMasterService);

  readonly userIsGameMaster = this.gameMasterService.userIsGameMaster;

  private scoreUpdates: Record<string, NodeJS.Timeout> = {};

  readonly rankings = computed(() =>
    this.userService
      .allUsers()
      .sort((user1, user2) => user2.score - user1.score)
      .map((user, index) => ({ ...user, rank: index + 1 })),
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
