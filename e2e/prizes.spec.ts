import { sql } from './support/db';
import { expect, openTab, test, pushFailure } from './support/fixtures';
import { seed } from './support/seed';

async function tokens(playerId: number) {
  const [row] = await sql<{ prize_tokens: number }[]>`
    select prize_tokens from player where id = ${playerId}`;
  return Number(row.prize_tokens);
}

async function prizesWonBy(playerId: number) {
  const rows = await sql<{ id: string }[]>`
    select id from prize where won_by_player_id = ${playerId} order by id`;
  return rows.map((row) => Number(row.id));
}

test('spending a token at the prize machine wins a prize from the pool', async ({
  page,
  login,
}) => {
  await login();
  await expect(
    page.locator('nav').getByRole('link', { name: 'Prizes' }),
  ).toContainText('1');
  await openTab(page, 'Prizes');
  await expect(
    page.getByText('Your prizes will appear here once you win them.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Spin' }).tap();
  await page
    .getByRole('button', { name: 'Hell yeah' })
    .tap({ timeout: 20_000 });

  await expect(
    page.getByText('Your prizes will appear here once you win them.'),
  ).toHaveCount(0);
  await expect.poll(() => tokens(seed.colin.playerId)).toBe(0);
  const won = await prizesWonBy(seed.colin.playerId);
  expect(won).toHaveLength(1);
  expect(seed.unwonPrizeIds).toContain(won[0]);

  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Manage Prize Pool' }).tap();
  await expect(
    page.getByRole('heading', { name: 'Un-Won Prizes (2)' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Won Prizes (1)' }),
  ).toBeVisible();
});

test('the GM gives and takes prize tokens', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Adjust Prize Tokens' }).tap();

  const colin = page.getByRole('row', { name: /^Colin Colin / });
  const [minus, plus] = [
    colin.getByRole('button').nth(0),
    colin.getByRole('button').nth(1),
  ];
  await plus.tap();
  await expect(colin.getByRole('cell').nth(1)).toHaveText('2');
  await expect.poll(() => tokens(seed.colin.playerId)).toBe(2);
  await expect(
    page.locator('nav').getByRole('link', { name: 'Prizes' }),
  ).toContainText('2');

  await minus.tap();
  await expect(colin.getByRole('cell').nth(1)).toHaveText('1');
  await minus.tap();
  await expect(colin.getByRole('cell').nth(1)).toHaveText('0');
  await expect.poll(() => tokens(seed.colin.playerId)).toBe(0);
  await expect(minus).toBeDisabled();
  await expect(
    page.locator('nav').getByRole('link', { name: 'Prizes' }),
  ).toHaveCount(0);
});
