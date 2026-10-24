import { score, sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  typeNumber,
} from './support/fixtures';
import { seed } from './support/seed';

async function roundPhase() {
  const [row] = await sql<{ round_phase: string }[]>`
    select round_phase from game_state`;
  return row.round_phase;
}

test('the GM enters a turn of moves and the game moves to special space events', async ({
  page,
  login,
  secondPhone,
}) => {
  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Enter Gameboard Moves' }).tap();
  await expect(
    page.getByText('Enter gameboard moves for turn 1'),
  ).toBeVisible();

  const players = page
    .getByRole('table')
    .getByRole('rowgroup')
    .nth(1)
    .getByRole('row');
  await expect(players).toHaveCount(seed.playersInSession);
  await expect(
    page.getByRole('button', { name: 'Review Moves' }),
  ).toBeDisabled();
  for (const player of await players.all()) {
    await typeNumber(player.getByRole('spinbutton', { name: 'Dice Roll' }), 3);
    const blueSpace = player.getByRole('group').getByRole('button').first();
    await blueSpace.tap();
  }
  await page.getByRole('button', { name: 'Review Moves' }).tap();
  await expect(page.getByRole('row', { name: 'Colin 3' })).toBeVisible();

  await page.getByRole('button', { name: 'Submit Moves for Round 1' }).tap();
  await expect(confirmDialog(page)).toContainText(
    'Are you sure you want to submit moves for round 1?',
  );
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole('button', { name: 'Proceed to Duel Phase' }),
  ).toBeVisible();
  await expect.poll(roundPhase).toBe('special_space_events');
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 10);
  expect(await score(seed.leo.playerId)).toBe(seed.leo.score + 10);

  const leo = await secondPhone(seed.leo);
  await expect(
    leo.getByText('No special space events for this turn'),
  ).toBeVisible();
  await expect(
    leo.getByRole('table').last().getByRole('row').nth(1),
  ).toHaveText(/Leo\s*80/);
});
