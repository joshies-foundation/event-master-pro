import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { GameStateService } from '../../../shared/data-access/game-state.service';
import { HeaderLinkComponent } from '../../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'joshies-finish-round-page',
  standalone: true,
  imports: [PageHeaderComponent, HeaderLinkComponent, SkeletonModule],
  templateUrl: './finish-round-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FinishRoundPageComponent {
  private readonly gameStateService = inject(GameStateService);

  roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;
}
