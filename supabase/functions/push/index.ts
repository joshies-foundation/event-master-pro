import { Hono } from 'hono';
import { HTTPException } from 'hono/dist/types/http-exception';
import { StatusCode } from 'hono/dist/types/utils/http-status';
import { corsHeaders } from '../_shared/cors.ts';
import { sendPushNotificationToUsers } from '../_shared/push-notification-helpers.ts';

const edgeFunctionName = 'push';
const app = new Hono().basePath(`/${edgeFunctionName}`);

// return CORS headers for OPTIONS requests - needed when invoking function from a browser.
app.options('*', (c) => c.body(null, 204, corsHeaders));

interface GmMessagePayload {
  recipientUserIds: string[];
  title: string;
  body: string;
  openUrl?: string;
}

app.post('/gm-message', async (c) => {
  // extract request payload
  const payload = (await c.req.json()) as GmMessagePayload;
  console.log('Received GM Message payload:', payload);
  const { recipientUserIds, title, body, openUrl } = payload;

  // send notifications
  await sendPushNotificationToUsers(recipientUserIds, title, body, openUrl);

  return c.body(null, 201, corsHeaders);
});

// handle errors
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse = err.getResponse();
    return c.body(
      errorResponse.body,
      errorResponse.status as StatusCode,
      corsHeaders,
    );
  }

  return c.body(err.message, 500, corsHeaders);
});

Deno.serve(app.fetch);
