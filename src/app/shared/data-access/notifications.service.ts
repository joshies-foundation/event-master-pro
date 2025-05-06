import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { map, shareReplay, startWith } from 'rxjs';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from '../util/message-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { FunctionsResponse } from '@supabase/functions-js';
import {
  EdgeFunction,
  showMessageOnError,
  Table,
} from '../util/supabase-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { Database, Json } from '../util/schema';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly messageService = inject(MessageService);
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly swPush = inject(SwPush);

  readonly pushNotificationsAreEnabled$ = this.swPush.subscription.pipe(
    map((subscription) => !!subscription),
    startWith(false),
    shareReplay(1),
  );

  readonly pushNotificationsAreEnabled = toSignal(
    this.pushNotificationsAreEnabled$,
    { requireSync: true },
  );

  async enablePushNotifications(userId: string): Promise<void> {
    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: import.meta.env.NG_APP_VAPID_PUBLIC_KEY,
      });
      await this.saveUserNotificationsSubscription(userId, subscription);
    } catch (err) {
      showErrorMessage(JSON.stringify(err), this.messageService);
    }
  }

  async saveUserNotificationsSubscription(
    userId: string,
    pushSubscription: PushSubscription,
  ): Promise<void> {
    await showMessageOnError(
      this.supabase.from(Table.UserNotificationsSubscription).insert({
        user_id: userId,
        notifications_subscription: pushSubscription as unknown as Json,
      }),
      this.messageService,
    );
  }

  async sendPushNotificationToUsers(payload: {
    recipientUserIds: string[];
    title: string;
    body: string;
    openUrl?: string;
  }): Promise<FunctionsResponse<null>> {
    return this.supabase.functions.invoke(`${EdgeFunction.Push}/gm-message`, {
      body: payload,
    });
  }
}
