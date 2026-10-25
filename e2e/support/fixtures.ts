import {
  test as base,
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type Request,
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

interface Network {
  inFlight: Set<Request>;
  lastActivity: number;
}

const networks = new WeakMap<Page, Network>();

function trackNetwork(page: Page): void {
  const network: Network = { inFlight: new Set(), lastActivity: Date.now() };
  networks.set(page, network);
  page.on('request', (request) => {
    network.inFlight.add(request);
    network.lastActivity = Date.now();
  });
  const settle = (request: Request) => {
    network.inFlight.delete(request);
    network.lastActivity = Date.now();
  };
  page.on('requestfinished', settle);
  page.on('requestfailed', settle);
}

/**
 * WebKit logs every request that a navigation cuts off as an access control
 * error. Unlike `networkidle`, which only covers a page that is still loading,
 * this also waits for requests the page starts after it loaded.
 */
export async function waitForWebKitToFinishLoading(page: Page): Promise<void> {
  const network = networks.get(page);
  if (!network)
    throw new Error('Open pages with the page or secondPhone fixture');
  await expect
    .poll(
      () =>
        network.inFlight.size === 0 && Date.now() - network.lastActivity >= 500,
      { message: 'no request in flight for 500 ms', intervals: [100] },
    )
    .toBe(true);
}

export const test = base.extend<Fixtures & { freshDatabase: void }>({
  page: async ({ page }, use) => {
    trackNetwork(page);
    await use(page);
  },

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
      // NG02955 is a dev-mode hint that an image was the LCP element. Whether an
      // avatar outranks the page header depends on paint timing and on the
      // fonts installed on the machine that runs the test.
      const allowed: RegExp[] = [/NG02955/];
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
      trackNetwork(page);
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
