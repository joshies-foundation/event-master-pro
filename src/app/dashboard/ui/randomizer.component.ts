import {
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { CardComponent } from '../../shared/ui/card.component';
import { Button } from 'primeng/button';
import { Sound } from '../../shared/util/sound';

@Component({
  selector: 'joshies-randomizer',
  template: `
    <div class="flex w-full justify-center">
      <joshies-card
        readOnly
        padded
        class="w-4/5"
        styleClass="flex flex-col gap-4"
      >
        @for (item of displayItems(); track $index; let i = $index) {
          <div [class.bg-highlight]="i === highlightedIndex()">
            {{ item }}
          </div>
        }

        <p-button (onClick)="startSelection()" [disabled]="isRunning()">
          {{ isRunning() ? 'Selecting...' : 'Start Selection' }}
        </p-button>
      </joshies-card>
    </div>

    <!-- Overlay after selecting -->
    @if (selectedItem()) {
      <div
        class="fixed top-0 left-0 flex size-full items-center justify-center bg-black/50"
      >
        <div class="rounded-lg bg-black p-5 text-center shadow-md">
          <h2 class="mb-4 text-2xl font-bold">{{ selectedItem() }}</h2>
          <p-button label="Close" (onClick)="closeOverlay()" />
        </div>
      </div>
    }
  `,
  imports: [CardComponent, Button],
})
export default class RandomizerComponent {
  @HostListener('document:keyup.space', ['$event'])
  onSpaceKeyUp() {
    if (this.selectedItem()) {
      this.closeOverlay();
    } else if (!this.isRunning()) {
      this.startSelection();
    }
  }

  private readonly cd = inject(ChangeDetectorRef);
  private readonly squidSound = new Sound('/audio/squidward-walk-1.wav');

  //Tada Fanfare F by plasterbrain -- https://freesound.org/s/397354/ -- License: Creative Commons 0
  private readonly fanfareSound = new Sound('/audio/tada-fanfare-f.wav');

  readonly items = input<string[]>([]);
  lockedItems: string[] = [];
  displayItems = computed(() => {
    const items = this.items();
    const isRunning = this.isRunning();

    const itemsToDisplay = isRunning ? this.lockedItems : items;

    return itemsToDisplay && itemsToDisplay.length > 0
      ? itemsToDisplay
      : ['No items available'];
  });

  readonly highlightedIndex = signal<number>(-1);
  readonly isRunning = signal<boolean>(false);
  readonly selectedItem = signal<string | null>(null);

  startSelection() {
    const BASE_CYCLE_TIME = 900;
    const MIN_CYCLE_TIME = 50;

    const displayItems = this.displayItems();
    this.lockedItems = this.items();
    this.isRunning.set(true);
    this.highlightedIndex.set(0);

    // Randomly select an item
    // Then, randomly decide whether to "fake" selecting a different item
    const selectedIndex = Math.floor(Math.random() * displayItems.length);
    let targetIndex = selectedIndex;
    const fudgeFactor = Math.random();
    if (fudgeFactor < 0.2) {
      targetIndex =
        (targetIndex - 1 + displayItems.length) % displayItems.length;
    } else if (fudgeFactor < 0.6) {
      targetIndex = (targetIndex + 1) % displayItems.length;
    } else if (fudgeFactor < 0.7) {
      targetIndex = Math.floor(Math.random() * displayItems.length);
    }

    let cyclesSoFar = 0;
    // Loop through the list 3-5 times before landing on the target index
    const totalCycles =
      (Math.floor(Math.random() * 2) + 3) * displayItems.length + targetIndex;

    const delayMs = (totalCycles: number, cyclesSoFar: number) => {
      return Math.max(
        BASE_CYCLE_TIME / (totalCycles - cyclesSoFar + 1),
        MIN_CYCLE_TIME,
      );
    };

    let interval = delayMs(totalCycles, 0);

    const finalize = () => {
      this.selectedItem.set(displayItems[selectedIndex]);
      this.fanfareSound.play(0.8);
    };

    const cycle = () => {
      if (cyclesSoFar++ >= totalCycles) {
        if (targetIndex !== selectedIndex) {
          this.squidSound.play();
          this.highlightedIndex.set(selectedIndex);
        }

        setTimeout(finalize, 200);
        return;
      }

      this.highlightedIndex.set(
        (this.highlightedIndex()! + 1) % displayItems.length,
      );
      this.squidSound.play();
      interval = delayMs(totalCycles, cyclesSoFar);
      setTimeout(cycle, interval);
    };

    cycle();
  }

  closeOverlay() {
    this.isRunning.set(false);
    this.selectedItem.set(null);
    this.highlightedIndex.set(-1);
  }

  constructor() {
    this.squidSound.load();
    this.fanfareSound.load();
  }
}
