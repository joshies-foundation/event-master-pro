import {
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { CardComponent } from '../../shared/ui/card.component';
import { Button } from 'primeng/button';

@Component({
  selector: 'joshies-randomizer',
  template: `
    <div class="flex w-full flex-row justify-center">
      <joshies-card readOnly padded class="w-4/5">
        <div class="pb-2" style="grid-row-start: 2">
          @for (item of displayItems(); track $index; let i = $index) {
            <div class="p-2" [class.bg-highlight]="i === highlightedIndex">
              {{ item }}
            </div>
          }
        </div>

        <p-button class="p-2" (click)="startSelection()" [disabled]="isRunning">
          {{ isRunning ? 'Selecting...' : 'Start Selection' }}
        </p-button>
      </joshies-card>
    </div>

    @if (selectedItem) {
      <div class="randomizer-overlay">
        <div class="randomizer-overlay-content">
          <h2 class="mb-4 text-2xl font-bold">{{ selectedItem }}</h2>
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
    if (this.selectedItem) {
      this.closeOverlay();
    } else if (!this.isRunning) {
      this.startSelection();
    }
  }

  private cd = inject(ChangeDetectorRef);

  items = input<string[]>([]); // This will be populated by the event options
  displayItems = computed(() => {
    const items = this.items();
    return items && items.length > 0 ? items : ['No items available'];
  });

  highlightedIndex = -1;
  isRunning = false;
  selectedItem: string | null = null;

  startSelection() {
    const items = this.displayItems();
    this.isRunning = true;
    this.highlightedIndex = 0;

    let targetIndex = Math.floor(Math.random() * items.length);
    let cycles = 0;
    const totalCycles =
      (Math.floor(Math.random() * 2) + 3) * items.length + targetIndex; // Loop through the list 3-5 times before landing on the target index
    let interval = 800 / (totalCycles + 1);

    const cycle = () => {
      if (cycles++ >= totalCycles) {
        const rand = Math.random();

        if (rand < 0.2) {
          targetIndex = (targetIndex - 1 + items.length) % items.length;
        } else if (rand < 0.6) {
          targetIndex = (targetIndex + 1) % items.length;
        } else if (rand < 0.7) {
          targetIndex = Math.floor(Math.random() * items.length);
        }
        this.isRunning = false;
        this.highlightedIndex = targetIndex;
        this.selectedItem = items[targetIndex];
        this.cd.detectChanges();
        return;
      }

      this.highlightedIndex = (this.highlightedIndex! + 1) % items.length;
      this.cd.detectChanges();
      interval = 800 / (totalCycles - cycles + 1); // Adjust interval based on remaining cycles
      setTimeout(cycle, interval);
    };

    cycle();
  }

  closeOverlay() {
    this.selectedItem = null;
    this.highlightedIndex = -1;
  }
}
