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

async function roundScoreRows(playerId: number) {
  const [row] = await sql<{ count: string }[]>`
    select count(*) from player_round_score
    where player_id = ${playerId} and round_number = 1`;
  return Number(row.count);
}

test('a second submit of the same round is rejected and logs nothing', async () => {
  const moves = {
    [seed.colin.playerId]: { gameboardSpaceId: 32, distanceTraveled: 3 },
  };
  await sql`select log_round_moves(${sql.json(moves)}::json, 1)`;
  await expect(
    sql`select log_round_moves(${sql.json(moves)}::json, 1)`,
  ).rejects.toThrow('Round 1 is not waiting for gameboard moves');
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 10);

  await sql`update game_state set round_phase = 'event'`;
  const before = await roundScoreRows(seed.colin.playerId);
  const teamScores = { 1349: 10, 1350: 0 };
  await sql`select end_round(1, ${sql.json(teamScores)})`;
  await expect(
    sql`select end_round(1, ${sql.json(teamScores)})`,
  ).rejects.toThrow('Round 1 is not waiting for event results');
  expect(await roundScoreRows(seed.colin.playerId)).toBe(before + 1);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 20);
});
