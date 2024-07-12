import { supabaseAdmin } from './supabase-admin.ts';
import { sendNotification, Subscription } from './web-push.ts';

// tables
const userNotificationsSubscriptionTable = 'user_notifications_subscription';
const playerTable = 'player';
const userTable = 'user';

// columns
const notificationsSubscriptionColumn = 'notifications_subscription';
const userIdColumn = 'user_id';
const idColumn = 'id';
const displayNameColumn = 'display_name';

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

  await sendPushNotificationToSubscriptions(
    subscriptions,
    title,
    body,
    openUrl,
  );
}

export async function sendPushNotificationToPlayers(
  recipientPlayerIds: number[],
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

export async function getUserDisplayName(userId: string): Promise<string> {
  console.log(
    `Getting ${displayNameColumn} for ${userTable} with ${userIdColumn} ${userId}`,
  );

  const { data } = await supabaseAdmin
    .from(userTable)
    .select(displayNameColumn)
    .eq(idColumn, userId);

  const displayName: string | undefined = data?.[0]?.display_name;

  if (displayName === undefined) {
    throw new Error(
      `Cannot find ${displayNameColumn} for ${userTable} with ${idColumn} ${userId}`,
    );
  }

  return displayName;
}

export async function getPlayerDisplayName(playerId: number): Promise<string> {
  console.log(
    `Getting ${userIdColumn} for ${playerTable} with ${idColumn} ${playerId}`,
  );

  const { data } = await supabaseAdmin
    .from(playerTable)
    .select(userIdColumn)
    .eq(idColumn, playerId);

  const userId: string | undefined = data?.[0]?.user_id;

  if (userId === undefined) {
    throw new Error(
      `Cannot find ${userIdColumn} for ${playerTable} with ${idColumn} ${userId}`,
    );
  }

  return getUserDisplayName(userId);
}

export async function sendPushNotificationToAllUsers(
  title: string,
  body: string,
  openUrl?: string,
): Promise<void> {
  // get recipient notification subscriptions from database
  console.log(
    `Grabbing all ${notificationsSubscriptionColumn} from table ${userNotificationsSubscriptionTable}`,
  );

  const { data } = await supabaseAdmin
    .from(userNotificationsSubscriptionTable)
    .select(notificationsSubscriptionColumn);

  if (!data?.length) {
    throw new Error(`No notifications subscriptions found`);
  }

  const subscriptions = data.map((row) => row[notificationsSubscriptionColumn]);

  console.log(`Found ${subscriptions.length} subscriptions.`);

  await sendPushNotificationToSubscriptions(
    subscriptions,
    title,
    body,
    openUrl,
  );
}

export async function sendPushNotificationToSubscriptions(
  subscriptions: Subscription[],
  title: string,
  body: string,
  openUrl?: string,
): Promise<void> {
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
