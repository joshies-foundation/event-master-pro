// Sends one command to this run's browser-server.mjs and prints the reply.
// Called through `emp-verify browser <command> [--flag value ...] [positional]`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [command, ...rest] = process.argv.slice(2);
const opts = {};
const positional = [];
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith('--')) {
    positional.push(rest[i]);
    continue;
  }
  const next = rest[i + 1];
  const isValue = next !== undefined && !next.startsWith('--');
  opts[rest[i].slice(2)] = isValue ? next : true;
  if (isValue) i++;
}

const port = readFileSync(
  join(process.env.STATE, 'browser_port'),
  'utf8',
).trim();
const res = await fetch(`http://127.0.0.1:${port}/`, {
  method: 'POST',
  body: JSON.stringify({ command, opts, positional }),
});
const out = await res.text();
(res.ok ? process.stdout : process.stderr).write(
  out.endsWith('\n') ? out : out + '\n',
);
process.exitCode = res.ok ? 0 : 1;
