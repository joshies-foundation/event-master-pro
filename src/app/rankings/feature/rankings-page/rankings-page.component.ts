import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
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
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { SessionService } from '../../../shared/data-access/session.service';
import { RankingsTableComponent } from '../../../shared/ui/rankings-table/rankings-table.component';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'joshies-rankings-page',
  standalone: true,
  templateUrl: './rankings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    TableModule,
    InputNumberModule,
    FormsModule,
    SkeletonModule,
    DecimalPipe,
    NgClass,
    NgOptimizedImage,
    RankingsTableComponent,
  ],
})
export default class RankingsPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);

  private scoreUpdates: Record<number, NodeJS.Timeout> = {};

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      players: this.playerService.players()!,
      userIsGameMaster: this.playerService.userIsGameMaster(),
      userId: this.authService.user()?.id,
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
