import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import {
  ApplicationServerKeys,
  generatePushHTTPRequest,
  setWebCrypto,
} from '../vendor/webpush-webcrypto/webpush.js';

interface Payload {
  recipient: string;
  title: string;
  body: string;
  icon: string;
}

setWebCrypto(crypto);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const vapidDetails = {
  subject: Deno.env.get('VAPID_SUBJECT'),
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
};

const keys = await ApplicationServerKeys.fromJSON(vapidDetails);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const payload = (await req.json()) as Payload;

  console.log('Received Notification Payload:', payload);

  const { recipient, title, body, icon } = payload;

  const dbTable = 'user_notifications_subscription';
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
    .eq(whereColumn, recipient)
    .single();

  console.log('Data:', data);

  const subscription = data![dbColumn];

  console.log('Subscription:', subscription);

  const notification = {
    notification: { title, body, icon },
  };

  console.log('Sending notification:', notification);

  const {
    headers,
    body: requestBody,
    endpoint,
  } = await generatePushHTTPRequest({
    applicationServerKeys: keys,
    payload: JSON.stringify(notification),
    target: subscription,
    adminContact: 'mailto:admin@joshies.app',
    ttl: 60,
    urgency: 'low',
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: requestBody,
  });

  console.log(response);
  console.log(await response.json());

  return new Response(response.body, { ...response, headers: corsHeaders });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
