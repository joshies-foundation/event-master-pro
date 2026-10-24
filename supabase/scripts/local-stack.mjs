// The local Supabase project of this checkout, read from the Supabase CLI.
// `node supabase/scripts/local-stack.mjs start|reset [args]` runs `supabase start`
// or `supabase db reset`, then points the bet push trigger at this project.
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// The API gateway runs on the host, so the database reaches it through
// whatever name the runtime gives the host.
const gatewayHostFromDatabase = {
  docker: 'host.supabase.internal',
  native: '127.0.0.1',
};

/** @returns {{ apiUrl: string, dbUrl: string, runtime: string }} */
export function localStack() {
  let status;
  try {
    status = execFileSync(
      'npx',
      ['supabase', 'status', '--output-format', 'json'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    throw new Error(
      `No local Supabase project is running for ${root}. Run npm run start-supabase there.`,
      { cause: error },
    );
  }
  // A stopped project still reports its keys but no URLs. A running one
  // reports lifecycle "starting" while a lazy service wakes up.
  const { runtime, env } = JSON.parse(status);
  if (!env?.API_URL || !env?.DB_URL) {
    throw new Error(
      `The local Supabase project for ${root} is not running. Run npm run start-supabase there.`,
    );
  }
  return { apiUrl: env.API_URL, dbUrl: env.DB_URL, runtime };
}

async function pointPushTriggerAtThisProject() {
  const { apiUrl, dbUrl, runtime } = localStack();
  const host = gatewayHostFromDatabase[runtime];
  if (!host) {
    throw new Error(
      `Unknown Supabase runtime "${runtime}". Add how its database reaches the host to gatewayHostFromDatabase in ${fileURLToPath(import.meta.url)}.`,
    );
  }
  const url = `http://${host}:${new URL(apiUrl).port}/functions/v1/push`;
  const sql = postgres(dbUrl, { max: 1, onnotice: () => undefined });
  try {
    await sql.begin(async (tx) => {
      const [secret] = await tx`
        select id from vault.secrets where name = 'push_function_url'`;
      if (secret) await tx`select vault.update_secret(${secret.id}, ${url})`;
      else await tx`select vault.create_secret(${url}, 'push_function_url')`;
    });
  } finally {
    await sql.end();
  }
  console.log(`push_function_url is ${url}`);
  // Functions start on their first request and stop after a minute idle. A
  // cold start takes longer than the trigger's 1 s timeout, so without this the
  // first bet push after a start or reset is lost. The gateway answers OPTIONS
  // itself, so wake functions with a POST that push rejects for lacking a key.
  const wake = await fetch(`${apiUrl}/functions/v1/push`, { method: 'POST' });
  if (wake.status !== 401) {
    throw new Error(`The push function answered ${wake.status}, not 401`);
  }
}

const commands = { start: ['start'], reset: ['db', 'reset'] };

if (import.meta.main) {
  const [name, ...args] = process.argv.slice(2);
  if (!Object.hasOwn(commands, name ?? '')) {
    console.error(
      'Usage: node supabase/scripts/local-stack.mjs start|reset [args]',
    );
    process.exit(2);
  }
  const { status } = spawnSync(
    'npx',
    ['supabase', ...commands[name], ...args],
    {
      cwd: root,
      stdio: ['ignore', 'inherit', 'inherit'],
    },
  );
  if (status !== 0) process.exit(status ?? 1);
  await pointPushTriggerAtThisProject();
}
