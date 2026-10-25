import { createClient } from '@supabase/supabase-js';
import { localStack } from '../../supabase/scripts/local-stack.mjs';

const publishableKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const coldStartLimit = 120_000;

// The local stack starts auth and realtime on their first request and stops
// them after a minute idle.
export default async function wakeLocalStack(): Promise<void> {
  const { apiUrl } = localStack();
  await Promise.all([wakeAuth(apiUrl), wakeRealtime(apiUrl)]);
}

async function wakeAuth(apiUrl: string): Promise<void> {
  const response = await fetch(`${apiUrl}/auth/v1/health`, {
    headers: { apikey: publishableKey },
    signal: AbortSignal.timeout(coldStartLimit),
  });
  if (!response.ok) {
    throw new Error(
      `Local auth answered ${response.status} to its health check`,
    );
  }
}

async function wakeRealtime(apiUrl: string): Promise<void> {
  const supabase = createClient(apiUrl, publishableKey, {
    auth: { persistSession: false },
    realtime: { timeout: coldStartLimit },
  });
  try {
    await new Promise<void>((resolve, reject) => {
      supabase
        .channel('wake-local-stack')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_state' },
          () => undefined,
        )
        .on(
          'system',
          {},
          (payload: { extension?: string; status?: string }) => {
            if (payload.extension !== 'postgres_changes') return;
            if (payload.status === 'ok') resolve();
            else
              reject(
                new Error(`Local realtime answered ${JSON.stringify(payload)}`),
              );
          },
        )
        .subscribe((status, error) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            reject(
              new Error(`Local realtime did not wake: ${status}`, {
                cause: error,
              }),
            );
          }
        });
    });
  } finally {
    await supabase.removeAllChannels();
  }
}
