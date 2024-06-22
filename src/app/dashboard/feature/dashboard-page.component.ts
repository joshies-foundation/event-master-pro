import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { SessionService } from '../../shared/data-access/session.service';
import { CountdownTimerComponent } from '../../shared/ui/countdown-timer.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  SessionStatus,
  RoundPhase,
  GameboardSpaceEffect,
} from '../../shared/util/supabase-helpers';
import { RankingsTableComponent } from '../../shared/ui/rankings-table.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { AuthService } from '../../auth/data-access/auth.service';
import { CardComponent } from '../../shared/ui/card.component';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { SpaceEventTableComponent } from '../../home/ui/space-event-table.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { DuelService } from '../../shared/data-access/duel.service';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';
import { StatusTagComponent } from '../../gm-tools/ui/status-tag.component';
import { EventInfoComponent } from '../../shared/ui/event-info.component';
import { EventService } from '../../shared/data-access/event.service';

@Component({
  selector: 'joshies-dashboard-page',
  standalone: true,
  imports: [
    CountdownTimerComponent,
    SkeletonModule,
    RankingsTableComponent,
    CardComponent,
    DecimalPipe,
    SpaceEventTableComponent,
    DuelTableAvatarsComponent,
    StatusTagComponent,
    EventInfoComponent,
    NgOptimizedImage,
  ],
  template: `
    @if (viewModel(); as vm) {
      @if (vm.countdown) {
        <joshies-countdown-timer [countdown]="vm.countdown" />
      } @else {
        <div class="grid nested-grid">
          @if (vm.showRankingsTable) {
            <!-- Rankings Table -->
            <div class="col-4">
              <h2 class="mt-0 mb-2">
                <i class="pi pi-trophy text-primary mr-2"></i>
                {{ vm.rankingsTableHeader }}
              </h2>
              <joshies-rankings-table [players]="vm.players!" [userId]="null" />
            </div>
          }
          <div class="grid col-8">
            @if (vm.sessionIsInProgress) {
              <!-- Happening Now, Up Next, Bank Balance -->
              <div class="col-6">
                <!-- Happening Now -->
                <joshies-card
                  headerText="Happening Now"
                  headerIconClass="pi pi-star text-primary mr-2"
                  isDashboardCard
                  padded
                >
                  @switch (vm.roundPhase) {
                    @case (RoundPhase.GameboardMoves) {
                      <div class="flex gap-3">
                        <img
                          ngSrc="/assets/dice-roll.gif"
                          alt=""
                          width="48"
                          height="48"
                          class="border-round"
                        />
                        <div>
                          <p class="mt-0 mb-1">
                            Gameboard moves for turn
                            <strong>{{ vm.roundNumber | number }}</strong> of
                            <strong>{{ vm.numRounds }}</strong
                            >.
                          </p>
                          <p class="m-0">Let's get rolling!</p>
                        </div>
                      </div>
                    }
                    @case (RoundPhase.SpecialSpaceEvents) {
                      <p class="mt-0 mb-2">Special Space Events:</p>

                      <joshies-space-event-table
                        [spaceEvents]="vm.specialSpaceEvents"
                        [spaceType]="GameboardSpaceEffect.Special"
                      />
                    }
                    @case (RoundPhase.Duels) {
                      <p class="mt-0 mb-2">Duels:</p>

                      <table class="w-full">
                        <tbody>
                          @for (duel of vm.duels; track duel.id) {
                            <tr>
                              <td class="pt-1 pr-2">
                                <joshies-duel-table-avatars [duel]="duel" />
                              </td>

                              <td class="text-sm">{{ duel.game_name }}</td>

                              <td class="pt-1 text-right">
                                <joshies-status-tag [status]="duel.status" />
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td class="font-italic text-600">
                                No duels for this turn
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                    @case (RoundPhase.ChaosSpaceEvents) {
                      <p class="mt-0 mb-2">Chaos Space Events:</p>

                      <joshies-space-event-table
                        [spaceEvents]="vm.chaosSpaceEvents"
                        [spaceType]="GameboardSpaceEffect.Chaos"
                      />
                    }
                    @case (RoundPhase.Event) {
                      @if (vm.eventForThisRound; as event) {
                        <joshies-event-info [event]="event" />
                      } @else {
                        <span class="text-red font-semibold">
                          There's no event scheduled for this turn 😳 Tell the
                          GM to get on it 😤
                        </span>
                      }
                    }
                    @case (RoundPhase.WaitingForNextRound) {
                      @if (vm.roundNumber < vm.numRounds) {
                        Stretch those dice-rolling fingers in preparation for
                        the next turn.
                      } @else {
                        🏆 Awards Ceremony
                      }
                    }
                  }
                </joshies-card>

                <!-- Up Next -->
                <joshies-card
                  class="mt-5"
                  headerText="Up Next"
                  headerIconClass="pi pi-arrow-circle-right text-primary mr-2"
                  isDashboardCard
                  padded
                >
                  @switch (vm.roundPhase) {
                    @case (RoundPhase.GameboardMoves) {
                      <p class="mt-0 mb-1">
                        Special Space events, duels, and Chaos Space events.
                      </p>
                      <p class="mt-0">Then, our next event:</p>

                      @if (vm.eventForThisRound; as event) {
                        <joshies-event-info [event]="event" />
                      } @else {
                        <span class="text-red font-semibold">
                          There's no event scheduled for this turn 😳 Tell the
                          GM to get on it 😤
                        </span>
                      }
                    }
                    @case (RoundPhase.SpecialSpaceEvents) {
                      <p class="mt-0 mb-1">Duels and Chaos Space events.</p>
                      <p class="mt-0">Then, our next event:</p>

                      @if (vm.eventForThisRound; as event) {
                        <joshies-event-info [event]="event" />
                      } @else {
                        <span class="text-red font-semibold">
                          There's no event scheduled for this turn 😳 Tell the
                          GM to get on it 😤
                        </span>
                      }
                    }
                    @case (RoundPhase.Duels) {
                      <p class="mt-0">
                        Chaos Space events, and then our next event:
                      </p>

                      @if (vm.eventForThisRound; as event) {
                        <joshies-event-info [event]="event" />
                      } @else {
                        <span class="text-red font-semibold">
                          There's no event scheduled for this turn 😳 Tell the
                          GM to get on it 😤
                        </span>
                      }
                    }
                    @case (RoundPhase.ChaosSpaceEvents) {
                      @if (vm.eventForThisRound; as event) {
                        <joshies-event-info [event]="event" />
                      } @else {
                        <span class="text-red font-semibold">
                          There's no event scheduled for this turn 😳 Tell the
                          GM to get on it 😤
                        </span>
                      }
                    }
                    @case (RoundPhase.Event) {
                      @if (vm.roundNumber < vm.numRounds) {
                        <p class="mt-0 mb-1">
                          Gameboard moves for turn
                          <strong>{{ vm.roundNumber + 1 | number }}</strong> of
                          <strong>{{ vm.numRounds }}</strong
                          >.
                        </p>

                        <p class="mt-0">Then, our next event:</p>

                        @if (vm.eventForNextRound; as event) {
                          <joshies-event-info [event]="event" />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      } @else {
                        🏆 Awards Ceremony
                      }
                    }
                    @case (RoundPhase.WaitingForNextRound) {
                      @if (vm.roundNumber < vm.numRounds) {
                        <p class="mt-0 mb-1">
                          Gameboard moves for turn
                          <strong>{{ vm.roundNumber + 1 | number }}</strong> of
                          <strong>{{ vm.numRounds }}</strong
                          >.
                        </p>

                        <p class="mt-0">Then, our next event:</p>

                        @if (vm.eventForNextRound; as event) {
                          <joshies-event-info [event]="event" />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      } @else {
                        Go home
                      }
                    }
                  }
                </joshies-card>

                <!-- Bank Balance -->
                <joshies-card
                  class="mt-5"
                  headerText="Bank Balance"
                  headerIconClass="pi pi-building-columns text-primary mr-2"
                  isDashboardCard
                  padded
                >
                  <span class="font-semibold">
                    {{ vm.bankBalance | number }}
                  </span>
                  point{{ vm.bankBalance > 1 ? 's' : '' }}
                </joshies-card>
              </div>
            }
            <div class="col-6">
              <joshies-card
                headerText="Recent Duels"
                headerIconClass="pi pi-bolt text-primary mr-2"
                isDashboardCard
                padded
              >
                <span>
                  This is placeholder text. Eventually a "slideshow" or "ticker"
                  of recent duels will be shown here.<br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </span>
                point{{ vm.bankBalance > 1 ? 's' : '' }}
              </joshies-card>

              <joshies-card
                class="mt-5"
                headerText="Achievements"
                headerIconClass="pi pi-star text-primary mr-2"
                isDashboardCard
                padded
              >
                <span>
                  This is placeholder text. Eventually a "slideshow" or "ticker"
                  of achievements/superlatives/accolades will be shown here.<br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </span>
                point{{ vm.bankBalance > 1 ? 's' : '' }}
              </joshies-card>
              <joshies-card
                class="mt-5"
                headerText="Active Bets"
                headerIconClass="pi pi-dollar text-primary mr-2"
                isDashboardCard
                padded
              >
                <span>
                  This is placeholder text. Eventually a "slideshow" or "ticker"
                  of active bets will be shown here.<br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </span>
                point{{ vm.bankBalance > 1 ? 's' : '' }}
              </joshies-card>
            </div>
          </div>
        </div>
      }
    } @else {
      <p-skeleton height="2.25rem" styleClass="mb-2" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly authService = inject(AuthService);
  private readonly gameboardService = inject(GameboardService);
  private readonly duelService = inject(DuelService);
  private readonly eventService = inject(EventService);

  private readonly showRankingsTable = computed(
    () => this.gameStateService.sessionStatus() !== SessionStatus.NotStarted,
  );

  private readonly rankingsTableHeader = computed(() =>
    this.gameStateService.sessionIsInProgress()
      ? 'Current Rankings'
      : 'Final Results',
  );

  // TODO - put this in the gameStateService because it's also used on the home page
  readonly specialSpaceEvents = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.SpecialSpaceEvents
          ? this.gameboardService.nonCanceledSpecialSpaceEventsForThisTurn$
          : of(null),
      ),
    ),
  );

  // TODO - put this in the gameStateService because it's also used on the home page
  readonly duels = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.Duels
          ? this.duelService.nonCanceledDuelsForThisTurn$
          : of(null),
      ),
    ),
  );

  // TODO - put this in the gameStateService because it's also used on the home page
  readonly chaosSpaceEvents = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.ChaosSpaceEvents
          ? this.gameboardService.nonCanceledChaosSpaceEventsForThisTurn$
          : of(null),
      ),
    ),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      countdown: this.sessionService.countdown(),
      players: this.playerService.players(),
      sessionIsInProgress: this.gameStateService.sessionIsInProgress(),
      showRankingsTable: this.showRankingsTable(),
      rankingsTableHeader: this.rankingsTableHeader(),
      userId: this.authService.user()?.id,
      bankBalance: this.gameStateService.bankBalance(),
      roundPhase: this.gameStateService.roundPhase(),
      roundNumber: this.gameStateService.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      specialSpaceEvents: this.specialSpaceEvents(),
      duels: this.duels(),
      chaosSpaceEvents: this.chaosSpaceEvents(),
      eventForThisRound: this.eventService.eventForThisRound(),
      eventForNextRound: this.eventService.eventForNextRound(),
    }),
  );

  protected readonly RoundPhase = RoundPhase;
  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
}
