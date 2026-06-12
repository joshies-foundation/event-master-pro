import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PrizeService } from '../../shared/data-access/prize.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { PrizeMachineComponent } from '../ui/prize-machine.component';
import { PrizeGalleryComponent } from '../ui/prize-gallery.component';
import { PrizeRevealComponent } from '../ui/prize-reveal.component';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { MessageService } from 'primeng/api';
import { PrizeModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-prizes-page',
  imports: [
    PageHeaderComponent,
    PrizeMachineComponent,
    PrizeGalleryComponent,
    PrizeRevealComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <joshies-page-header headerText="Prizes" />

    <joshies-prize-machine
      [poolIsEmpty]="prizeService.poolIsEmpty()"
      [hasToken]="prizeService.userPrizeTokens() > 0"
      [spinning]="spinning()"
      (spin)="onSpin()"
    />

    <h2 class="px-4 pt-4 pb-2 text-sm font-semibold text-neutral-700">
      Your Prizes
    </h2>
    <div class="px-4 pb-12">
      <joshies-prize-gallery
        [prizes]="prizeService.userPrizes()"
        emptyMessage="Your prizes will appear here once you win them."
      />
    </div>

    <joshies-prize-reveal
      [open]="!!revealing()"
      [prize]="revealing()"
      (closed)="closeReveal()"
    />
  `,
  host: {
    class: 'block pb-12',
  },
})
export default class PrizesPageComponent {
  protected readonly prizeService = inject(PrizeService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);

  protected readonly spinning = signal(false);
  protected readonly revealing = signal<PrizeModel | null>(null);

  protected async onSpin(): Promise<void> {
    const playerId = this.playerService.userPlayerId();
    if (!playerId || this.spinning()) return;

    this.spinning.set(true);

    const response = await showMessageOnError(
      this.prizeService.spinMachine(playerId),
      this.messageService,
    );

    this.spinning.set(false);

    if (response.error || !response.data) {
      return;
    }

    this.revealing.set(response.data);
  }

  protected closeReveal(): void {
    this.revealing.set(null);
  }
}
