import type { Page } from '@playwright/test';
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

function playerRows(page: Page) {
  return page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row');
}

async function enterThreeBlueSpacesForEveryone(
  page: Page,
  players: number = seed.playersInSession,
) {
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Enter Gameboard Moves' }).tap();
  await expect(
    page.getByText('Enter gameboard moves for turn 1'),
  ).toBeVisible();

  await expect(playerRows(page)).toHaveCount(players);
  await expect(
    page.getByRole('button', { name: 'Review Moves' }),
  ).toBeDisabled();
  for (const player of await playerRows(page).all()) {
    await typeNumber(player.getByRole('spinbutton', { name: 'Dice Roll' }), 3);
    const blueSpace = player.getByRole('group').getByRole('button').first();
    await blueSpace.tap();
  }
}

async function reviewThreeBlueSpacesForEveryone(
  page: Page,
  players: number = seed.playersInSession,
) {
  await enterThreeBlueSpacesForEveryone(page, players);
  await page.getByRole('button', { name: 'Review Moves' }).tap();
  await expect(page.getByRole('row', { name: 'Colin 3' })).toBeVisible();
}

function logRoundMovesRequests(page: Page): { roundnumber: number }[] {
  const bodies: { roundnumber: number }[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/rpc/log_round_moves')) {
      bodies.push(request.postDataJSON());
    }
  });
  return bodies;
}

async function expectMoveEntry(page: Page, turn: number) {
  await expect(page).toHaveURL(/\/gm-tools\/space-entry$/);
  await expect(
    page.getByText(`Enter gameboard moves for turn ${turn}`),
  ).toBeVisible();
}

async function submitMoves(page: Page, answer: 'Yes' | 'No') {
  await page.getByRole('button', { name: 'Submit Moves for Round 1' }).tap();
  await expect(confirmDialog(page)).toContainText(
    'Are you sure you want to submit moves for round 1?',
  );
  await confirmDialog(page).getByRole('button', { name: answer }).tap();
}

test('the GM enters a turn of moves and the game moves to special space events', async ({
  page,
  login,
  secondPhone,
}) => {
  await login();
  await reviewThreeBlueSpacesForEveryone(page);
  await submitMoves(page, 'Yes');

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

test('Back after submitting the moves returns the GM to GM Tools', async ({
  page,
  login,
}) => {
  await login();
  await reviewThreeBlueSpacesForEveryone(page);
  await submitMoves(page, 'Yes');
  await expect(page).toHaveURL(/\/home$/);

  await page.goBack();

  await expect(page).toHaveURL(/\/gm-tools$/);
  await expect(
    page.getByRole('link', { name: 'Resolve Special Space Events' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit Moves for Round 1' }),
  ).toHaveCount(0);
});

test('cancelling the submit keeps the moves the GM entered', async ({
  page,
  login,
}) => {
  await login();
  await reviewThreeBlueSpacesForEveryone(page);
  await submitMoves(page, 'No');

  await page.reload();

  await expect(playerRows(page)).toHaveCount(seed.playersInSession);
  await expect(playerRows(page).locator('td:nth-child(2)')).toHaveText(
    Array(seed.playersInSession).fill('3'),
  );
  await expect.poll(roundPhase).toBe('gameboard_moves');
});

test('the moves review with no saved moves sends the GM to move entry', async ({
  page,
  login,
}) => {
  await login();

  await page.goto('/gm-tools/space-entry/review');

  await expectMoveEntry(page, 1);
  await expect(
    page.getByRole('button', { name: 'Submit Moves for Round 1' }),
  ).toHaveCount(0);
});

test('the moves review sends the GM to move entry when a player joined after the moves were saved', async ({
  page,
  login,
}) => {
  await sql`update player set enabled = false where id = 115`;
  await login();
  await reviewThreeBlueSpacesForEveryone(page, seed.playersInSession - 1);

  await sql`update player set enabled = true where id = 115`;
  await page.reload();

  await expectMoveEntry(page, 1);
  await expect(playerRows(page)).toHaveCount(seed.playersInSession);
  await expect(
    page.getByRole('button', { name: 'Review Moves' }),
  ).toBeDisabled();
});

test('moves left from a rejected submit are not offered for the next turn', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(/Failed to load resource.*400/);
  const submits = logRoundMovesRequests(page);
  await login();
  await reviewThreeBlueSpacesForEveryone(page);
  await sql`select log_round_moves(${sql.json({
    [seed.colin.playerId]: { gameboardSpaceId: 32, distanceTraveled: 1 },
  })}::json, 1)`;
  await submitMoves(page, 'Yes');
  await expect(
    page.getByText('Round 1 is not waiting for gameboard moves'),
  ).toBeVisible();
  await sql`update game_state
    set round_number = 2, round_phase = 'gameboard_moves' where id = 1`;

  await page.goto('/gm-tools/space-entry');
  await expectMoveEntry(page, 2);
  await expect(
    playerRows(page).first().getByRole('spinbutton', { name: 'Dice Roll' }),
  ).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Review Moves' }),
  ).toBeDisabled();

  await page.goto('/gm-tools/space-entry/review');
  await expectMoveEntry(page, 2);
  expect(submits.map((body) => body.roundnumber)).toEqual([1]);
});

test('the moves review stays put with an error when the round cannot be read', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(
    /Failed to load resource|access control checks|net::ERR_FAILED/,
  );
  await login();
  await enterThreeBlueSpacesForEveryone(page);
  await page.route('**/rest/v1/game_state?*', (route) => route.abort());

  await page.getByRole('button', { name: 'Review Moves' }).tap();

  await expect(page.getByText('Error', { exact: true })).toBeVisible();
  await expectMoveEntry(page, 1);
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
  const teamScores = { 1349: 10, 1350: 0 };
  await sql`select end_round(1, ${sql.json(teamScores)})`;
  await expect(
    sql`select end_round(1, ${sql.json(teamScores)})`,
  ).rejects.toThrow('Round 1 is not waiting for event results');
  expect(await roundScoreRows(seed.colin.playerId)).toBe(1);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 20);
});

