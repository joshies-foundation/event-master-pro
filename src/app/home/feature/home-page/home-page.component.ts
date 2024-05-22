import { CardComponent } from '../../../shared/ui/card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  signal,
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
import {
  RoundPhase,
  SessionStatus,
  showMessageOnError,
} from '../../../shared/util/supabase-helpers';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { showSuccessMessage } from '../../../shared/util/message-helpers';
import { EventService } from '../../../shared/data-access/event.service';
import { RouterLink } from '@angular/router';
import { EventInfoComponent } from '../../../shared/ui/event-info.component';

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
  host: {
    class: 'h-full',
  },
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
    ButtonModule,
    RouterLink,
    EventInfoComponent,
  ],
})
export default class HomePageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly messageService = inject(MessageService);

  private readonly showRankingsTable = computed(
    () => this.gameStateService.sessionStatus() !== SessionStatus.NotStarted,
  );

  private readonly rankingsTableHeader = computed(() =>
    this.gameStateService.sessionIsInProgress()
      ? 'Current Rankings'
      : 'Final Results',
  );

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
      showRankingsTable: this.showRankingsTable(),
      rankingsTableHeader: this.rankingsTableHeader(),
      sessionHasNotStarted: this.gameStateService.sessionHasNotStarted(),
      roundNumber: this.gameStateService.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      roundPhase: this.gameStateService.roundPhase(),
      eventForThisRound: this.eventService.eventForThisRound(),
      eventForNextRound: this.eventService.eventForNextRound(),
      sessionIsInProgress: this.gameStateService.sessionIsInProgress(),
      bankBalance: this.gameStateService.bankBalance(),
      players: this.playerService.players()!,
      userIsGameMaster: this.playerService.userIsGameMaster(),
      userId: this.authService.user()?.id,
      countdown: this.countdown(),
    }),
  );

  readonly sessionStarting = signal(false);

  async startSession(): Promise<void> {
    this.sessionStarting.set(true);

    const { error } = await showMessageOnError(
      this.sessionService.startSession(),
      this.messageService,
    );

    if (error) {
      this.sessionStarting.set(false);
      return;
    }

    showSuccessMessage('Session started!', this.messageService);
  }

  protected readonly RoundPhase = RoundPhase;
}
