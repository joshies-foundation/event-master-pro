import { computed, inject, Injectable } from '@angular/core';
import {
  realtimeUpdatesFromTableAsSignal,
  showMessageOnError,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/data-access/auth.service';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from '../util/error-helpers';
import { resizeImage } from '../util/image-helpers';

export interface User {
  id: string;
  display_name: string;
  avatar_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly UserTable = 'user';
  private static readonly AvatarsBucket = 'avatars';

  private readonly supabase = inject(SupabaseClient);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly allUsers = realtimeUpdatesFromTableAsSignal<User>(
    UserService.UserTable,
    this.supabase,
  );

  readonly user = computed(() =>
    this.allUsers().find((user) => user.id === this.authService.user()?.id),
  );

  async updateDisplayName(
    userId: string,
    newDisplayName: string,
  ): Promise<void> {
    await showMessageOnError(
      this.supabase
        .from(UserService.UserTable)
        .update({ display_name: newDisplayName })
        .eq('id', userId),
      this.messageService,
      'Cannot update display name',
    );
  }

  async setAvatar(file: File): Promise<void> {
    const resizedImage = await resizeImage(file, 200);
    const uploadPath = `${this.authService.loginUsername()}/${Date.now()}.webp`;

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(UserService.AvatarsBucket)
      .upload(uploadPath, resizedImage);

    if (uploadError) {
      showErrorMessage(uploadError.message, this.messageService);
      return;
    }

    const avatarUrl = this.supabase.storage
      .from(UserService.AvatarsBucket)
      .getPublicUrl(uploadData?.path).data.publicUrl;

    const { data: updateData, error: updateError } = await this.supabase
      .from(UserService.UserTable)
      .update({ avatar_url: avatarUrl })
      .eq('id', this.user()?.id);

    if (updateError) {
      showErrorMessage(updateError.message, this.messageService);
    }
  }
}
