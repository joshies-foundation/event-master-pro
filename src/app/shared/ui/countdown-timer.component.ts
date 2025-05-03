import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Countdown } from '../data-access/session.service';

@Component({
  selector: 'joshies-countdown-timer',
  imports: [],
  template: `
    <div class="h-full flex flex-col justify-center">
      <h1
        class="grid grid-rows-1 grid-cols-4 gap-4 text-center font-semibold"
        style="font-size: 12vw"
      >
        <span>{{ countdown().days }}</span>
        <span>{{ countdown().hours }}</span>
        <span>{{ countdown().minutes }}</span>
        <span>{{ countdown().seconds }}</span>
      </h1>
      <p
        class="grid grid-rows-1 grid-cols-4 gap-4 text-center text-sm lg:text-2xl lg:font-semibold text-primary"
      >
        <span>Days</span>
        <span>Hours</span>
        <span>Minutes</span>
        <span>Seconds</span>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  readonly countdown = input.required<Countdown>();
}
