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
    <div class="flex w-full flex-row justify-center">
      <joshies-card readOnly padded class="w-4/5">
        <div class="pb-2" style="grid-row-start: 2">
          @for (item of displayItems(); track $index; let i = $index) {
            <div class="p-2" [class.bg-highlight]="i === highlightedIndex()">
              {{ item }}
            </div>
          }
        </div>

        <p-button
          class="p-2"
          (click)="startSelection()"
          [disabled]="isRunning()"
        >
          {{ isRunning() ? 'Selecting...' : 'Start Selection' }}
        </p-button>
      </joshies-card>
    </div>

    @if (selectedItem()) {
      <div class="randomizer-overlay">
        <div class="randomizer-overlay-content">
          <h2 class="mb-4 text-2xl font-bold">{{ selectedItem() }}</h2>
          <p-button label="Close" (click)="closeOverlay()" />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .randomizer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .randomizer-overlay-content {
        background-color: black;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
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
    const displayItems = this.displayItems();
    this.lockedItems = this.items();
    this.isRunning.set(true);
    this.highlightedIndex.set(0);

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

    let cycles = 0;
    // Loop through the list 3-5 times before landing on the target index
    const totalCycles =
      (Math.floor(Math.random() * 2) + 3) * displayItems.length + targetIndex;
    let interval = 800 / (totalCycles + 1);

    const finalize = () => {
      this.selectedItem.set(displayItems[selectedIndex]);
      this.fanfareSound.play(0.8);
    };

    const cycle = () => {
      if (cycles++ >= totalCycles) {
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
      interval = 800 / (totalCycles - cycles + 1);
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
