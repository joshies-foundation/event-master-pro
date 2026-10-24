// Long-lived browser for one verification run. Holds a Playwright context that
// emulates a phone running the installed PWA, and takes commands from browser.mjs
// over HTTP on 127.0.0.1. Started and stopped by `emp-verify browser start` / `down`.
import { createRequire } from 'node:module';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, isAbsolute, join } from 'node:path';

const { STATE, EVIDENCE, PW_HOME } = process.env;
const deviceName = process.env.EMP_VERIFY_DEVICE || 'iPhone 16 Pro';
const pw = createRequire(join(PW_HOME, 'node_modules') + '/')('playwright');
const device = pw.devices[deviceName];
if (!device) throw new Error(`unknown device "${deviceName}"`);
const engine = process.env.EMP_VERIFY_ENGINE || device.defaultBrowserType;
const baseUrl = readFileSync(join(STATE, 'url'), 'utf8').trim();
const consoleLog = join(STATE, 'console.log');
const stack = Object.fromEntries(
  readFileSync(join(STATE, 'supabase.env'), 'utf8')
    .trim()
    .split('\n')
    .map((l) => l.split(/=(.*)/s).slice(0, 2)),
);

const browser = await pw[engine].launch({ headless: true });
const context = await browser.newContext({
  ...device,
  // The app runs as an installed PWA (display: standalone), so there is no
  // browser toolbar: the viewport is the full screen.
  viewport: device.screen,
  baseURL: baseUrl,
});
const page = await context.newPage();
page.setDefaultTimeout(15000);

