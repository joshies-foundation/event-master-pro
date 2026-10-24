import { defineConfig, devices, type ViewportSize } from '@playwright/test';

const port = Number(process.env['E2E_PORT'] ?? 4380);
const baseURL = `http://127.0.0.1:${port}`;

function installedPwaOn(name: string) {
  const device = devices[name];
  // Descriptors carry the screen size at runtime, but their type leaves it out.
  const { screen } = device as { screen?: ViewportSize };
  if (!screen) throw new Error(`${name} has no screen size`);
  return { ...device, viewport: screen };
}

export default defineConfig({
  testDir: './e2e',
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
