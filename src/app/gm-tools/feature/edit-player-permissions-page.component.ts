import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../shared/data-access/player.service';
import { NgOptimizedImage } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { UserService } from '../../shared/data-access/user.service';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import {
  showMessageOnError,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { MessageService } from 'primeng/api';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-edit-player-permissions-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    InputSwitchModule,
    SkeletonModule,
    ButtonModule,
    PageHeaderComponent,
    FormsModule,
    CheckboxModule,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Edit Permissions" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (players(); as players) {
      <!-- Player Table -->
      <p-table
        [value]="players"
        styleClass="mt-4"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            <th class="text-center">Enabled</th>
            <th class="text-center">Edit Profile</th>
            <th class="text-center">Place Bets</th>
            <th class="text-center">Squidward Mode</th>
            <th class="text-center">Can Toggle Squidward Mode</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="players"
          let-player
        >
          <tr>
            <td pFrozenColumn>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                  alt=""
                />
                <div>
                  <p class="m-0">{{ player.display_name }}</p>
                  <p class="m-0 text-500 text-xs">{{ player.real_name }}</p>
                </div>
              </div>
            </td>
            <td class="text-center">
              <p-checkbox
                [ngModel]="player.enabled"
                (ngModelChange)="setEnabled(player.player_id, $event)"
                [binary]="true"
                inputId="binary"
              />
            </td>
            <td class="text-center">
              <p-checkbox
                [ngModel]="player.can_edit_profile"
                (ngModelChange)="setCanEditProfile(player.user_id, $event)"
                [binary]="true"
                inputId="binary"
              />
            </td>
            <td class="text-center">
              <p-checkbox
                [ngModel]="player.can_place_bets"
                (ngModelChange)="setCanPlaceBets(player.user_id, $event)"
                [binary]="true"
                inputId="binary"
              />
            </td>
            <td class="text-center">
              <p-checkbox
                [ngModel]="player.squidward_mode"
                (ngModelChange)="setSquidwardMode(player.user_id, $event)"
                [binary]="true"
                inputId="binary"
              />
            </td>
            <td class="text-center">
              <p-checkbox
                [ngModel]="player.can_toggle_squidward_mode"
                (ngModelChange)="
                  setCanToggleSquidwardMode(player.user_id, $event)
                "
                [binary]="true"
                inputId="binary"
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
export default class EditPlayerPermissionsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly players = this.playerService.playersIncludingDisabled;

  readonly updatingAvatarForUserId = signal<string | null>(null);

  setEnabled(playerId: number, enabled: boolean): void {
    showMessageOnError(
      this.playerService.setEnabled(playerId, enabled),
      this.messageService,
    );
  }

  setCanEditProfile(userId: string, canEditProfile: boolean): void {
    showMessageOnError(
      this.userService.setCanEditProfile(userId, canEditProfile),
      this.messageService,
    );
  }

  setCanPlaceBets(userId: string, canPlaceBets: boolean): void {
    showMessageOnError(
      this.userService.setCanPlaceBets(userId, canPlaceBets),
      this.messageService,
    );
  }

  setSquidwardMode(userId: string, squidwardMode: boolean): void {
    showMessageOnError(
      this.userService.setSquidwardMode(userId, squidwardMode),
      this.messageService,
    );
  }

  setCanToggleSquidwardMode(
    userId: string,
    canToggleSquidwardMode: boolean,
  ): void {
    showMessageOnError(
      this.userService.setCanToggleSquidwardMode(
        userId,
        canToggleSquidwardMode,
      ),
      this.messageService,
    );
  }
}
