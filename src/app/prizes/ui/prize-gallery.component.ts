import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { PrizeModel } from '../../shared/util/supabase-types';
import { trackById } from '../../shared/util/supabase-helpers';

@Component({
  selector: 'joshies-prize-gallery',
  imports: [DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (prizes()?.length) {
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        @for (prize of prizes(); track trackById($index, prize)) {
          <button
            type="button"
            class="aspect-square overflow-hidden rounded-lg p-0"
            (click)="open(prize)"
          >
            <img
              [src]="prize.image_url"
              alt="Prize"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        }
      </div>
    } @else if (emptyMessage()) {
      <p class="py-6 text-center text-sm text-neutral-500">
        {{ emptyMessage() }}
      </p>
    }

    <p-dialog
      [visible]="!!viewing()"
      (visibleChange)="$event || close()"
      [modal]="true"
      [dismissableMask]="true"
      [showHeader]="false"
      [draggable]="false"
      [resizable]="false"
      styleClass="prize-viewer-dialog"
      [contentStyle]="{ padding: '0', background: 'transparent' }"
    >
      @if (viewing(); as prize) {
        <button
          type="button"
          class="block w-full border-0 bg-transparent p-0"
          (click)="close()"
        >
          <img
            [src]="prize.image_url"
            alt="Prize"
            class="block h-auto w-full rounded-lg"
          />
        </button>
      }
    </p-dialog>
  `,
})
export class PrizeGalleryComponent {
  prizes = input.required<PrizeModel[] | undefined>();
  emptyMessage = input<string | undefined>(undefined);

  protected readonly viewing = signal<PrizeModel | null>(null);
  protected readonly trackById = trackById;

  protected open(prize: PrizeModel): void {
    this.viewing.set(prize);
  }

  protected close(): void {
    this.viewing.set(null);
  }
}
