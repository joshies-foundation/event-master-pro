import { createClient } from '@supabase/supabase-js';
import {
  ApplicationServerKeys,
  generatePushHTTPRequest,
  setWebCrypto,
} from '../_vendor/webpush-webcrypto/webpush.js';

interface Payload {
  recipient: string;
  title: string;
  body: string;
}

interface Subscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface VapidDetails {
  publicKey: string;
  privateKey: string;
  subject: string;
}

const userNotificationsSubscriptionTable = 'user_notifications_subscription';
const notificationsSubscriptionColumn = 'notifications_subscription';
const userIdColumn = 'user_id';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const vapidDetails: VapidDetails = {
  subject: Deno.env.get('VAPID_SUBJECT'),
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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

  const { data } = await supabase
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
      return sendNotification(vapidDetails, subscription, notification);
    }),
  );

  return new Response(null, { status: 201, headers: corsHeaders });
});

async function sendNotification(
  vapidDetails: VapidDetails,
  subscription: Subscription,
  payload: unknown,
): Promise<Response> {
  setWebCrypto(crypto);

  const applicationServerKeys =
    await ApplicationServerKeys.fromJSON(vapidDetails);

  const { headers, body, endpoint } = await generatePushHTTPRequest({
    applicationServerKeys,
    payload: JSON.stringify(payload),
    target: subscription,
    adminContact: vapidDetails.subject,
    ttl: 24 * 60 * 60, // 24 hours
  });

  return fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });
}
