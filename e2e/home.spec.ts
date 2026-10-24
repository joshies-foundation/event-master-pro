import { test, expect, card, openTab } from './support/fixtures';
import { sql } from './support/db';
import { seed } from './support/seed';

test('Home shows the session, its current phase, and what is next', async ({
  page,
  login,
}) => {
  await login();
  await expect(
    page.getByRole('heading', { name: seed.sessionName, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('June 9, 2026 - June 10, 2026')).toBeVisible();
  await expect(
    page.getByText('Gameboard moves for turn 1 of 3.'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Magic school', level: 4 }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Place Bet for Magic school' }),
  ).toBeVisible();
  await expect(card(page, 'Bank Balance')).toContainText('0 points');
});

test('the rankings list every player by score with a crown for the leader', async ({
  page,
  login,
}) => {
  await login();
  const rows = page.getByRole('table').getByRole('row');
  await expect(rows).toHaveCount(seed.playersInSession + 1);
  await expect(rows.nth(1).getByRole('cell')).toHaveText(['👑', 'Leo', '70']);
  await expect(
    page.getByRole('row', { name: /Colin/ }).getByRole('cell'),
  ).toHaveText(['5', 'Colin', '33']);

  const scores = await rows.locator('td:last-child').allInnerTexts();
  const numbers = scores.map(Number);
  expect(numbers).toEqual([...numbers].sort((a, b) => b - a));
});

test('tied players keep their order whatever order the rows arrive in', async ({
  page,
  login,
}) => {
  const expected = [
    ['👑', 'Leo', '70'],
    ['2', 'Olivia', '51'],
    ['3', 'Josh', '40'],
    ['3', 'Molly', '40'],
    ['5', 'Colin', '33'],
    ['6', 'Dan', '20'],
    ['7', 'Alyssa', '10'],
    ['7', 'Brittany', '10'],
    ['7', 'Ellie', '10'],
    ['💩', 'Leo', '-10'],
    ['💩', 'Tim', '-10'],
  ];
  const expectRankings = async () => {
    const rows = page.getByRole('table').locator('tbody tr');
    await expect(rows).toHaveCount(expected.length);
    for (const [index, cells] of expected.entries()) {
      await expect(rows.nth(index).getByRole('cell')).toHaveText(cells);
    }
  };

  await login();
  await expectRankings();

  let reversed = false;
  await page.route(
    /\/rest\/v1\/player\?select=\*&session_id=eq\./,
    async (route) => {
      const response = await route.fetch();
      const players: unknown[] = await response.json();
      reversed = true;
      await route.fulfill({ response, json: players.reverse() });
    },
  );
  await page.reload();
  await expectRankings();
  expect(reversed).toBe(true);
});

test('every player tied for last place gets the poop emoji', async ({
  page,
  login,
}) => {
  await login();
  for (const name of ['Leo', 'Tim']) {
    await expect(
      page
        .getByRole('row')
        .filter({ hasText: name })
        .filter({ hasText: '-10' })
        .getByRole('cell'),
    ).toHaveText(['💩', name, '-10']);
  }
});

test('everyone tied for first gets the crown and nobody gets the poop', async ({
  page,
  login,
}) => {
  await sql`update player set score = 0 where session_id = ${seed.sessionId}`;
  await login();
  const rankCells = page.getByRole('table').locator('tbody tr td:first-child');
  await expect(rankCells).toHaveText(Array(seed.playersInSession).fill('👑'));
});

test('a lone player gets the crown', async ({ page, login }) => {
  await sql`update player set enabled = false
    where session_id = ${seed.sessionId} and id <> ${seed.colin.playerId}`;
  await login();
  await expect(
    page.getByRole('table').locator('tbody tr').getByRole('cell'),
  ).toHaveText(['👑', 'Colin', '33']);
});

test('rankings update live when a score changes', async ({ page, login }) => {
  await login();
  const leader = page.getByRole('table').getByRole('row').nth(1);
  await expect(leader.getByRole('cell')).toHaveText(['👑', 'Leo', '70']);
  await sql`update player set score = 99 where id = ${seed.colin.playerId}`;
  await expect(leader.getByRole('cell')).toHaveText(['👑', 'Colin', '99']);
});

test('the GM sees GM actions and tabs that a player does not', async ({
  page,
  login,
}) => {
  await login(seed.colin);
  const nav = page.locator('nav');
  await expect(nav.getByRole('link')).toHaveText([
    /Home/,
    /Rules/,
    /Betting/,
    /1\s*Prizes/,
    /GM Tools/,
    /Analytics/,
    /Profile/,
  ]);
  await expect(
    page.getByRole('button', { name: 'Enter Gameboard Moves' }),
  ).toBeVisible();

  await openTab(page, 'Profile');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Sign Out' }).tap();
  await expect(page).toHaveURL(/\/auth\/login$/);

  await login(seed.leo);
  await expect(nav.getByRole('link')).toHaveText([
    /Home/,
    /Rules/,
    /Betting/,
    /1\s*Prizes/,
    /Analytics/,
    /Profile/,
  ]);
  await expect(
    page.getByText('Gameboard moves for turn 1 of 3.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enter Gameboard Moves' }),
  ).toHaveCount(0);
});

test('the Prizes tab hides for a player with no tokens and no prizes', async ({
  page,
  login,
}) => {
  await sql`update player set prize_tokens = 0 where id = ${seed.colin.playerId}`;
  await login();
  await expect(
    page.locator('nav').getByRole('link', { name: 'Home' }),
  ).toBeVisible();
  await expect(
    page.locator('nav').getByRole('link', { name: 'Prizes' }),
  ).toHaveCount(0);
});
