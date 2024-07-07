import { setWebCrypto } from '../_vendor/webpush-webcrypto/util.js';
import { ApplicationServerKeys } from '../_vendor/webpush-webcrypto/application-server-keys.js';
import { generatePushHTTPRequest } from '../_vendor/webpush-webcrypto/payload.js';

export interface Subscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface VapidDetails {
  publicKey: string;
  privateKey: string;
  subject: string;
}

const vapidDetails: VapidDetails = {
  subject: Deno.env.get('VAPID_SUBJECT'),
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
};

const applicationServerKeys =
  await ApplicationServerKeys.fromJSON(vapidDetails);

setWebCrypto(crypto);

export async function sendNotification(
  subscription: Subscription,
  payload: unknown,
): Promise<Response> {
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
