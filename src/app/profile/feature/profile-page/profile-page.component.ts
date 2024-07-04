import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/data-access/auth.service';
import { UserService } from '../../../shared/data-access/user.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { DatePipe } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { NotificationsService } from '../../../shared/data-access/notifications.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { UserModel } from '../../../shared/util/supabase-types';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SquidwardService } from '../../../shared/data-access/squidward.service';

@Component({
  selector: 'joshies-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    DatePipe,
    SkeletonModule,
    PageHeaderComponent,
    InputSwitchModule,
    FormsModule,
  ],
})
export default class ProfilePageComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly squidwardService = inject(SquidwardService);

  private readonly updatedAvatarLoading = signal(false);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      user: this.userService.user(),
      loginUsername: this.authService.loginUsername(),
      pushNotificationsAreEnabled:
        this.notificationsService.pushNotificationsAreEnabled(),
      updatedAvatarLoading: this.updatedAvatarLoading(),
      squidwardMode: this.squidwardService.squidwardMode(),
    }),
  );

  reloadApp(): void {
    location.reload();
  }

  async onAvatarImageSelect(userId: string, event: Event): Promise<void> {
    this.updatedAvatarLoading.set(true);

    await this.userService.setAvatar(
      userId,
      (event.target as HTMLInputElement).files![0],
    );

    // delay removing loading skeleton to give app enough time to pull new image url from database
    setTimeout(() => this.updatedAvatarLoading.set(false), 150);
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

  setSquidwardMode(userId: UserModel['id'], squidwardMode: boolean) {
    this.userService.setSquidwardMode(userId, squidwardMode);
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
