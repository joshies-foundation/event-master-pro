import { inject, Injectable, Signal } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  showMessageOnError,
  StorageBucket,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/data-access/auth.service';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from '../util/message-helpers';
import { resizeImage } from '../util/image-helpers';
import { map, Observable, shareReplay } from 'rxjs';
import { whenNotUndefined } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { Database } from '../util/schema';
import { UserModel } from '../util/supabase-types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly user$: Observable<UserModel | undefined> =
    this.authService.user$.pipe(
      whenNotUndefined((authUser) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.User,
          `id=eq.${authUser.id}`,
        ).pipe(map((userRecords) => userRecords[0])),
      ),
      shareReplay(1),
    );

  readonly user: Signal<UserModel | undefined> = toSignal(this.user$);

  // temporary - for test notifications page
  readonly allUsers$: Observable<UserModel[] | undefined> =
    realtimeUpdatesFromTable(this.supabase, Table.User);
  readonly allUsers: Signal<UserModel[] | undefined> = toSignal(this.allUsers$);

  async updateDisplayName(
    userId: string,
    newDisplayName: string,
  ): Promise<void> {
    await showMessageOnError(
      this.supabase
        .from(Table.User)
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
      .from(StorageBucket.Avatars)
      .upload(uploadPath, resizedImage);

    if (uploadError) {
      showErrorMessage(uploadError.message, this.messageService);
      return;
    }

    const avatarUrl = this.supabase.storage
      .from(StorageBucket.Avatars)
      .getPublicUrl(uploadData?.path).data.publicUrl;

    const { error: updateError } = await this.supabase
      .from(Table.User)
      .update({ avatar_url: avatarUrl })
      .eq('id', this.user()?.id ?? '');

    if (updateError) {
      showErrorMessage(updateError.message, this.messageService);
    }
  }
}
