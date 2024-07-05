import { supabaseAdmin } from './supabase-admin.ts';
import { sendNotification } from './web-push.ts';

const userNotificationsSubscriptionTable = 'user_notifications_subscription';
const playerTable = 'player';
const notificationsSubscriptionColumn = 'notifications_subscription';
const userIdColumn = 'user_id';
const idColumn = 'id';

export async function sendPushNotificationToUsers(
  recipientUserIds: string[],
  title: string,
  body: string,
  openUrl?: string,
): Promise<void> {
  // get recipient notification subscriptions from database
  console.log(
    `Grabbing ${notificationsSubscriptionColumn} from table ${userNotificationsSubscriptionTable} where ${userIdColumn} in ${recipientUserIds}`,
  );

  const { data } = await supabaseAdmin
    .from(userNotificationsSubscriptionTable)
    .select(notificationsSubscriptionColumn)
    .in(userIdColumn, recipientUserIds);

  if (!data?.length) {
    throw new Error(
      `No notifications subscriptions found for user IDs ${recipientUserIds}`,
    );
  }

  const subscriptions = data.map((row) => row[notificationsSubscriptionColumn]);

  console.log(`Found ${subscriptions.length} subscriptions.`);

  // build notification payload
  const notification = {
    // structure comes from:
    // https://angular.dev/api/service-worker/SwPush?tab=usage-notes
    // https://developer.mozilla.org/en-US/docs/Web/API/Notification#instance_properties
    // https://angular.dev/ecosystem/service-workers/push-notifications#actions
    notification: {
      title,
      body,
      ...(openUrl
        ? {
            data: {
              onActionClick: {
                default: {
                  operation: 'navigateLastFocusedOrOpen',
                  url: openUrl,
                },
              },
            },
          }
        : {}),
    },
  };

  console.log('Sending notification:', notification);

  // send notification to each subscription
  await Promise.all(
    subscriptions.map((subscription) => {
      console.log('To subscription:', subscription);
      return sendNotification(subscription, notification);
    }),
  );
}

export async function sendPushNotificationToPlayers(
  recipientPlayerIds: string[],
  title: string,
  body: string,
  openUrl?: string,
): Promise<void> {
  // get user IDs from database
  console.log(
    `Grabbing ${userIdColumn} from table ${playerTable} where ${idColumn} in ${recipientPlayerIds}`,
  );

  const { data } = await supabaseAdmin
    .from(playerTable)
    .select(userIdColumn)
    .in(idColumn, recipientPlayerIds);

  if (!data?.length) {
    throw new Error(`No players found with IDs ${recipientPlayerIds}`);
  }

  const recipientUserIds = data.map((record) => record.user_id as string);

  await sendPushNotificationToUsers(recipientUserIds, title, body, openUrl);
}
