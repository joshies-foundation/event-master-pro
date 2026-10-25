import type { Page } from '@playwright/test';
import { sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  waitForWebKitToFinishLoading,
} from './support/fixtures';
import { seed } from './support/seed';

function row(page: Page, name: string) {
  return page.locator('.cdk-drag').filter({ hasText: name });
}

async function openManageEvents(page: Page): Promise<void> {
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Manage Events' }).tap();
  await expect(page.getByRole('heading', { level: 4 })).toHaveCount(6);
  await waitForWebKitToFinishLoading(page);
}

async function dragAbove(
  page: Page,
  name: string,
  target: string,
): Promise<void> {
  const order = await page.getByRole('heading', { level: 4 }).allInnerTexts();
  order.splice(order.indexOf(name), 1);
  order.splice(order.indexOf(target), 0, name);
  await expect(async () => {
    const start = (await row(page, name).locator('.pi-bars').boundingBox())!;
    const end = (await row(page, target).boundingBox())!;
    await page.mouse.move(
      start.x + start.width / 2,
      start.y + start.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2 - 10, {
      steps: 20,
    });
    await page.mouse.up();
    await expect(page.getByRole('heading', { level: 4 })).toHaveText(order, {
      timeout: 1_000,
    });
  }).toPass();
}

async function saveOrder(page: Page): Promise<void> {
  await page.locator('.pi-save').tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(
    page.getByText('Event order updated successfully'),
  ).toBeVisible();
}

function roundNumbers() {
  return sql`
    select name, round_number from event
    where session_id = ${seed.sessionId} order by round_number, id`;
}

async function startRound(roundNumber: number): Promise<void> {
  await sql`update game_state set round_number = ${roundNumber} where id = 1`;
}

async function startSessionAtRoundMinusOne(): Promise<void> {
  await sql`
    update event set round_number = round_number - 2
    where session_id = ${seed.sessionId}`;
}

test('a reorder in a session numbered from -1 keeps the round numbers the session has', async ({
  page,
  login,
}) => {
  await startSessionAtRoundMinusOne();
  await login();
  await openManageEvents(page);

  await dragAbove(page, 'Mini Golf', 'Kickball');
  await saveOrder(page);

  expect(await roundNumbers()).toEqual([
    { name: 'Magic school', round_number: -1 },
    { name: 'Ping Pong', round_number: 0 },
    { name: 'Mini Golf', round_number: 1 },
    { name: 'Kickball', round_number: 2 },
    { name: 'Cornhole', round_number: 3 },
    { name: 'Bowling', round_number: 4 },
  ]);
});

test('a swap of later events mid-session leaves played and current rounds alone', async ({
  page,
  login,
}) => {
  await startSessionAtRoundMinusOne();
  await startRound(2);
  await login();
  await expect(
    page.locator('joshies-event-info').getByRole('heading', { level: 4 }),
  ).toHaveText('Cornhole');
  await openManageEvents(page);

  await dragAbove(page, 'Bowling', 'Mini Golf');
  await saveOrder(page);

  expect(await roundNumbers()).toEqual([
    { name: 'Magic school', round_number: -1 },
    { name: 'Ping Pong', round_number: 0 },
    { name: 'Kickball', round_number: 1 },
    { name: 'Cornhole', round_number: 2 },
    { name: 'Bowling', round_number: 3 },
    { name: 'Mini Golf', round_number: 4 },
  ]);
  await expect(page.locator('.cdk-drag > div:first-child')).toHaveText([
    '-1',
    '0',
    '1',
    '2',
    '3',
    '4',
  ]);
  for (const name of ['Magic school', 'Ping Pong', 'Kickball']) {
    await expect(row(page, name).locator('.pi-bars')).toHaveCount(0);
  }

  await openTab(page, 'Home');
  await expect(
    page.locator('joshies-event-info').getByRole('heading', { level: 4 }),
  ).toHaveText('Cornhole');
});

test('a swap after played rounds in a session numbered from 1 changes only the swapped events', async ({
  page,
  login,
}) => {
  await startRound(3);
  await login();
  await openManageEvents(page);
  for (const name of ['Magic school', 'Ping Pong']) {
    await expect(row(page, name).locator('.pi-bars')).toHaveCount(0);
  }

  await dragAbove(page, 'Bowling', 'Mini Golf');
  await saveOrder(page);

  expect(await roundNumbers()).toEqual([
    { name: 'Magic school', round_number: 1 },
    { name: 'Ping Pong', round_number: 2 },
    { name: 'Kickball', round_number: 3 },
    { name: 'Cornhole', round_number: 4 },
    { name: 'Bowling', round_number: 5 },
    { name: 'Mini Golf', round_number: 6 },
  ]);
});
