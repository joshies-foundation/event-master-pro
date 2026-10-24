import {
  test as base,
  expect,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';
import { resetDatabase } from './db';
import { seed, type SeedUser } from './seed';

interface ConsoleGuard {
  allow(pattern: RegExp): void;
  watch(page: Page): void;
}

interface Fixtures {
  consoleGuard: ConsoleGuard;
  login(user?: SeedUser): Promise<void>;
  secondPhone(user: SeedUser): Promise<Page>;
}

async function logIn(page: Page, user: SeedUser): Promise<void> {
  await page.goto('/auth/login');
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder('Password').fill(seed.password);
  await page.getByRole('button', { name: 'Log In' }).tap();
  await expect(page).toHaveURL(/\/home$/);
  await waitForWebKitToFinishLoading(page);
}

/** WebKit logs every request that a navigation cuts off as an access control error. */
export async function waitForWebKitToFinishLoading(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export const test = base.extend<Fixtures & { freshDatabase: void }>({
  freshDatabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await resetDatabase();
      await use();
    },
    { auto: true },
  ],

  consoleGuard: [
    async ({ page }, use) => {
      const allowed: RegExp[] = [];
      const errors: string[] = [];
      const watch = (watched: Page) => {
        watched.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        watched.on('pageerror', (error) => errors.push(error.message));
      };
      watch(page);
      await use({ allow: (pattern) => allowed.push(pattern), watch });
      const unexpected = errors.filter(
        (error) => !allowed.some((pattern) => pattern.test(error)),
      );
      expect(unexpected, 'console errors').toEqual([]);
    },
    { auto: true },
  ],

  login: async ({ page }, use) => {
    await use((user = seed.colin) => logIn(page, user));
  },

  secondPhone: async (
    {
      browser,
      baseURL,
      viewport,
      userAgent,
      deviceScaleFactor,
      isMobile,
      hasTouch,
      timezoneId,
      locale,
      consoleGuard,
    },
    use,
  ) => {
    const contexts: BrowserContext[] = [];
    await use(async (user) => {
      const context = await browser.newContext({
        baseURL,
        viewport,
        userAgent,
        deviceScaleFactor,
        isMobile,
        hasTouch,
        timezoneId,
        locale,
      });
      contexts.push(context);
      const page = await context.newPage();
      consoleGuard.watch(page);
      await logIn(page, user);
      return page;
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});

export { expect };

export const pushFailure = /Failed to load resource.*500/;

export async function openTab(page: Page, name: string): Promise<void> {
  await page.locator('nav').getByRole('link', { name }).tap();
}

export function acceptNextDialog(page: Page, value?: string): Promise<string> {
  return new Promise((resolve) => {
    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      await dialog.accept(value);
      resolve(message);
    });
  });
}

export function confirmDialog(page: Page, header = 'Confirmation') {
  return page.getByRole('alertdialog', { name: header });
}

export function card(page: Page, heading: string) {
  return page
    .locator('joshies-card')
    .filter({ has: page.getByRole('heading', { name: heading }) });
}

export async function typeNumber(input: Locator, value: number): Promise<void> {
  await input.tap();
  await input.press('ControlOrMeta+a');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 30 });
  await input.blur();
}
