import { score, sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  typeNumber,
} from './support/fixtures';
import { seed } from './support/seed';

const round = 2;

test.beforeEach(async () => {
  await sql`update game_state set round_number = ${round} where id = 1`;
});

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
    page.getByText(`Enter gameboard moves for turn ${round}`),
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

  await page
    .getByRole('button', { name: `Submit Moves for Round ${round}` })
    .tap();
  await expect(confirmDialog(page)).toContainText(
    `Are you sure you want to submit moves for round ${round}?`,
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

test('Move Entry shows a duel the GM made by hand as already created', async ({
  page,
  login,
}) => {
  await sql`select log_round_moves(${sql.json({
    [seed.josh.playerId]: { gameboardSpaceId: 34, distanceTraveled: 3 },
  })}::json, ${round})`;
  await sql`update game_state set round_phase = 'gameboard_moves' where id = 1`;
  await sql`
    insert into duel (session_id, round_number, challenger_player_id,
      opponent_player_id, duel_space_id, status)
    values (${seed.sessionId}, ${round}, ${seed.colin.playerId},
      ${seed.leo.playerId}, 34, 'wager_not_selected')`;

  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Enter Gameboard Moves' }).tap();
  const row = (name: string) =>
    page
      .getByRole('table')
      .getByRole('rowgroup')
      .nth(1)
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name, exact: true }) });
  await expect(
    row('Colin').getByRole('checkbox', { name: 'Duel?' }),
  ).toBeChecked();
  await expect(page.locator('joshies-new-duel')).toHaveCount(0);
  await expect(
    row('Josh').getByRole('checkbox', { name: 'Duel?' }),
  ).not.toBeChecked();
});

async function roundScoreRows(playerId: number) {
  const [row] = await sql<{ count: string }[]>`
    select count(*) from player_round_score
    where player_id = ${playerId} and round_number = ${round}`;
  return Number(row.count);
}

async function addEventTeam(playerIds: number[]) {
  const [team] = await sql<{ id: string }[]>`
    insert into event_team (event_id)
    select id from event
    where session_id = ${seed.sessionId} and round_number = ${round}
    returning id`;
  for (const playerId of playerIds) {
    await sql`insert into event_participant (team_id, player_id)
      values (${team.id}, ${playerId})`;
  }
  return Number(team.id);
}

test('a second submit of the same round is rejected and logs nothing', async () => {
  const moves = {
    [seed.colin.playerId]: { gameboardSpaceId: 32, distanceTraveled: 3 },
  };
  await sql`select log_round_moves(${sql.json(moves)}::json, ${round})`;
  await expect(
    sql`select log_round_moves(${sql.json(moves)}::json, ${round})`,
  ).rejects.toThrow(`Round ${round} is not waiting for gameboard moves`);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 10);

  await sql`update game_state set round_phase = 'event'`;
  const teamScores = { [await addEventTeam([seed.colin.playerId])]: 10 };
  await sql`select end_round(${round}, ${sql.json(teamScores)})`;
  await expect(
    sql`select end_round(${round}, ${sql.json(teamScores)})`,
  ).rejects.toThrow(`Round ${round} is not waiting for event results`);
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
  await sql`select log_round_moves(${sql.json(moves)}::json, ${round})`;
}

async function endRound(teamScores: Record<number, number>) {
  await sql`select end_round(${round}, ${sql.json(teamScores)})`;
}

async function transactions(playerId: number, description: string) {
  const rows = await sql<{ num_points: string }[]>`
    select num_points from transaction
    where player_id = ${playerId} and description = ${description}
    order by id`;
  return rows.map((row) => Number(row.num_points));
}

test('a GM replay of the gameboard moves replaces the earlier move and its points', async () => {
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
    await transactions(seed.colin.playerId, `Blue Space on turn ${round}`),
  ).toEqual([]);
  expect(
    await transactions(seed.colin.playerId, `Test Space on turn ${round}`),
  ).toEqual([7]);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 7);
  const moves = await sql`
    select gameboard_space_id, distance_traveled from gameboard_move
    where player_id = ${seed.colin.playerId} and round_number = ${round}`;
  expect([...moves]).toEqual([
    { gameboard_space_id: '36', distance_traveled: 5 },
  ]);
});

test('a GM replay of the event results replaces the earlier event points and round score', async () => {
  const team = await addEventTeam([seed.colin.playerId]);
  await setRoundPhase('event');
  await endRound({ [team]: 10 });
  await setRoundPhase('event');
  await endRound({ [team]: 5 });

  expect(
    await transactions(seed.colin.playerId, 'Points earned from Ping Pong'),
  ).toEqual([5]);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 5);
  const roundScores = await sql`
    select score from player_round_score
    where player_id = ${seed.colin.playerId} and round_number = ${round}`;
  expect([...roundScores]).toEqual([{ score: String(seed.colin.score + 5) }]);
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
