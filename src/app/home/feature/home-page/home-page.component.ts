import { CardComponent } from '../../../shared/ui/card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import {
  DatePipe,
  DecimalPipe,
  NgClass,
  NgOptimizedImage,
} from '@angular/common';
import { SessionService } from '../../../shared/data-access/session.service';
import { RankingsTableComponent } from '../../../shared/ui/rankings-table.component';
import { AuthService } from '../../../auth/data-access/auth.service';
import { GameStateService } from '../../../shared/data-access/game-state.service';

@Component({
  selector: 'joshies-home-page',
  standalone: true,
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    PageHeaderComponent,
    TableModule,
    InputNumberModule,
    FormsModule,
    SkeletonModule,
    DecimalPipe,
    NgClass,
    NgOptimizedImage,
    RankingsTableComponent,
    DatePipe,
  ],
})
export default class HomePageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);

  private readonly scoreUpdates: Record<number, NodeJS.Timeout> = {};

  private readonly happeningNowMessage: Signal<string> = computed(
    () =>
      `We're in round <strong>${this.gameStateService.roundNumber()}</strong> of <strong>${this.sessionService.session()?.num_rounds}</strong>.`,
  );

  private readonly upNextMessage: Signal<string> = computed(() => {
    const currentlyInLastRound =
      this.gameStateService.roundNumber() ===
      this.sessionService.session()?.num_rounds;

    return currentlyInLastRound
      ? `This is the last round! Give it all you've got.`
      : `Up next is round <strong>${(this.gameStateService.roundNumber() ?? 0) + 1}</strong> of <strong>${this.sessionService.session()?.num_rounds}.</strong>`;
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      players: this.playerService.players()!,
      userIsGameMaster: this.playerService.userIsGameMaster(),
      userId: this.authService.user()?.id,
      happeningNowMessage: this.happeningNowMessage(),
      upNextMessage: this.upNextMessage(),
    }),
  );
}
