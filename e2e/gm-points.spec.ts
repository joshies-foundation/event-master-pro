import type { Page } from '@playwright/test';
import { score, sql } from './support/db';
import {
  card,
  confirmDialog,
  expect,
  openTab,
  test,
  typeNumber,
  pushFailure,
} from './support/fixtures';
import { seed } from './support/seed';

async function openOverrideFor(page: Page, name: string) {
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Override Points' }).tap();
  await page
    .getByRole('row', { name: new RegExp(`^${name} ${name} `) })
    .getByRole('button', { name: 'Edit' })
    .tap();
  await expect(
    page.getByRole('button', { name: 'Submit Override' }),
  ).toBeVisible();
}

test('the GM adds points to a player with a reason', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await login();
  await openOverrideFor(page, 'Colin');
  await expect(
    page.getByRole('radio', { name: 'Add or Subtract Points' }),
  ).toBeChecked();
  await typeNumber(page.getByRole('spinbutton'), 5);
  await page
    .getByRole('textbox', { name: 'Reason for Override' })
    .fill('Best costume');
  await expect(page.getByRole('row', { name: 'After 38' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Override' }).tap();
  await expect(confirmDialog(page)).toContainText(
    'Do you want to submit this override for Colin?',
  );
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await expect(page).toHaveURL(/\/gm-tools\/override-points$/);
  await expect(
    page.getByRole('row', { name: /^Colin Colin 38/ }),
  ).toBeVisible();
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 5);
  const transactions = await sql<{ num_points: string }[]>`
    select num_points from transaction
    where player_id = ${seed.colin.playerId} and description = 'GM Discretion: Best costume'`;
  expect(transactions.map((row) => Number(row.num_points))).toEqual([5]);

  await openTab(page, 'Analytics');
  await page.getByRole('button', { name: 'All Transactions' }).tap();
  await expect(page).toHaveURL(/\/analytics\/transactions$/);
  await expect(
    page.getByRole('row', { name: /^GM Discretion: Best costume .* \+5$/ }),
  ).toHaveCount(1);

  await openTab(page, 'Home');
  await expect(page.getByRole('row', { name: /Colin 38/ })).toBeVisible();
});

test('the GM replaces a score outright', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await login();
  await openOverrideFor(page, 'Josh');
  await page.getByRole('radio', { name: 'Replace Score Entirely' }).tap();
  await typeNumber(page.getByRole('spinbutton'), 100);
  await page
    .getByRole('textbox', { name: 'Reason for Override' })
    .fill('Scorekeeping fix');
  await page.getByRole('button', { name: 'Submit Override' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await expect(page).toHaveURL(/\/gm-tools\/override-points$/);
  await expect.poll(() => score(seed.josh.playerId)).toBe(100);
  await openTab(page, 'Home');
  await expect(page.getByRole('row').nth(1)).toHaveText(/Josh\s*100/);
});

test('taking points away can feed the bank', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await login();
  await openOverrideFor(page, 'Colin');
  await typeNumber(page.getByRole('spinbutton'), -3);
  await page
    .getByRole('textbox', { name: 'Reason for Override' })
    .fill('Late to the start');
  await expect(
    page.getByRole('checkbox', { name: 'Add lost points to Bank Balance' }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Submit Override' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await expect(page).toHaveURL(/\/gm-tools\/override-points$/);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score - 3);
  await openTab(page, 'Home');
  await expect(card(page, 'Bank Balance')).toContainText('3 points');
});

test('the GM overrides the bank balance', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Override Bank Balance' }).tap();
  await page
    .getByRole('radio', { name: 'Replace Bank Balance Entirely' })
    .tap();
  await typeNumber(page.getByRole('spinbutton'), 25);
  await page.getByRole('button', { name: 'Submit Override' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await openTab(page, 'Home');
  await expect(card(page, 'Bank Balance')).toContainText('25 points');
});
