import { createClient } from '@supabase/supabase-js';

/** The project's secret API keys, by name. The runtime injects them as JSON. */
export const secretKeys: Record<string, string> = JSON.parse(
  Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}',
);

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  secretKeys['default'],
);
