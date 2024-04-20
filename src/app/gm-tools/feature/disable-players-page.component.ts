import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../shared/data-access/player.service';
import { NgOptimizedImage } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-disable-players-page',
  standalone: true,
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
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Disable Players" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (players(); as players) {
      <!-- Player Table -->
      <p-table [value]="players" styleClass="mt-4">
        <ng-template pTemplate="header">
          <tr>
            <th>Player</th>
            <th class="text-center">Enabled</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-player>
          <tr>
            <td>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  width="32"
                  height="32"
                  class="border-circle bg-gray-200"
                  alt=""
                />
                {{ player.display_name }}
              </div>
            </td>
            <td class="text-center">
              <p-inputSwitch
                [ngModel]="player.enabled"
                (onChange)="
                  onEnableToggleClick(
                    player.player_id,
                    player.display_name,
                    player.enabled
                  )
                "
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton width="100%" height="30rem" styleClass="mt-4" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
