import { defineConfig, devices, type ViewportSize } from '@playwright/test';
import { createServer, type AddressInfo } from 'node:net';
import { localStack } from './supabase/scripts/local-stack.mjs';

// Playwright evaluates this file again in every worker. Workers inherit the
// environment, so they see the values the main process picked.
process.env['E2E_DB_URL'] ??= localStack().dbUrl;
process.env['E2E_PORT'] ??= String(await freePort());

const port = Number(process.env['E2E_PORT']);
const baseURL = `http://127.0.0.1:${port}`;

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

function installedPwaOn(name: string) {
  const device = devices[name];
  // Descriptors carry the screen size at runtime, but their type leaves it out.
  const { screen } = device as { screen?: ViewportSize };
  if (!screen) throw new Error(`${name} has no screen size`);
  return { ...device, viewport: screen };
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/support/keep-local-stack-awake.ts',
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env['CI']
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    timezoneId: 'America/New_York',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'iphone', use: installedPwaOn('iPhone 16 Pro') },
    { name: 'android', use: installedPwaOn('Pixel 8') },
  ],
  webServer: {
    command: `npx ng serve --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
