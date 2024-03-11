import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PlayerService } from '../../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { RankingsTableComponent } from '../../../shared/ui/rankings-table/rankings-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'joshies-analytics-current-page',
  standalone: true,
  imports: [RankingsTableComponent, SkeletonModule],
  templateUrl: './analytics-current-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsCurrentPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      players: this.playerService.players()!,
      userId: this.authService.user()?.id,
    }),
  );
}
