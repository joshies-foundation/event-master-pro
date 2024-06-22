import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Countdown,
  SessionService,
} from '../../shared/data-access/session.service';
import { CountdownTimerComponent } from '../../shared/ui/countdown-timer.component';
import { map, takeWhile, timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-dashboard-page',
  standalone: true,
  imports: [CountdownTimerComponent],
  template: ` @if (countdown(); as cd) {
    <joshies-countdown-timer [countdown]="cd"></joshies-countdown-timer>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPageComponent {
  private readonly sessionService = inject(SessionService);

  // readonly countdown = this.sessionService.countdown;

  // timer testing
  private readonly startDate = '2024-06-30 20:00:00';
  private readonly countdown$ = timer(0, 1000).pipe(
    map(() => (new Date(this.startDate).getTime() - Date.now()) / 1000),
    takeWhile((secondsRemaining) => secondsRemaining >= 0),
    map(
      (secondsRemaining): Countdown => ({
        days: Math.floor(secondsRemaining / (3600 * 24)),
        hours: Math.floor((secondsRemaining % (3600 * 24)) / 3600),
        minutes: Math.floor((secondsRemaining % 3600) / 60),
        seconds: Math.floor(secondsRemaining % 60),
      }),
    ),
  );

  readonly countdown = toSignal(this.countdown$);
}
