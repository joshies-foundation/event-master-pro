import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PrizeModel } from '../../shared/util/supabase-types';

type RevealPhase = 'idle' | 'drop' | 'crack' | 'reveal';

@Component({
  selector: 'joshies-prize-reveal',
  imports: [DialogModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('capsuleDrop', [
      transition(':enter', [
        animate(
          '900ms cubic-bezier(0.4, 0, 0.7, 1)',
          keyframes([
            style({ transform: 'translateY(-180px) rotate(0deg)', offset: 0 }),
            style({
              transform: 'translateY(40px) rotate(180deg)',
              offset: 0.7,
            }),
            style({
              transform: 'translateY(20px) rotate(180deg)',
              offset: 0.85,
            }),
            style({ transform: 'translateY(40px) rotate(180deg)', offset: 1 }),
          ]),
        ),
      ]),
    ]),
    trigger('capsuleCrack', [
      transition(':enter', [
        style({ opacity: 1 }),
        animate(
          '600ms ease-out',
          keyframes([
            style({ transform: 'scale(1) rotate(0)', opacity: 1, offset: 0 }),
            style({
              transform: 'scale(1.4) rotate(20deg)',
              opacity: 0.8,
              offset: 0.6,
            }),
            style({
              transform: 'scale(1.8) rotate(-20deg)',
              opacity: 0,
              offset: 1,
            }),
          ]),
        ),
      ]),
    ]),
    trigger('imageReveal', [
      transition(':enter', [
        animate(
          '700ms cubic-bezier(0.2, 1.5, 0.4, 1)',
          keyframes([
            style({ transform: 'scale(0.2)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1.15)', opacity: 1, offset: 0.6 }),
            style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
  template: `
    <p-dialog
      [visible]="open()"
      [modal]="true"
      [closable]="false"
      [dismissableMask]="phase() === 'reveal'"
      [showHeader]="false"
      [draggable]="false"
      [resizable]="false"
      (visibleChange)="$event || dismiss()"
      [contentStyle]="{
        padding: '0',
        background: 'transparent',
        overflow: 'visible',
      }"
    >
      <div class="reveal-stage">
        <!-- Sparkles -->
        @if (phase() === 'reveal') {
          @for (s of sparkles; track $index) {
            <span
              class="sparkle"
              [style.--x]="s.x + '%'"
              [style.--y]="s.y + '%'"
              [style.--delay]="s.delay + 'ms'"
            ></span>
          }
        }

        <!-- Capsule (dropping) -->
        @if (phase() === 'drop') {
          <div class="capsule" @capsuleDrop>
            <div class="capsule-top"></div>
            <div class="capsule-bottom"></div>
          </div>
        }

        <!-- Capsule (cracking open) -->
        @if (phase() === 'crack') {
          <div class="capsule capsule-cracking" @capsuleCrack>
            <div class="capsule-top"></div>
            <div class="capsule-bottom"></div>
          </div>
        }

        <!-- Prize image -->
        @if (phase() === 'reveal' && prize(); as prize) {
          <img
            [src]="prize.image_url"
            alt="Your prize"
            class="prize-image"
            @imageReveal
          />
        }
      </div>

      @if (phase() === 'reveal') {
        <div class="flex justify-center pt-2 pb-4">
          <p-button
            label="Hell yeah"
            icon="pi pi-check"
            (onClick)="dismiss()"
          />
        </div>
      }
    </p-dialog>
  `,
  styles: `
    .reveal-stage {
      position: relative;
      width: min(80vw, 24rem);
      height: min(80vw, 24rem);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .capsule {
      width: 6rem;
      height: 6rem;
      position: relative;
      transform-origin: center;
    }
    .capsule-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: radial-gradient(circle at 30% 30%, #fcd34d, #f59e0b);
      border-top-left-radius: 50% 100%;
      border-top-right-radius: 50% 100%;
      border: 2px solid #92400e;
      border-bottom: none;
    }
    .capsule-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: radial-gradient(circle at 30% 70%, #93c5fd, #2563eb);
      border-bottom-left-radius: 50% 100%;
      border-bottom-right-radius: 50% 100%;
      border: 2px solid #1e3a8a;
      border-top: none;
    }

    .prize-image {
      width: calc(100% - 1rem);
      height: calc(100% - 1rem);
      object-fit: contain;
      border-radius: 0.5rem;
      box-shadow: 0 0 80px 10px rgba(251, 191, 36, 0.6);
    }

    .sparkle {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: 0.5rem;
      height: 0.5rem;
      background: radial-gradient(
        circle,
        #fff 0%,
        #fde68a 50%,
        transparent 70%
      );
      border-radius: 50%;
      animation: sparkle 1.2s ease-out var(--delay) forwards;
      opacity: 0;
      pointer-events: none;
    }
    @keyframes sparkle {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      30% {
        transform: scale(1.5);
        opacity: 1;
      }
      100% {
        transform: scale(0);
        opacity: 0;
      }
    }
  `,
})
export class PrizeRevealComponent {
  open = input.required<boolean>();
  prize = input.required<PrizeModel | null>();

  readonly closed = output<void>();

  protected readonly phase = signal<RevealPhase>('idle');

  protected readonly sparkles = Array.from({ length: 12 }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: i * 60,
  }));

  constructor() {
    effect(() => {
      if (this.open() && this.prize()) {
        this.runSequence();
      } else if (!this.open()) {
        this.phase.set('idle');
      }
    });
  }

  protected dismiss(): void {
    this.closed.emit();
  }

  private runSequence(): void {
    this.phase.set('drop');
    setTimeout(() => this.phase.set('crack'), 900);
    setTimeout(() => this.phase.set('reveal'), 1500);
  }
}
