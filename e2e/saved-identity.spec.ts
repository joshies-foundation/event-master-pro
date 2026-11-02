import type { Page, Route } from '@playwright/test';
import { sql } from './support/db';
import { expect, test } from './support/fixtures';
import { seed } from './support/seed';

const failedRequest = /Failed to load resource/;
const refreshRequest = '**/auth/v1/token?grant_type=refresh_token';
const authTokenKey = 'sb-127-auth-token';

function colinsRow(page: Page) {
  return page.getByRole('row', { name: /Colin/ });
}

function expireToken(page: Page): Promise<void> {
  return page.evaluate((key) => {
    const session = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...session, expires_at: 1 }));
  }, authTokenKey);
}

function savedKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith('emp-live')),
  );
}

test('an expired token with a slow refresh shows the shell and rows first', async ({
  page,
  login,
}) => {
  await login();
  await expect(colinsRow(page)).toBeVisible();
  await expireToken(page);
  const refreshes: Route[] = [];
  await page.route(refreshRequest, (route) => {
    refreshes.push(route);
  });

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  await expect(
    page.locator('nav').getByRole('link', { name: 'Home' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/home$/);
  expect(refreshes.length).toBe(1);

  await Promise.all(refreshes.map((route) => route.continue()));

  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).expires_at,
        authTokenKey,
      ),
    )
    .toBeGreaterThan(1);
  await expect(page).toHaveURL(/\/home$/);
  await expect(colinsRow(page)).toBeVisible();
});

test('a revoked refresh token ends on the login page with no saved rows', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(/status of 400/);
  await login();
  await expect(colinsRow(page)).toBeVisible();
  expect(await savedKeys(page)).not.toEqual([]);
  await expireToken(page);
  await sql`delete from auth.sessions where user_id = ${seed.colin.userId}`;

  await page.reload();

  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  expect(await savedKeys(page)).toEqual([]);
});

test('a network failure during refresh stays on home with the saved rows', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  await login();
  await expect(colinsRow(page)).toBeVisible();
  await expireToken(page);
  let attempts = 0;
  await page.route(refreshRequest, (route) => {
    attempts++;
    return route.abort();
  });

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  await expect
    .poll(() => attempts, { timeout: 40_000, message: 'supabase-js gave up' })
    .toBeGreaterThanOrEqual(8);
  await page.waitForTimeout(1_000);

  await expect(page).toHaveURL(/\/home$/);
  await expect(colinsRow(page)).toBeVisible();
  await expect(
    page.getByText('Reconnecting. You may be seeing older data.'),
  ).toBeVisible();
});

test('an offline open shows saved rows instead of the login page', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  await login();
  await expect(colinsRow(page)).toBeVisible();
  await expireToken(page);
  await page.route(refreshRequest, (route) => route.abort());
  await page.route('**/rest/v1/**', (route) => route.abort());

  await page.reload();

  await expect(colinsRow(page)).toBeVisible();
  await expect(page).toHaveURL(/\/home$/);
});

test('a visitor with no saved user and a failing refresh still reaches login', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(failedRequest);
  await login();
  await expireToken(page);
  await page.evaluate(() => localStorage.removeItem('emp-live-owner'));
  await page.route(refreshRequest, (route) => route.abort());

  await page.reload();

  await expect(page).toHaveURL(/\/auth\/login$/, { timeout: 40_000 });
});
