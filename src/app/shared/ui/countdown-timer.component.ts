import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Countdown } from '../data-access/session.service';

@Component({
  selector: 'joshies-countdown-timer',
  imports: [],
  template: `
    <div class="h-full flex flex-col justify-center">
      <h1
        class="grid grid-cols-12 gap-4 grid-nogutter text-center font-semibold mb-0"
        style="font-size: 12vw"
      >
        <span class="col-span-3">{{ countdown().days }}</span>
        <span class="col-span-3">{{ countdown().hours }}</span>
        <span class="col-span-3">{{ countdown().minutes }}</span>
        <span class="col-span-3">{{ countdown().seconds }}</span>
      </h1>
      <p
        class="grid grid-cols-12 gap-4 grid-nogutter text-center text-sm lg:text-2xl mt-0 lg:font-semibold text-primary"
      >
        <span class="col-span-3">Days</span>
        <span class="col-span-3">Hours</span>
        <span class="col-span-3">Minutes</span>
        <span class="col-span-3">Seconds</span>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  readonly countdown = input.required<Countdown>();
}
