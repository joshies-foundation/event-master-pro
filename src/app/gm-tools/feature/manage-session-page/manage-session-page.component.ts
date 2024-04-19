import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../../shared/data-access/player.service';
import { NgOptimizedImage } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { SessionService } from '../../../shared/data-access/session.service';
import { showErrorMessage } from '../../../shared/util/error-helpers';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'joshies-manage-session-page',
  standalone: true,
  templateUrl: './manage-session-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    NgOptimizedImage,
    InputSwitchModule,
    FormsModule,
    SkeletonModule,
    ButtonModule,
    PageHeaderComponent,
  ],
})
export class ManageSessionPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);

  readonly players = this.playerService.playersIncludingDisabled;

  onEnableToggleClick(
    playerId: number,
    displayName: string,
    playerIsEnabled: boolean,
  ): void {
    this.playerService.setEnabled(playerId, displayName, !playerIsEnabled);
  }

  async endSession(): Promise<void> {
    const confirmationPassword = 'FUCK';
    const response = prompt(
      `End session? Type ${confirmationPassword} below to end this session.`,
    );

    if (response === confirmationPassword) {
      await this.sessionService.endSession();
    } else if (response !== null) {
      showErrorMessage(
        `You didn't enter ${confirmationPassword}, dummy`,
        this.messageService,
      );
    }
  }
}
