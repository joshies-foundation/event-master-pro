import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'joshies-prize-machine',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-4 py-8 select-none">
      <!-- Gumball machine illustration -->
      <div
        class="prize-machine relative"
        [class.machine-empty]="poolIsEmpty()"
        [class.machine-shake]="spinning()"
      >
        <!-- Globe (top) -->
        <div class="machine-globe">
          @if (!poolIsEmpty()) {
            <!-- Decorative dots inside the globe to suggest capsules -->
            @for (dot of dots; track $index) {
              <span
                class="globe-dot"
                [style.--x]="dot.x + '%'"
                [style.--y]="dot.y + '%'"
                [style.background]="dot.color"
              ></span>
            }
          } @else {
            <span class="globe-empty-text">EMPTY</span>
          }
        </div>

        <!-- Neck / dispenser -->
        <div class="machine-neck"></div>

        <!-- Base -->
        <div class="machine-base">
          <div class="machine-slot"></div>
          <div class="machine-knob"></div>
        </div>
      </div>

      <!-- Status text -->
      <p class="max-w-xs text-center text-sm text-neutral-600">
        {{ statusText() }}
      </p>

      <!-- Spin button -->
      <p-button
        [label]="spinning() ? 'Spinning...' : 'Spin'"
        icon="pi pi-sync"
        size="large"
        [disabled]="spinButtonDisabled()"
        (onClick)="spin.emit()"
        styleClass="px-8"
      />
    </div>
  `,
  styles: `
    .prize-machine {
      width: 14rem;
      height: 20rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform-origin: bottom center;
      transition: filter 0.3s;
    }
    .machine-empty {
      filter: grayscale(0.7) opacity(0.7);
    }
    .machine-shake {
      animation: machine-shake 0.15s ease-in-out 0s 8;
    }
    @keyframes machine-shake {
      0%,
      100% {
        transform: translateX(0) rotate(0);
      }
      25% {
        transform: translateX(-4px) rotate(-1deg);
      }
      75% {
        transform: translateX(4px) rotate(1deg);
      }
    }

    .machine-globe {
      width: 14rem;
      height: 14rem;
      border-radius: 50%;
      background:
        radial-gradient(
          circle at 30% 30%,
          rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.1) 40%,
          transparent 60%
        ),
        radial-gradient(circle at 50% 50%, #fde68a, #fbbf24);
      border: 4px solid #374151;
      position: relative;
      overflow: hidden;
    }
    .globe-dot {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow:
        inset -2px -2px 4px rgba(0, 0, 0, 0.2),
        1px 1px 2px rgba(0, 0, 0, 0.15);
    }
    .globe-empty-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #9ca3af;
      font-size: 1.25rem;
    }

    .machine-neck {
      width: 7rem;
      height: 1.25rem;
      background: #374151;
      margin-top: -0.5rem;
      z-index: 1;
      border-radius: 0.25rem 0.25rem 0 0;
    }

    .machine-base {
      width: 12rem;
      height: 5rem;
      background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
      border: 4px solid #374151;
      border-radius: 0.5rem;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .machine-slot {
      width: 4rem;
      height: 1rem;
      background: #1f2937;
      border-radius: 0.25rem;
      position: absolute;
      bottom: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
    }
    .machine-knob {
      width: 1.75rem;
      height: 1.75rem;
      background: radial-gradient(circle at 35% 35%, #e5e7eb, #9ca3af 80%);
      border: 2px solid #374151;
      border-radius: 50%;
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }
  `,
})
export class PrizeMachineComponent {
  poolIsEmpty = input.required<boolean>();
  hasToken = input.required<boolean>();
  spinning = input.required<boolean>();

  readonly spin = output<void>();

  protected readonly dots = [
    { x: 30, y: 35, color: '#ef4444' },
    { x: 55, y: 25, color: '#3b82f6' },
    { x: 70, y: 50, color: '#22c55e' },
    { x: 40, y: 60, color: '#a855f7' },
    { x: 25, y: 75, color: '#f59e0b' },
    { x: 60, y: 78, color: '#ec4899' },
  ];

  protected readonly spinButtonDisabled = computed(
    () => this.spinning() || this.poolIsEmpty() || !this.hasToken(),
  );

  protected readonly statusText = computed(() => {
    if (this.spinning()) return 'Pulling your prize...';
    if (this.poolIsEmpty())
      return 'The Prize Pool is empty. Tell the GM to add more!';
    if (!this.hasToken()) return 'Win events to earn Prize Tokens.';
    return 'Tap to spin!';
  });
}
