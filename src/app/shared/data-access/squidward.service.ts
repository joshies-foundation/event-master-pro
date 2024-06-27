import { inject, Injectable } from '@angular/core';
import { Sound } from '../util/sound';
import { UserService } from './user.service';
import {
  filter,
  forkJoin,
  fromEvent,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SquidwardService {
  private readonly userService = inject(UserService);

  private readonly touchStartSound = new Sound(
    '/assets/audio/squidward-walk-1.wav',
  );
  private readonly touchEndSound = new Sound(
    '/assets/audio/squidward-walk-2.wav',
  );

  readonly squidwardMode$ = this.userService.user$.pipe(
    map((user) => user?.squidward_mode ?? false),
  );

  readonly squidwardMode = toSignal(this.squidwardMode$, {
    initialValue: false,
  });

  constructor() {
    // load sounds
    this.touchStartSound.load();
    this.touchEndSound.load();

    // play sounds while in Squidward Mode
    this.squidwardMode$
      .pipe(
        filter((squidwardMode) => squidwardMode),
        switchMap(() =>
          forkJoin([
            fromEvent(document, 'touchstart').pipe(
              tap(() => this.touchStartSound.play()),
            ),
            fromEvent(document, 'touchend').pipe(
              tap(() => this.touchEndSound.play()),
            ),
          ]).pipe(
            takeUntil(
              this.squidwardMode$.pipe(
                filter((squidwardMode) => !squidwardMode),
              ),
            ),
          ),
        ),
      )
      .subscribe();
  }
}
