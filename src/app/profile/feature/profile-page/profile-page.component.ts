import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/data-access/auth.service';
import { UserService } from '../../../shared/data-access/user.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { DatePipe, JsonPipe } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { NotificationsService } from '../../../shared/data-access/notifications.service';

@Component({
  selector: 'joshies-profile-page',
  standalone: true,
  imports: [ButtonModule, DatePipe, SkeletonModule, JsonPipe],
  templateUrl: './profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfilePageComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly notificationsService = inject(NotificationsService);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      user: this.userService.user(),
      loginUsername: this.authService.loginUsername(),
      pushNotificationsSubscription:
        this.notificationsService.pushNotificationsSubscription(),
      pushNotificationsAreEnabled:
        this.notificationsService.pushNotificationsAreEnabled(),
    }),
  );

  reloadApp(): void {
    location.reload();
  }

  onAvatarImageSelect(event: Event): void {
    void this.userService.setAvatar(
      (event.target as HTMLInputElement).files![0],
    );
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

    void this.userService.updateDisplayName(userId, newDisplayName);
  }

  async enablePushNotifications(userId: string): Promise<void> {
    await this.notificationsService.enablePushNotifications(userId);
  }

  confirmSignOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.signOut();
    }
  }
}
