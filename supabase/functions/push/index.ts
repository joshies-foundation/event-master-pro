import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendNotification } from '../_shared/web-push.ts';

interface Payload {
  recipient: string;
  title: string;
  body: string;
}

const userNotificationsSubscriptionTable = 'user_notifications_subscription';
const notificationsSubscriptionColumn = 'notifications_subscription';
const userIdColumn = 'user_id';

Deno.serve(async (req: Request) => {
  // return CORS headers for OPTIONS requests - needed when invoking function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // extract request payload
  const payload = (await req.json()) as Payload;
  console.log('Received notification payload:', payload);
  const { recipient, title, body } = payload;

  if (!recipient) {
    return new Response('No recipient provided', { status: 400 });
  }

  if (!(title || body)) {
    return new Response('No title or body provided', { status: 400 });
  }

  // get recipient notification subscriptions from database
  console.log(
    `Grabbing ${notificationsSubscriptionColumn} from table ${userNotificationsSubscriptionTable} where ${userIdColumn} = ${recipient}`,
  );

  const { data } = await supabaseAdmin
    .from(userNotificationsSubscriptionTable)
    .select(notificationsSubscriptionColumn)
    .eq(userIdColumn, recipient);

  if (!data?.length) {
    return new Response(
      `No notifications subscriptions found for user ID ${recipient}`,
      { status: 500 },
    );
  }

  const subscriptions = data.map((row) => row[notificationsSubscriptionColumn]);

  console.log(`Found ${subscriptions.length} subscriptions.`);

  // build notification payload
  const notification = {
    notification: { title, body },
  };

  console.log('Sending notification:', notification);

  // send notification to each subscription
  await Promise.all(
    subscriptions.map((subscription) => {
      console.log('To subscription:', subscription);
      return sendNotification(subscription, notification);
    }),
  );

  return new Response(null, { status: 201, headers: corsHeaders });
});
