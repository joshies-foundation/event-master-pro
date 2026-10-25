import type { Locator, Page } from '@playwright/test';
import { sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  waitForWebKitToFinishLoading,
} from './support/fixtures';
import { seed } from './support/seed';

async function drag(page: Page, from: Locator, to: Locator): Promise<void> {
  const start = (await from.boundingBox())!;
  const end = (await to.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2 - 10, {
    steps: 20,
  });
  await page.mouse.up();
}

test('the GM reorders events and each event gets the round number shown next to it', async ({
  page,
  login,
}) => {
  await sql`
    update event set round_number = round_number - 2
    where session_id = ${seed.sessionId}`;
  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Manage Events' }).tap();
  const handles = page.locator('.pi-bars');
  await expect(handles).toHaveCount(6);

  await waitForWebKitToFinishLoading(page);
  await expect(async () => {
    await drag(page, handles.nth(1), handles.nth(0));
    await expect(page.getByRole('heading', { level: 4 }).first()).toHaveText(
      'Ping Pong',
      { timeout: 1_000 },
    );
  }).toPass();
  await page.locator('.pi-save').tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(
    page.getByText('Event order updated successfully'),
  ).toBeVisible();

  expect(
    await sql`
      select round_number, name from event
      where session_id = ${seed.sessionId} order by round_number, id`,
  ).toEqual(
    [
      'Ping Pong',
      'Magic school',
      'Kickball',
      'Cornhole',
      'Mini Golf',
      'Bowling',
    ].map((name, index) => ({ round_number: index + 1, name })),
  );
});
