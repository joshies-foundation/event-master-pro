import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { seed } from './support/seed';

const failedRequest = /Failed to load resource/;

function reconnectingBanner(page: Page) {
  return page.getByText('Reconnecting. You may be seeing older data.');
}

async function watchForBanner(page: Page): Promise<() => Promise<boolean>> {
  const key = 'bannerAppeared';
  await page.addInitScript((key) => {
    new MutationObserver(() => {
      if (document.body?.textContent?.includes('Reconnecting.')) {
        sessionStorage.setItem(key, 'true');
      }
    }).observe(document, { childList: true, subtree: true });
  }, key);
  return async () =>
    (await page.evaluate((key) => sessionStorage.getItem(key), key)) === 'true';
}

function colinsRow(page: Page) {
  return page.getByRole('row', { name: /Colin/ });
}

test('the reconnecting banner appears while REST is blocked and clears when it returns', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  await login();
  await expect(reconnectingBanner(page)).toHaveCount(0);

  await page.route('**/rest/v1/**', (route) => route.abort());
  await page.reload();

  await expect(reconnectingBanner(page)).toBeVisible();

  await page.unroute('**/rest/v1/**');

  await expect(reconnectingBanner(page)).toBeHidden({ timeout: 30_000 });
  await expect(colinsRow(page)).toBeVisible();
});

test('a normal open never shows the reconnecting banner', async ({
  page,
  login,
}) => {
  await login();
  const bannerAppeared = await watchForBanner(page);

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  await page.waitForTimeout(4_000);
  expect(await bannerAppeared()).toBe(false);
});

test('a slow Realtime join shows rows and never shows the reconnecting banner', async ({
  page,
  login,
}) => {
  await login();
  const bannerAppeared = await watchForBanner(page);
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (socket) => {
    const server = socket.connectToServer();
    socket.onMessage((message) =>
      setTimeout(() => server.send(message), 6_000),
    );
    server.onMessage((message) => socket.send(message));
  });

  await page.reload();

  await expect(colinsRow(page)).toBeVisible({ timeout: 4_000 });
  await page.waitForTimeout(4_000);
  expect(await bannerAppeared()).toBe(false);
});

test('a one-shot read waits while another live table keeps failing', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  const failUsers = /\/rest\/v1\/user\?/;
  await login();
  await page.route(failUsers, (route) =>
    route.fulfill({ status: 500, json: { message: 'Internal Server Error' } }),
  );

  await page.goto('/gm-tools/edit-game-state');

  const session = page.getByRole('combobox', { name: seed.sessionName });
  await page.waitForTimeout(5_000);
  await expect(session).toHaveCount(0);

  await page.unroute(failUsers);

  await expect(session).toBeVisible({ timeout: 30_000 });
});