const log = (line) => appendFileSync(consoleLog, `${new Date().toISOString()} ${line}\n`);
page.on('console', (m) => log(`console.${m.type()} ${m.text()}`));
page.on('pageerror', (e) => log(`pageerror ${e.message}`));
// Native alert/confirm/prompt: accept by default. `dialog` arms the next answer.
let nextDialog = null;
page.on('dialog', async (d) => {
  const answer = nextDialog ?? { accept: true };
  nextDialog = null;
  log(`dialog.${d.type()} ${d.message()} -> ${answer.accept ? `accept ${answer.value ?? ''}` : 'dismiss'}`);
  if (answer.accept) await d.accept(answer.value);
  else await d.dismiss();
});
const apiOrigins = new Set();
page.on('request', (r) => {
  const u = new URL(r.url());
  if (/^\/(rest|auth|functions|realtime|storage)\/v1\//.test(u.pathname) && r.resourceType() !== 'image') apiOrigins.add(u.origin);
});
page.on('websocket', (ws) => {
  const u = new URL(ws.url().replace(/^ws/, 'http'));
  if (u.pathname.startsWith('/realtime/v1/')) apiOrigins.add(u.origin);
});
page.on('framenavigated', (f) => f === page.mainFrame() && log(`navigated ${f.url()}`));

function evidencePath(p) {
  const full = isAbsolute(p) ? p : join(EVIDENCE, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
}

function locate(o) {
  let loc;
  if (o.role) loc = page.getByRole(o.role, { name: o.name, exact: o.exact === true });
  else if (o.text) loc = page.getByText(o.text, { exact: o.exact === true });
  else if (o.placeholder) loc = page.getByPlaceholder(o.placeholder);
  else if (o.label) loc = page.getByLabel(o.label);
  else if (o.css) loc = page.locator(o.css);
  else throw new Error('need one of --role [--name], --text, --placeholder, --label, --css');
  if (o.within) loc = page.locator(o.within).locator(loc);
  return o.nth !== undefined ? loc.nth(Number(o.nth)) : loc.first();
}

const commands = {
  async goto(o, [target = '/']) {
    await page.goto(target);
    return page.url();
  },
  async tap(o) {
    await locate(o).tap();
    return `tapped; url ${page.url()}`;
  },
  async click(o) {
    await locate(o).click();
    return `clicked; url ${page.url()}`;
  },
  async fill(o) {
    await locate(o).fill(String(o.value ?? ''));
    return 'filled';
  },
  // Real keystrokes, for widgets that ignore fill() (PrimeNG p-inputNumber).
  async type(o) {
    const loc = locate(o);
    await loc.tap();
    await loc.press('ControlOrMeta+a');
    await loc.press('Backspace');
    await loc.pressSequentially(String(o.value ?? ''), { delay: 30 });
    await loc.blur();
    return `typed; value now ${JSON.stringify(await loc.inputValue())}`;
  },
  async press(o) {
    await page.keyboard.press(String(o.key));
    return `pressed ${o.key}`;
  },
  async back() {
    await page.goBack();
    return page.url();
  },
  async wait(o) {
    const timeout = Number(o.timeout ?? 15000);
    if (o.url) await page.waitForURL((u) => u.href.includes(o.url), { timeout });
    else await locate(o).waitFor({ state: o.gone ? 'hidden' : 'visible', timeout });
    return `ok; url ${page.url()}`;
  },
  async text(o) {
    return locate(o).innerText();
  },
  async count(o) {
    const loc = o.role
      ? page.getByRole(o.role, { name: o.name, exact: o.exact === true })
      : o.text
        ? page.getByText(o.text, { exact: o.exact === true })
        : page.locator(o.css);
    return String(await loc.count());
  },
  async snapshot(o) {
    const root = o.css ? page.locator(o.css).first() : page.locator('body');
    const snap = `# ${page.url()} (${deviceName}, ${engine})\n${await root.ariaSnapshot()}\n`;
    if (!o.path) return snap;
    writeFileSync(evidencePath(o.path), snap);
    return `saved ${evidencePath(o.path)}`;
  },
  async screenshot(o) {
    const out = evidencePath(o.path ?? `screenshot-${Date.now()}.png`);
    await page.screenshot({ path: out, fullPage: o.full === true });
    return `saved ${out}`;
  },
  async eval(o, [expr]) {
    return JSON.stringify(await page.evaluate(expr), null, 2);
  },
  async console(o) {
    let lines = [];
    try {
      lines = readFileSync(consoleLog, 'utf8').trimEnd().split('\n');
    } catch {}
    if (o.errors) lines = lines.filter((l) => /console\.error|pageerror|dialog\./.test(l));
    if (o.path) {
      writeFileSync(evidencePath(o.path), lines.join('\n') + '\n');
      return `saved ${evidencePath(o.path)}`;
    }
    return lines.slice(-Number(o.tail ?? 40)).join('\n');
  },
  async dialog(o) {
    nextDialog = o.dismiss ? { accept: false } : { accept: true, value: o.value };
    return `next dialog will be ${o.dismiss ? 'dismissed' : `accepted${o.value ? ` with "${o.value}"` : ''}`}`;
  },
  // Read-only PostgREST GET as the logged-in user (RLS applies), for side-effect checks.
  async rest(o, [path]) {
    const token = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
      return key ? JSON.parse(localStorage.getItem(key))?.access_token : null;
    });
    if (!token) throw new Error('not logged in; run emp-verify login');
    const res = await fetch(`${stack.API_URL}/rest/v1${path.startsWith('/') ? path : `/${path}`}`, {
      headers: { apikey: stack.PUBLISHABLE_KEY, authorization: `Bearer ${token}` },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} ${body}`);
    const out = JSON.stringify(JSON.parse(body), null, 2);
    if (o.path) {
      writeFileSync(evidencePath(o.path), `GET ${path}\n${out}\n`);
      return `saved ${evidencePath(o.path)}\n${out}`;
    }
    return out;
  },
  async api() {
    return [...apiOrigins].join('\n');
  },
  async whoami() {
    const session = await page
      .evaluate(() => {
        const key = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
        if (!key) return null;
        const s = JSON.parse(localStorage.getItem(key));
        return { key, email: s?.user?.email, expiresAt: s?.expires_at };
      })
      .catch(() => null);
    const vp = page.viewportSize();
    return [
      `device ${deviceName} on ${engine} ${browser.version()}, viewport ${vp.width}x${vp.height}, touch ${device.hasTouch}`,
      `url ${page.url()}`,
      `supabase ${[...apiOrigins].join(', ') || 'not called yet'}`,
      session
        ? `session ${session.email} (${session.key}, expires ${new Date(session.expiresAt * 1000).toISOString()})`
        : 'session none (not logged in, or page is not on the app origin)',
    ].join('\n');
  },
};

const server = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    const { command, opts = {}, positional = [] } = JSON.parse(body || '{}');
    const reply = (status, out) => {
      res.writeHead(status, { 'content-type': 'text/plain' });
      res.end(out);
    };
    const fn = commands[command];
    if (!fn) return reply(400, `unknown command ${command}; use ${Object.keys(commands).join('|')}`);
    const mark = readFileSync(consoleLog, 'utf8').length;
    try {
      const out = await fn(opts, positional);
      const fresh = readFileSync(consoleLog, 'utf8').slice(mark);
      const errors = fresh.split('\n').filter((l) => /console\.error|pageerror|dialog\./.test(l));
      reply(200, out + (errors.length ? `\n-- during this command:\n${errors.join('\n')}` : ''));
    } catch (e) {
      reply(500, `FAILED ${command}: ${e.message.split('\n')[0]}\nurl ${page.url()}`);
    }
  });
});

writeFileSync(consoleLog, '');
server.listen(0, '127.0.0.1', () => {
  writeFileSync(join(STATE, 'browser_port'), String(server.address().port));
  console.log(`browser ready: ${deviceName} on ${engine}, port ${server.address().port}`);
});
