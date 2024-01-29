import { createClient } from '@supabase/supabase-js';
import * as webpush from 'web-push';
import { Table } from '../../src/app/shared/util/supabase-helpers';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  VAPID_SUBJECT: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
}

interface Payload {
  notification: {
    recipient: string;
    title: string;
    body: string;
    icon: string;
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const supabase = createClient(
    context.env.SUPABASE_URL,
    context.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  webpush.setVapidDetails(
    context.env.VAPID_SUBJECT,
    context.env.VAPID_PUBLIC_KEY,
    context.env.VAPID_PRIVATE_KEY,
  );

  const payload = (await context.request.json()) as Payload;

  console.log('Received Notification Payload:', payload);

  const { recipient, title, body, icon } = payload.notification;

  const dbTable = Table.UserNotificationsSubscription;
  const dbColumn = 'notifications_subscription';
  const whereColumn = 'user_id';

  console.log(
    'Grabbing',
    dbColumn,
    'from table',
    dbTable,
    'where',
    whereColumn,
    '=',
    recipient,
  );

  const { data } = await supabase
    .from(dbTable)
    .select(dbColumn)
    .eq(whereColumn, recipient);

  console.log('Data:', data);

  const subscriptions = data.map((record) => record.notifications_subscription);

  const notification = {
    notification: { title, body, icon },
  };

  console.log('Sending notification:', notification);

  const results = await Promise.all(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, JSON.stringify(notification)),
    ),
  );

  console.log(results);

  return new Response(JSON.stringify(results));
};
