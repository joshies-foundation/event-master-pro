import { Injectable, inject, computed } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { map } from 'rxjs';
import { environment } from 'environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from '../util/error-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { FunctionsResponse } from '@supabase/functions-js';
import { showMessageOnError, Table } from '../util/supabase-helpers';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly messageService = inject(MessageService);
  private readonly supabase = inject(SupabaseClient);
  private readonly swPush = inject(SwPush);

  readonly pushNotificationsSubscription = toSignal(this.swPush.subscription, {
    initialValue: null,
  });

  readonly pushNotificationsAreEnabled = computed(
    () => !!this.pushNotificationsSubscription(),
  );

  constructor() {
    this.swPush.messages
      .pipe(
        map((notification) => notification as { notification: Notification }),
      )
      .subscribe((message) =>
        this.messageService.add({
          severity: 'info',
          summary: message.notification.title,
          detail: message.notification.body,
        }),
      );
  }

  async enablePushNotifications(userId: string): Promise<void> {
    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey,
      });
      await this.saveUserNotificationsSubscription(userId, subscription);
    } catch (err) {
      showErrorMessage(JSON.stringify(err), this.messageService);
    }
  }

  async saveUserNotificationsSubscription(
    userId: string,
    notificationsSubscriptions: object,
  ): Promise<void> {
    await showMessageOnError(
      this.supabase.from(Table.UserNotificationsSubscription).insert({
        user_id: userId,
        notifications_subscription: notificationsSubscriptions,
      }),
      this.messageService,
    );
  }

  async sendNotification(notification: {
    recipient: string;
    title: string;
    body: string;
  }): Promise<FunctionsResponse<null>> {
    return this.supabase.functions.invoke('push', { body: notification });
  }
}
