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
import { Observable, concat, map, of, takeWhile, timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { whenNotNull } from '../../../shared/util/rxjs-helpers';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

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
  host: {
    class: 'h-full',
  },
})
export default class HomePageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);

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

  private readonly countdown$: Observable<Countdown | null> =
    this.sessionService.session$.pipe(
      whenNotNull((session) =>
        concat(
          timer(0, 1000).pipe(
            map(
              () =>
                (new Date(session.start_date).getTime() - Date.now()) / 1000,
            ),
            takeWhile((secondsRemaining) => secondsRemaining >= 0),
            map(
              (secondsRemaining): Countdown => ({
                days: Math.floor(secondsRemaining / (3600 * 24)),
                hours: Math.floor((secondsRemaining % (3600 * 24)) / 3600),
                minutes: Math.floor((secondsRemaining % 3600) / 60),
                seconds: Math.floor(secondsRemaining % 60),
              }),
            ),
          ),
          of(null),
        ),
      ),
    );

  private readonly countdown: Signal<Countdown | null | undefined> = toSignal(
    this.countdown$,
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      players: this.playerService.players()!,
      userIsGameMaster: this.playerService.userIsGameMaster(),
      userId: this.authService.user()?.id,
      happeningNowMessage: this.happeningNowMessage(),
      upNextMessage: this.upNextMessage(),
      countdown: this.countdown(),
    }),
  );
}
