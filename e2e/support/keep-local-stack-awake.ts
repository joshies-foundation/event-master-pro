import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localStack } from '../../supabase/scripts/local-stack.mjs';

const publishableKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const coldStartLimit = 120_000;
const authCheckInterval = 20_000;

// The local stack starts auth and realtime on their first request and stops
// each one after a minute with no open connection to it. A run can go longer
// than that without a login or a live page.
export default async function keepLocalStackAwake(): Promise<
  () => Promise<void>
> {
  const { apiUrl } = localStack();
  console.log(`Waking local auth and realtime at ${apiUrl}`);
  const supabase = createClient(apiUrl, publishableKey, {
    auth: { persistSession: false },
    realtime: { timeout: coldStartLimit },
  });
  try {
    await Promise.all([
      checkAuth(apiUrl),
      subscribeToRealtime(supabase, apiUrl),
    ]);
  } catch (error) {
    await supabase.removeAllChannels();
    throw error;
  }
  const authTimer = setInterval(() => {
    checkAuth(apiUrl).catch((error: unknown) => console.error(error));
  }, authCheckInterval);
  return async () => {
    clearInterval(authTimer);
    await supabase.removeAllChannels();
  };
}

async function checkAuth(apiUrl: string): Promise<void> {
  const url = `${apiUrl}/auth/v1/health`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { apikey: publishableKey },
      signal: AbortSignal.timeout(coldStartLimit),
    });
  } catch (error) {
    throw new Error(`Local auth did not answer ${url}`, { cause: error });
  }
  if (!response.ok) {
    throw new Error(`Local auth answered ${response.status} at ${url}`);
  }
}

async function subscribeToRealtime(
  supabase: SupabaseClient,
  apiUrl: string,
): Promise<void> {
  const service = `Local realtime at ${apiUrl}/realtime/v1`;
  let deadline: NodeJS.Timeout | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      deadline = setTimeout(
        () =>
          reject(
            new Error(
              `${service} did not confirm a Postgres changes subscription within ${coldStartLimit / 1000} s`,
            ),
          ),
        coldStartLimit,
      );
      supabase
        .channel('keep-local-stack-awake')
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
                new Error(`${service} answered ${JSON.stringify(payload)}`),
              );
          },
        )
        .subscribe((status, error) => {
          if (status !== 'SUBSCRIBED') {
            reject(
              new Error(`${service} did not wake: ${status}`, { cause: error }),
            );
          }
        });
    });
  } finally {
    clearTimeout(deadline);
  }
}
