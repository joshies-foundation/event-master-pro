import { readdirSync } from 'node:fs';
import type { Page, Route, WebSocketRoute } from '@playwright/test';
import { SCHEMA_VERSION } from '../src/app/shared/util/schema-version';
import { sql } from './support/db';
import {
  expect,
  openTab,
  test,
  waitForWebKitToFinishLoading,
} from './support/fixtures';
import { seed } from './support/seed';

const failedRequest = /Failed to load resource/;
const realtimeSocket = /\/realtime\/v1\/websocket/;
const restReads = '**/rest/v1/**';
const refreshRequest = '**/auth/v1/token?grant_type=refresh_token';
const authTokenKey = 'sb-127-auth-token';

function colinsRow(page: Page) {
  return page.getByRole('row', { name: /Colin/ });
}

function skeleton(page: Page) {
  return page.locator('p-skeleton');
}

function savedEntries(page: Page): Promise<[string, string][]> {
  return page.evaluate(() =>
    Object.entries(localStorage)
      .filter(([key]) => key.startsWith('emp-live'))
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

async function savedKeys(page: Page): Promise<string[]> {
  return (await savedEntries(page)).map(([key]) => key);
}

async function savedRowKeys(page: Page): Promise<string[]> {
  return (await savedKeys(page)).filter((key) => key.startsWith('emp-live:'));
}

function savedOwnerId(page: Page): Promise<string | undefined> {
  return page.evaluate(
    () => JSON.parse(localStorage.getItem('emp-live-owner') ?? '{}').id,
  );
}

async function hold(
  page: Page,
  url: string | RegExp,
): Promise<{ held: Route[]; release(): Promise<void> }> {
  const held: Route[] = [];
  await page.route(url, (route) => {
    held.push(route);
  });
  return {
    held,
    release: async () => {
      await Promise.all(held.map((route) => route.continue()));
      await page.unroute(url);
    },
  };
}

function collectAlerts(page: Page): string[] {
  const alerts: string[] = [];
  page.on('dialog', (dialog) => {
    alerts.push(dialog.message());
    void dialog.dismiss();
  });
  return alerts;
}

async function makeLeoGm() {
  await sql`update game_state set game_master_user_id = ${seed.leo.userId}
    where session_id = ${seed.sessionId}`;
}

async function signOut(page: Page) {
  await openTab(page, 'Profile');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Sign Out' }).tap();
  await expect(page).toHaveURL(/\/auth\/login$/);
}

async function watchForSkeleton(page: Page): Promise<() => Promise<boolean>> {
  const key = 'skeletonAppeared';
  await page.addInitScript((key) => {
    new MutationObserver(() => {
      if (document.querySelector('p-skeleton')) {
        sessionStorage.setItem(key, 'true');
      }
    }).observe(document, { childList: true, subtree: true });
  }, key);
  return async () =>
    (await page.evaluate((key) => sessionStorage.getItem(key), key)) === 'true';
}

test('a reopened app paints saved rows while REST and Realtime are held back', async ({
  page,
  login,
}) => {
  await login();
  await expect(colinsRow(page)).toBeVisible();
  const skeletonAppeared = await watchForSkeleton(page);
  const rest = await hold(page, restReads);
  await page.routeWebSocket(realtimeSocket, () => {});

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  expect(rest.held.length).toBeGreaterThan(0);
  expect(await skeletonAppeared()).toBe(false);

  await rest.release();
  await waitForWebKitToFinishLoading(page);
});

test('a row changed while the app was closed updates after open', async ({
  page,
  login,
}) => {
  await login();
  await expect(colinsRow(page)).toContainText(String(seed.colin.score));

  await page.goto('about:blank');
  await sql`update player set score = 999 where id = ${seed.colin.playerId}`;
  await page.goto('/home');

  await expect(colinsRow(page)).toContainText('999');
  await expect
    .poll(async () => JSON.stringify(await savedEntries(page)))
    .toContain('\\"score\\":999');
});

test('a player made GM while the app was closed can open a GM page', async ({
  page,
  login,
}) => {
  const alerts = collectAlerts(page);
  await login(seed.leo);
  await expect(colinsRow(page)).toBeVisible();

  await page.goto('about:blank');
  await makeLeoGm();
  await page.goto('/gm-tools/change-gm');

  await expect(page.getByText('Change GM').first()).toBeVisible();
  expect(alerts).toEqual([]);
});

test('a GM removed while the app was closed is sent home from a GM page', async ({
  page,
  login,
}) => {
  const alerts = collectAlerts(page);
  await login(seed.colin);
  await expect(colinsRow(page)).toBeVisible();

  await page.goto('about:blank');
  await makeLeoGm();
  await page.goto('/gm-tools/change-gm');

  await expect(page).toHaveURL(/\/home$/);
  expect(alerts).toEqual(['You are not authorized to view this page.']);
});

test('sign-out leaves no saved rows and the next user gets none of them', async ({
  page,
  login,
}) => {
  await login();
  expect(await savedRowKeys(page)).not.toEqual([]);

  await signOut(page);
  expect(await savedKeys(page)).toEqual([]);

  await page.reload();
  await page.getByPlaceholder('Username').fill(seed.leo.username);
  await page.getByPlaceholder('Password').fill(seed.password);
  const rest = await hold(page, restReads);
  await page.getByRole('button', { name: 'Log In' }).tap();

  await expect(page).toHaveURL(/\/home$/);
  await expect(skeleton(page).first()).toBeVisible();
  await expect(colinsRow(page)).toHaveCount(0);
  expect(await savedOwnerId(page)).toBe(seed.leo.userId);

  await rest.release();
  await expect(colinsRow(page)).toBeVisible();
});

test('rows saved for another user are deleted when this user arrives', async ({
  page,
  login,
}) => {
  await login();
  const othersRows = `emp-live:${SCHEMA_VERSION}:left-by:someone-else`;
  await page.evaluate(
    ([key, id]) => {
      localStorage.setItem('emp-live-owner', JSON.stringify({ id }));
      localStorage.setItem(key, '[{"id":1}]');
    },
    [othersRows, seed.leo.userId],
  );

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  expect(await savedOwnerId(page)).toBe(seed.colin.userId);
  expect(await savedRowKeys(page)).not.toContain(othersRows);
});

test('rows saved under an older schema are deleted at startup', async ({
  page,
  login,
}) => {
  await login();
  await page.evaluate(() =>
    localStorage.setItem('emp-live:19700101000000:player:', '[{"id":1}]'),
  );

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  expect(await savedRowKeys(page)).not.toContain(
    'emp-live:19700101000000:player:',
  );
});

test('a read that lands after sign-out saves nothing', async ({
  page,
  login,
}) => {
  await login();
  const rules = await hold(page, '**/rest/v1/rules?*');

  await openTab(page, 'Rules');
  await expect.poll(() => rules.held.length).toBeGreaterThan(0);
  await signOut(page);
  await rules.release();

  await waitForWebKitToFinishLoading(page);
  expect(await savedKeys(page)).toEqual([]);
});

test('an expired token with a failing refresh keeps the saved rows', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  const sockets: WebSocketRoute[] = [];
  await page.routeWebSocket(realtimeSocket, (socket) => {
    socket.connectToServer();
    sockets.push(socket);
  });
  await login();
  await expect(colinsRow(page)).toBeVisible();
  const entries = await savedEntries(page);

  await page.route(refreshRequest, (route) =>
    route.fulfill({ status: 503, json: { message: 'Service Unavailable' } }),
  );
  await page.evaluate((key) => {
    const session = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...session, expires_at: 1 }));
  }, authTokenKey);
  const emptyRead = page.waitForResponse(
    async (response) =>
      response.url().includes('/rest/v1/game_state') &&
      (await response.json()).length === 0,
    { timeout: 45_000 },
  );
  await Promise.all(sockets.map((socket) => socket.close()));

  await emptyRead;
  await page.waitForTimeout(1_000);

  await expect(colinsRow(page)).toBeVisible();
  expect(await savedEntries(page)).toEqual(entries);
});

test('corrupt JSON in a saved key falls back to a normal load', async ({
  page,
  login,
}) => {
  await login();
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('emp-live:'))
      .forEach((key) => localStorage.setItem(key, '{corrupt'));
  });

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  await expect
    .poll(async () =>
      (await savedEntries(page)).filter(([, value]) => value === '{corrupt'),
    )
    .toEqual([]);
});

test('a throwing setItem deletes saved rows and leaves the page working', async ({
  page,
  login,
}) => {
  await login();
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('emp-live:')) {
        throw new DOMException('Full', 'QuotaExceededError');
      }
      setItem.call(this, key, value);
    };
  });

  await page.reload();
  await expect(colinsRow(page)).toBeVisible();
  await sql`update player set score = 999 where id = ${seed.colin.playerId}`;

  await expect(colinsRow(page)).toContainText('999');
  await expect.poll(() => savedRowKeys(page)).toEqual([]);
});

test('the schema version matches the newest migration', () => {
  const newest = readdirSync('supabase/migrations').sort().at(-1)!;
  expect(SCHEMA_VERSION).toBe(newest.split('_')[0]);
});
