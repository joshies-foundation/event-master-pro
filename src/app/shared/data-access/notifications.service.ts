import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { map, Observable, shareReplay, startWith } from 'rxjs';
import { environment } from 'environment';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from '../util/message-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { showMessageOnError, Table } from '../util/supabase-helpers';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Database, Json } from '../util/schema';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly messageService = inject(MessageService);
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);

  readonly pushNotificationsAreEnabled$ = this.swPush.subscription.pipe(
    map((subscription) => !!subscription),
    startWith(false),
    shareReplay(1),
  );

  readonly pushNotificationsAreEnabled = toSignal(
    this.pushNotificationsAreEnabled$,
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

  sendNotification(notification: {
    recipient: string;
    title: string;
    body: string;
  }): Observable<void> {
    return this.http.post<undefined>('/api/notification', { notification });
  }
}
