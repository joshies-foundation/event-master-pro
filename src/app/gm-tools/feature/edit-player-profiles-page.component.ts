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
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-edit-player-profiles-page',
  imports: [
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    InputSwitchModule,
    SkeletonModule,
    ButtonModule,
    PageHeaderComponent,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Edit Profiles" alwaysSmall>
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
        [rowTrackBy]="trackByPlayerId"
        styleClass="mt-6"
      >
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="players"
          let-player
        >
          <tr>
            <td>
              <div class="flex items-center gap-2 -py-2">
                @if (updatingAvatarForUserId() === player.user_id) {
                  <p-skeleton
                    width="2rem"
                    height="2rem"
                    styleClass="rounded-full"
                  />
                } @else {
                  <img
                    [ngSrc]="player.avatar_url"
                    width="32"
                    height="32"
                    class="size-8 rounded-full bg-neutral-100"
                    alt=""
                  />
                }
                <div>
                  <p>{{ player.display_name }}</p>
                  <p class="m-0 text-neutral-500 text-xs">
                    {{ player.real_name }}
                  </p>
                </div>
              </div>
            </td>
            <td class="text-right flex gap-2 flex-col md:flex-row justify-end">
              <p-button
                label="Change Avatar"
                icon="pi pi-camera"
                styleClass="w-full"
                [loading]="updatingAvatarForUserId() === player.user_id"
                [disabled]="updatingAvatarForUserId()"
                (onClick)="avatarFileInput.click()"
              />
              <p-button
                label="Change Name"
                icon="pi pi-pencil"
                styleClass="w-full"
                [disabled]="updatingAvatarForUserId()"
                (onClick)="
                  promptChangeDisplayName(player.user_id, player.display_name)
                "
              />

              <!-- Hidden File Input -->
              <input
                #avatarFileInput
                hidden
                type="file"
                accept="image/*"
                (change)="onAvatarImageSelect(player.user_id, $event)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton width="100%" height="30rem" styleClass="mt-6" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditPlayerProfilesPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly userService = inject(UserService);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly players = this.playerService.playersIncludingDisabled;

  readonly updatingAvatarForUserId = signal<string | null>(null);

  async onAvatarImageSelect(userId: string, event: Event): Promise<void> {
    this.updatingAvatarForUserId.set(userId);

    await this.userService.setAvatar(
      userId,
      (event.target as HTMLInputElement).files![0],
    );

    this.updatingAvatarForUserId.set(null);
  }

  promptChangeDisplayName(userId: string, currentDisplayName: string): void {
    const newDisplayName = prompt('Change display name', currentDisplayName);

    if (!newDisplayName || newDisplayName === currentDisplayName) return;

    if (newDisplayName.length > 16) {
      alert(
        `Oh really, your name is ${newDisplayName.length} characters long? Try again, you pathetic clown.`,
      );
      return;
    }

    void this.userService.setDisplayName(userId, newDisplayName);
  }
}