async function setRoundPhase(phase: string) {
  await sql`update game_state set round_phase = ${phase} where id = 1`;
}

type Move = {
  gameboardSpaceId: number;
  distanceTraveled: number;
  chancePointsAmount?: number;
};

async function logMoves(moves: Record<number, Move>) {
  await sql`select log_round_moves(${sql.json(moves)}::json, 1)`;
}

async function endRound(teamScores: Record<number, number>) {
  await sql`select end_round(1, ${sql.json(teamScores)})`;
}

async function transactions(playerId: number, description: string) {
  const rows = await sql<{ num_points: string }[]>`
    select num_points from transaction
    where player_id = ${playerId} and description = ${description}
    order by id`;
  return rows.map((row) => Number(row.num_points));
}

test('a GM replay of the gameboard moves replaces the earlier move', async () => {
  await logMoves({
    [seed.colin.playerId]: { gameboardSpaceId: 32, distanceTraveled: 3 },
  });
  await setRoundPhase('gameboard_moves');
  await logMoves({
    [seed.colin.playerId]: {
      gameboardSpaceId: 36,
      distanceTraveled: 5,
      chancePointsAmount: 7,
    },
  });

  expect(
    await transactions(seed.colin.playerId, 'Blue Space on turn 1'),
  ).toEqual([10]);
  expect(
    await transactions(seed.colin.playerId, 'Test Space on turn 1'),
  ).toEqual([7]);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 17);
  const moves = await sql`
    select gameboard_space_id, distance_traveled from gameboard_move
    where player_id = ${seed.colin.playerId} and round_number = 1`;
  expect([...moves]).toEqual([
    { gameboard_space_id: '36', distance_traveled: 5 },
  ]);
});

test('a GM replay of the event results replaces the earlier round score', async () => {
  await setRoundPhase('event');
  await endRound({ 1349: 10, 1350: 0 });
  await setRoundPhase('event');
  await endRound({ 1349: 5, 1350: 0 });

  expect(
    await transactions(seed.colin.playerId, 'Points earned from Magic school'),
  ).toEqual([30, 10, 5]);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 15);
  const roundScores = await sql`
    select score from player_round_score
    where player_id = ${seed.colin.playerId} and round_number = 1`;
  expect([...roundScores]).toEqual([{ score: String(seed.colin.score + 15) }]);
});

test('a GM replay of the gameboard moves settles a bet placed after the first submit', async () => {
  await logMoves({
    [seed.colin.playerId]: { gameboardSpaceId: 32, distanceTraveled: 3 },
  });
  const [bet] = await sql<{ id: string }[]>`
    insert into bet (session_id, requester_player_id, opponent_player_id,
      requester_wager, opponent_wager, description, status, bet_type, details)
    values (${seed.sessionId}, ${seed.leo.playerId}, ${seed.josh.playerId},
      5, 5, 'Colin will land on a(n) Red space next', 'pending_acceptance',
      'gameboard_move', ${sql.json({ playerId: seed.colin.playerId, gameboardSpaceId: 33 })})
    returning id`;
  await sql`select submit_bet_accepted(${bet.id})`;

  await setRoundPhase('gameboard_moves');
  await logMoves({
    [seed.colin.playerId]: { gameboardSpaceId: 33, distanceTraveled: 4 },
  });

  const [settled] = await sql<{ status: string }[]>`
    select status from bet where id = ${bet.id}`;
  expect(settled.status).toBe('requester_won');
  expect(await score(seed.leo.playerId)).toBe(seed.leo.score + 5);
  expect(await score(seed.josh.playerId)).toBe(seed.josh.score - 5);
});
