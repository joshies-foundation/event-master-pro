import { inject, Injectable, Signal } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  showMessageOnError,
  StorageBucket,
  Table,
} from '../util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/data-access/auth.service';
import { MessageService } from 'primeng/api';
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

  readonly allUsers$: Observable<UserModel[] | undefined> =
    realtimeUpdatesFromTable(this.supabase, Table.User).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  readonly allUsersExceptCurrentUser$: Observable<UserModel[] | undefined> =
    this.authService.user$.pipe(
      whenNotUndefined((authUser) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.User,
          `id=neq.${authUser.id}`,
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  async setDisplayName(
    userId: string,
    newDisplayName: string,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.User)
      .update({ display_name: newDisplayName })
      .eq('id', userId);
  }

  async setAvatar(userId: string, image: File): Promise<void> {
    const resizedImage = await resizeImage(image, 200);
    const uploadPath = `${userId}/${Date.now()}.webp`;

    const { data: uploadData, error: uploadError } = await showMessageOnError(
      this.supabase.storage
        .from(StorageBucket.Avatars)
        .upload(uploadPath, resizedImage),
      this.messageService,
    );

    if (uploadError) {
      return;
    }

    const avatarUrl = this.supabase.storage
      .from(StorageBucket.Avatars)
      .getPublicUrl(uploadData.path).data.publicUrl;

    await showMessageOnError(
      this.supabase
        .from(Table.User)
        .update({ avatar_url: avatarUrl })
        .eq('id', userId),
      this.messageService,
    );
  }

  async setCanEditProfile(
    userId: string,
    canEditProfile: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.User)
      .update({ can_edit_profile: canEditProfile })
      .eq('id', userId);
  }

  async setCanPlaceBets(
    userId: string,
    canPlaceBets: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.User)
      .update({ can_place_bets: canPlaceBets })
      .eq('id', userId);
  }

  async setSquidwardMode(
    userId: string,
    squidwardMode: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.User)
      .update({ squidward_mode: squidwardMode })
      .eq('id', userId);
  }

  async setCanToggleSquidwardMode(
    userId: string,
    canToggleSquidwardMode: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.User)
      .update({ can_toggle_squidward_mode: canToggleSquidwardMode })
      .eq('id', userId);
  }
}
