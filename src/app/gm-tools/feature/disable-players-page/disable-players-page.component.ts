import { HeaderLinkComponent } from '../../../shared/ui/header-link.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../../shared/data-access/player.service';
import { NgOptimizedImage } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-disable-players-page',
  standalone: true,
  templateUrl: './disable-players-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    InputSwitchModule,
    FormsModule,
    SkeletonModule,
    ButtonModule,
    PageHeaderComponent,
    RouterLink,
  ],
})
export default class DisablePlayersPageComponent {
  private readonly playerService = inject(PlayerService);

  readonly players = this.playerService.playersIncludingDisabled;

  onEnableToggleClick(
    playerId: number,
    displayName: string,
    playerIsEnabled: boolean,
  ): void {
    this.playerService.setEnabled(playerId, displayName, !playerIsEnabled);
  }
}
