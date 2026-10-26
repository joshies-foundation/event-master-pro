import { connect, resetDatabase, sql } from './support/db';
import { confirmDialog, expect, openTab, test } from './support/fixtures';
import { seed } from './support/seed';

const round = 2;
const space = { blue: 32, red: 33, duel: 34, bank: 35 };
const firstUnseededId = { transaction: 989, bet: 159 };
const colin = seed.colin.playerId;
const leo = seed.leo.playerId;
const josh = seed.josh.playerId;
const olivia = 110;
const molly = 111;
const leo2 = 112;

type Moves = Record<number, { gameboardSpaceId: number }>;
type BetDetails = Record<string, number | string | boolean>;

async function setRoundPhase(phase: string, roundNumber = round) {
  await sql`update game_state set round_number = ${roundNumber},
    round_phase = ${phase} where id = 1`;
}

async function addSpace(name: string, effect: string) {
  const [row] = await sql<{ id: string }[]>`
    insert into gameboard_space (session_id, name, effect)
    values (${seed.sessionId}, ${name}, ${effect}) returning id`;
  return Number(row.id);
}

async function logMoves(moves: Moves, roundNumber = round) {
  const withDistance = Object.fromEntries(
    Object.entries(moves).map(([player, move]) => [
      player,
      { ...move, distanceTraveled: 4 },
    ]),
  );
  await sql`select log_round_moves(${sql.json(withDistance)}::json, ${roundNumber})`;
}

async function endRound(
  teamScores: Record<number, number>,
  roundNumber = round,
) {
  const [row] = await sql<{ result: { token_recipient_user_ids: string[] } }[]>`
    select end_round(${roundNumber}, ${sql.json(teamScores)}) as result`;
  return [...row.result.token_recipient_user_ids].sort();
}

async function placeBet(bet: {
  requester: number;
  opponent: number;
  description: string;
  betType: string;
  details: BetDetails;
  accept: boolean;
}) {
  const [row] = await sql<{ id: string }[]>`
    insert into bet (session_id, requester_player_id, opponent_player_id,
      requester_wager, opponent_wager, description, status, bet_type, details)
    values (${seed.sessionId}, ${bet.requester}, ${bet.opponent}, 5, 5,
      ${bet.description}, 'pending_acceptance', ${bet.betType},
      ${sql.json(bet.details)})
    returning id`;
  if (bet.accept) await sql`select submit_bet_accepted(${row.id})`;
  return row.id;
}

async function placeMoveBet(
  description: string,
  playerId: number,
  gameboardSpaceId: number,
) {
  await placeBet({
    requester: leo,
    opponent: josh,
    description,
    betType: 'gameboard_move',
    details: { playerId, gameboardSpaceId },
    accept: true,
  });
}

async function addEventTeams() {
  const event = await sql<{ id: string }[]>`
    select id from event
    where session_id = ${seed.sessionId} and round_number = ${round}`;
  const teams: number[] = [];
  for (const members of [
    [colin, leo, leo2],
    [josh, olivia],
  ]) {
    const [team] = await sql<{ id: string }[]>`
      insert into event_team (event_id) values (${event[0].id}) returning id`;
    for (const playerId of members) {
      await sql`insert into event_participant (team_id, player_id)
        values (${team.id}, ${playerId})`;
    }
    teams.push(Number(team.id));
  }
  return teams;
}

async function sessionState(roundNumber = round) {
  const players = await sql`
    select id, score, prize_tokens from player
    where session_id = ${seed.sessionId} order by id`;
  const [session] = await sql<{ bank_balance: string }[]>`
    select bank_balance from session where id = ${seed.sessionId}`;
  const moves = await sql`
    select gm.player_id, gm.gameboard_space_id from gameboard_move gm
    join player p on p.id = gm.player_id
    where p.session_id = ${seed.sessionId} and gm.round_number = ${roundNumber}
    order by gm.player_id`;
  const spaceEvents = await sql`
    select 'duel' as kind, challenger_player_id as player_id,
      duel_space_id as space_id, status::text from duel
    where session_id = ${seed.sessionId} and round_number = ${roundNumber}
    union all
    select 'special', player_id, special_space_id, status::text
    from special_space_event
    where session_id = ${seed.sessionId} and round_number = ${roundNumber}
    union all
    select 'chaos', player_id, chaos_space_id, status::text
    from chaos_space_event
    where session_id = ${seed.sessionId} and round_number = ${roundNumber}
    order by 1, 2`;
  const roundScores = await sql`
    select s.player_id, s.score from player_round_score s
    join player p on p.id = s.player_id
    where p.session_id = ${seed.sessionId} and s.round_number = ${roundNumber}
    order by s.player_id`;
  const transactions = await sql`
    select player_id, num_points, description from transaction
    where id >= ${firstUnseededId.transaction} order by player_id, description, num_points`;
  const bets = await sql`
    select description, status::text from bet
    where session_id = ${seed.sessionId} and id >= ${firstUnseededId.bet} order by id`;
  return {
    players: [...players],
    bankBalance: session.bank_balance,
    moves: [...moves],
    spaceEvents: [...spaceEvents],
    roundScores: [...roundScores],
    transactions: [...transactions],
    bets: [...bets],
  };
}

function playerChanges(
  state: Awaited<ReturnType<typeof sessionState>>,
  before: Awaited<ReturnType<typeof sessionState>>,
) {
  return Object.fromEntries(
    state.players.flatMap((player, i) => {
      const scoreChange =
        Number(player['score']) - Number(before.players[i]['score']);
      const tokenChange =
        Number(player['prize_tokens']) -
        Number(before.players[i]['prize_tokens']);
      return scoreChange || tokenChange
        ? [[player['id'], { score: scoreChange, tokens: tokenChange }]]
        : [];
    }),
  );
}

test('a GM replay of the gameboard moves ends as if the GM had submitted the replay alone', async () => {
  const moves = (
    replayed: boolean,
    { star, chaos }: { star: number; chaos: number },
  ): Moves => {
    const firstSubmitOnly: Moves = replayed
      ? {}
      : { [leo2]: { gameboardSpaceId: space.blue } };
    return {
      [colin]: { gameboardSpaceId: replayed ? space.blue : space.duel },
      [leo]: { gameboardSpaceId: star },
      [josh]: { gameboardSpaceId: replayed ? space.duel : chaos },
      [olivia]: { gameboardSpaceId: replayed ? space.bank : space.red },
      [molly]: { gameboardSpaceId: space.red },
      ...firstSubmitOnly,
    };
  };
  const start = async () => {
    await setRoundPhase('gameboard_moves');
    await sql`update session set bank_balance = 25 where id = ${seed.sessionId}`;
    const star = await addSpace('Star', 'special');
    const chaos = await addSpace('Chaos', 'chaos');
    await placeMoveBet(
      'Colin will land on a(n) Duel space next',
      colin,
      space.duel,
    );
    await placeMoveBet(
      'Leo 2 will land on a(n) Blue space next',
      leo2,
      space.blue,
    );
    return { star, chaos };
  };

  const spaces = await start();
  const before = await sessionState();
  await logMoves(moves(true, spaces));
  const once = await sessionState();

  await resetDatabase();
  const replaySpaces = await start();
  await logMoves(moves(false, replaySpaces));
  await setRoundPhase('gameboard_moves');
  await logMoves(moves(true, replaySpaces));
  const replay = await sessionState();

  expect(playerChanges(replay, before)).toEqual({
    [olivia]: { score: 25, tokens: 0 },
    [molly]: { score: -10, tokens: 0 },
    [josh]: { score: 10, tokens: 0 },
    [colin]: { score: 10, tokens: 0 },
  });
  expect(replay.bankBalance).toBe('0');
  expect(replay.moves).toHaveLength(5);
  expect(replay.spaceEvents).toEqual([
    {
      kind: 'duel',
      player_id: String(josh),
      space_id: String(space.duel),
      status: 'opponent_not_selected',
    },
    {
      kind: 'special',
      player_id: String(leo),
      space_id: String(spaces.star),
      status: 'event_not_selected',
    },
  ]);
  expect(replay.bets).toEqual([
    {
      description: 'Colin will land on a(n) Duel space next',
      status: 'opponent_won',
    },
    {
      description: 'Leo 2 will land on a(n) Blue space next',
      status: 'active',
    },
  ]);
  expect(replay.transactions).toHaveLength(8);
  expect(replay).toEqual(once);
});

test('a GM replay of the event results ends as if the GM had submitted the replay alone', async () => {
  const start = async () => {
    await setRoundPhase('event');
    return addEventTeams();
  };

  const [first, second] = await start();
  const before = await sessionState();
  const onceRecipients = await endRound({ [first]: 0, [second]: 10 });
  const once = await sessionState();

  await resetDatabase();
  await start();
  await endRound({ [first]: 10, [second]: 0 });
  await setRoundPhase('event');
  const replayRecipients = await endRound({ [first]: 0, [second]: 10 });
  const replay = await sessionState();

  expect(playerChanges(replay, before)).toEqual({
    [olivia]: { score: 10, tokens: 1 },
    [josh]: { score: 10, tokens: 1 },
  });
  expect(replay.roundScores).toHaveLength(5);
  expect(replay.transactions).toHaveLength(5);
  const winners = await sql<{ user_id: string }[]>`
    select user_id from player where id in (${josh}, ${olivia})
    order by user_id`;
  expect(replayRecipients).toEqual(winners.map((row) => row.user_id));
  expect(replayRecipients).toEqual(onceRecipients);
  expect(replay).toEqual(once);
});

test('a GM replay of the gameboard moves after the event takes the duel wager from the scores before the round', async ({
  page,
  login,
}) => {
  test.slow();
  await setRoundPhase('gameboard_moves');
  const [first, second] = await addEventTeams();
  const before = await sessionState();
  await login();

  const submitMoves = async () => {
    await setRoundPhase('gameboard_moves');
    await logMoves({
      [colin]: { gameboardSpaceId: space.duel },
      [molly]: { gameboardSpaceId: space.blue },
    });
  };
  const resolveDuel = async (expectedRows: RegExp[]) => {
    await sql`update duel set opponent_player_id = ${molly},
      wager_percentage = 20, game_name = 'Ping Pong', status = 'in_progress'
      where session_id = ${seed.sessionId} and round_number = ${round}`;
    await setRoundPhase('duels');
    await openTab(page, 'GM Tools');
    await page.getByRole('link', { name: 'Resolve Duels' }).tap();
    await page.getByRole('row').filter({ hasText: 'In Progress' }).tap();
    await page
      .locator('label')
      .filter({ hasText: 'Winner:' })
      .getByText('Molly')
      .tap();
    const rows = page
      .getByRole('table')
      .getByRole('rowgroup')
      .nth(1)
      .getByRole('row');
    await expect.soft(rows).toHaveText(expectedRows);
    await page.getByRole('button', { name: 'Submit Results' }).tap();
    await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
    await expect(page).toHaveURL(/\/resolve-duels$/);
    await setRoundPhase('event');
    await endRound({ [first]: 30, [second]: 0 });
  };

  await submitMoves();
  await resolveDuel([/Colin\s*33\s*-7/, /Molly\s*50\s*\+7/]);
  await submitMoves();
  const midReplay = await sessionState();
  expect
    .soft(
      playerChanges(midReplay, before),
      'event points and tokens taken back',
    )
    .toEqual({ [molly]: { score: 10, tokens: 0 } });
  expect.soft(midReplay.roundScores).toEqual([]);
  await page.reload();
  await resolveDuel([/Colin\s*33\s*-7/, /Molly\s*50\s*\+7/]);
  const replay = await sessionState();

  expect(playerChanges(replay, before)).toEqual({
    [leo]: { score: 30, tokens: 1 },
    [molly]: { score: 17, tokens: 0 },
    [leo2]: { score: 30, tokens: 1 },
    [colin]: { score: 23, tokens: 1 },
  });
  expect(
    pointsByPlayer(replay).filter(([player]) =>
      [colin, molly].includes(player),
    ),
  ).toEqual([
    [molly, 10],
    [molly, 7],
    [colin, -7],
    [colin, 30],
  ]);
  expect(replay.roundScores).toEqual(
    [
      [leo, 100],
      [olivia, 51],
      [leo2, 20],
      [josh, 40],
      [colin, 56],
    ].map(([player, score]) => ({
      player_id: String(player),
      score: String(score),
    })),
  );
});

test('a GM replay of the gameboard moves takes back a finished duel and refunds the bet on it', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  await logMoves({ [josh]: { gameboardSpaceId: space.blue } });
  const once = await sessionState();

  await resetDatabase();
  await setRoundPhase('gameboard_moves');
  await logMoves({ [josh]: { gameboardSpaceId: space.duel } });
  const [duel] = await sql<{ id: string }[]>`
    update duel set opponent_player_id = ${molly}, game_name = 'Ping Pong',
      status = 'waiting_to_begin'
    where session_id = ${seed.sessionId} and round_number = ${round}
    returning id`;
  const [bet] = await sql<{ id: string }[]>`
    insert into bet (session_id, requester_player_id, opponent_player_id,
      requester_wager, opponent_wager, description, status, bet_type, details)
    values (${seed.sessionId}, ${leo}, ${colin}, 5, 5,
      'Josh will win the duel', 'pending_acceptance', 'duel',
      ${sql.json({ duelId: Number(duel.id), challengerWins: true })})
    returning id`;
  await sql`select submit_bet_accepted(${bet.id})`;
  await sql`select submit_duel_results(${duel.id}, true,
    ${sql.json({ [josh]: 10, [molly]: -10 })}::json)`;
  await sql`select submit_bet_requester_won(${bet.id})`;
  await setRoundPhase('gameboard_moves');
  await logMoves({ [josh]: { gameboardSpaceId: space.blue } });
  const replay = await sessionState();

  expect(playerChanges(replay, before)).toEqual({
    [josh]: { score: 10, tokens: 0 },
  });
  expect(replay.spaceEvents).toEqual([]);
  expect(replay.bets).toEqual([
    { description: 'Josh will win the duel', status: 'canceled_by_gm' },
  ]);
  expect(
    replay.transactions.map((row) => [
      Number(row['player_id']),
      Number(row['num_points']),
    ]),
  ).toEqual([
    [leo, 5],
    [leo, -5],
    [josh, 10],
    [colin, 5],
    [colin, -5],
  ]);
  expect({ ...replay, bets: [], transactions: [] }).toEqual({
    ...once,
    transactions: [],
  });
});

test('a replay takes back an unspent prize token and leaves a spent one and its prize', async () => {
  await setRoundPhase('event');
  const [first, second] = await addEventTeams();
  await endRound({ [first]: 10, [second]: 0 });
  const [prize] = await sql<{ id: string }[]>`
    select (spin_prize_machine(${leo2})).id`;

  await setRoundPhase('event');
  expect(await endRound({ [first]: 10, [second]: 0 })).toEqual([]);
  const tokensAfterSameWinners = await sql`
    select id, prize_tokens from player where id in (${colin}, ${leo2})
    order by id`;
  expect([...tokensAfterSameWinners]).toEqual([
    { id: String(leo2), prize_tokens: 0 },
    { id: String(colin), prize_tokens: 2 },
  ]);

  await setRoundPhase('event');
  await endRound({ [first]: 0, [second]: 10 });
  const tokens = await sql`
    select id, prize_tokens from player where id in (${colin}, ${leo2})
    order by id`;
  expect([...tokens]).toEqual([
    { id: String(leo2), prize_tokens: 0 },
    { id: String(colin), prize_tokens: 1 },
  ]);
  const [won] = await sql<{ won_by_player_id: string }[]>`
    select won_by_player_id from prize where id = ${prize.id}`;
  expect(won.won_by_player_id).toBe(String(leo2));
});

test('a GM replay of the gameboard moves puts back the bank the first submit paid out', async () => {
  const start = async () => {
    await setRoundPhase('gameboard_moves');
    await sql`update session set bank_balance = 25 where id = ${seed.sessionId}`;
    return addSpace('Star', 'special');
  };
  const replayMoves: Moves = {
    [leo]: { gameboardSpaceId: space.blue },
    [olivia]: { gameboardSpaceId: space.red },
    [molly]: { gameboardSpaceId: space.red },
  };

  await start();
  const before = await sessionState();
  await logMoves(replayMoves);
  const once = await sessionState();

  await resetDatabase();
  const star = await start();
  await logMoves({
    [leo]: { gameboardSpaceId: star },
    [olivia]: { gameboardSpaceId: space.bank },
    [molly]: { gameboardSpaceId: space.red },
  });
  const [event] = await sql<{ id: string }[]>`
    select id from special_space_event
    where session_id = ${seed.sessionId} and round_number = ${round}`;
  await sql`select submit_space_event_player_score_changes(${event.id}, null,
    ${sql.json({ [josh]: -5 })}::json, 'Lost a race', false, true)`;
  await setRoundPhase('gameboard_moves');
  await logMoves(replayMoves);
  const replay = await sessionState();

  expect(replay.bankBalance).toBe('45');
  expect(playerChanges(replay, before)).toEqual({
    [leo]: { score: 10, tokens: 0 },
    [olivia]: { score: -10, tokens: 0 },
    [molly]: { score: -10, tokens: 0 },
  });
  expect(replay.spaceEvents).toEqual([]);
  expect(replay.transactions).toHaveLength(3);
  expect(replay).toEqual(once);
});

test('a GM replay of the gameboard moves leaves a bet the GM canceled canceled', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  await placeMoveBet(
    'Leo 2 will land on a(n) Blue space next',
    leo2,
    space.blue,
  );
  await logMoves({ [leo2]: { gameboardSpaceId: space.blue } });
  await sql`select submit_bet_canceled_by_gm(id) from bet
    where id >= ${firstUnseededId.bet}`;

  await setRoundPhase('gameboard_moves');
  await logMoves({ [colin]: { gameboardSpaceId: space.blue } });
  const replay = await sessionState();

  expect(replay.bets).toEqual([
    {
      description: 'Leo 2 will land on a(n) Blue space next',
      status: 'canceled_by_gm',
    },
  ]);
  expect(playerChanges(replay, before)).toEqual({
    [colin]: { score: 10, tokens: 0 },
  });
});

function pointsByPlayer(state: Awaited<ReturnType<typeof sessionState>>) {
  return state.transactions.map((row) => [
    Number(row['player_id']),
    Number(row['num_points']),
  ]);
}

test('a GM replay of the gameboard moves pays out a move bet that the first submit settled as lost', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  await placeMoveBet(
    'Leo 2 will land on a(n) Blue space next',
    leo2,
    space.blue,
  );
  await logMoves({ [leo2]: { gameboardSpaceId: space.red } });
  expect((await sessionState()).bets).toEqual([
    {
      description: 'Leo 2 will land on a(n) Blue space next',
      status: 'opponent_won',
    },
  ]);

  await setRoundPhase('gameboard_moves');
  await logMoves({ [leo2]: { gameboardSpaceId: space.blue } });
  const replay = await sessionState();

  expect(replay.bets).toEqual([
    {
      description: 'Leo 2 will land on a(n) Blue space next',
      status: 'requester_won',
    },
  ]);
  expect(playerChanges(replay, before)).toEqual({
    [leo]: { score: 5, tokens: 0 },
    [leo2]: { score: 10, tokens: 0 },
    [josh]: { score: -5, tokens: 0 },
  });
  expect(replay.bankBalance).toBe('0');
  expect(pointsByPlayer(replay)).toEqual([
    [leo, -5],
    [leo, 10],
    [leo2, 10],
    [josh, -5],
  ]);
});

test('a GM replay of the gameboard moves cancels the open bets on a duel it takes back', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  await logMoves({ [josh]: { gameboardSpaceId: space.duel } });
  const [duel] = await sql<{ id: string }[]>`
    update duel set opponent_player_id = ${molly}, game_name = 'Ping Pong',
      status = 'waiting_to_begin'
    where session_id = ${seed.sessionId} and round_number = ${round}
    returning id`;
  await placeBet({
    requester: leo,
    opponent: colin,
    description: 'Josh will win the duel',
    betType: 'duel',
    details: { duelId: Number(duel.id), challengerWins: true },
    accept: true,
  });
  await placeBet({
    requester: leo2,
    opponent: olivia,
    description: 'Molly will win the duel',
    betType: 'duel',
    details: { duelId: Number(duel.id), challengerWins: false },
    accept: false,
  });

  await setRoundPhase('gameboard_moves');
  await logMoves({ [josh]: { gameboardSpaceId: space.blue } });
  const replay = await sessionState();

  expect(replay.spaceEvents).toEqual([]);
  expect(replay.bets).toEqual([
    { description: 'Josh will win the duel', status: 'canceled_by_gm' },
    { description: 'Molly will win the duel', status: 'canceled_by_gm' },
  ]);
  expect(playerChanges(replay, before)).toEqual({
    [josh]: { score: 10, tokens: 0 },
  });
  expect(pointsByPlayer(replay)).toEqual([
    [leo, 5],
    [leo, -5],
    [josh, 10],
    [colin, 5],
    [colin, -5],
  ]);
});

test('a GM replay of the gameboard moves cancels an open special space bet and takes back a settled chaos space bet', async () => {
  await setRoundPhase('gameboard_moves');
  await sql`update session set bank_balance = 25 where id = ${seed.sessionId}`;
  const star = await addSpace('Star', 'special');
  const chaos = await addSpace('Chaos', 'chaos');
  const before = await sessionState();
  await logMoves({
    [leo]: { gameboardSpaceId: star },
    [josh]: { gameboardSpaceId: chaos },
  });
  const [special] = await sql<{ id: string }[]>`
    update special_space_event set status = 'waiting_to_begin'
    where session_id = ${seed.sessionId} and round_number = ${round}
    returning id`;
  const [chaosEvent] = await sql<{ id: string }[]>`
    select id from chaos_space_event
    where session_id = ${seed.sessionId} and round_number = ${round}`;
  await placeBet({
    requester: leo2,
    opponent: olivia,
    description: 'Leo will score over 3',
    betType: 'special_space_event',
    details: {
      ssEventId: Number(special.id),
      directionIsOver: true,
      ouValue: 3,
    },
    accept: true,
  });
  await placeBet({
    requester: colin,
    opponent: molly,
    description: 'Over 0.5 players will lose points',
    betType: 'chaos_space_event',
    details: {
      chaosEventId: Number(chaosEvent.id),
      subtype: 'number_of_losers',
      directionIsOver: true,
      ouValue: 0.5,
    },
    accept: true,
  });
  await sql`select submit_space_event_player_score_changes(${chaosEvent.id}, 10,
    ${sql.json({ [molly]: -5 })}::json, 'Fell over', true, true)`;
  expect((await sessionState()).bets.map((bet) => bet['status'])).toEqual([
    'active',
    'requester_won',
  ]);
  expect((await sessionState()).bankBalance).toBe('30');

  await setRoundPhase('gameboard_moves');
  await logMoves({
    [leo]: { gameboardSpaceId: space.blue },
    [josh]: { gameboardSpaceId: space.blue },
  });
  const replay = await sessionState();

  expect(replay.spaceEvents).toEqual([]);
  expect(replay.bets).toEqual([
    { description: 'Leo will score over 3', status: 'canceled_by_gm' },
    {
      description: 'Over 0.5 players will lose points',
      status: 'canceled_by_gm',
    },
  ]);
  expect(playerChanges(replay, before)).toEqual({
    [leo]: { score: 10, tokens: 0 },
    [josh]: { score: 10, tokens: 0 },
  });
  expect(replay.bankBalance).toBe('25');
  expect(pointsByPlayer(replay)).toEqual([
    [leo, 10],
    [olivia, 5],
    [olivia, -5],
    [molly, 5],
    [molly, -5],
    [leo2, 5],
    [leo2, -5],
    [josh, 10],
    [colin, 5],
    [colin, -5],
  ]);
});

test('duels the GM creates by hand survive the first submit and a replay of the moves', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  const [current] = await sql<{ id: string }[]>`
    insert into duel (session_id, round_number, challenger_player_id,
      opponent_player_id, duel_space_id, game_name, status)
    values (${seed.sessionId}, ${round}, ${colin}, ${molly}, ${space.duel},
      'Ping Pong', 'waiting_to_begin')
    returning id`;
  const [next] = await sql<{ id: string }[]>`
    insert into duel (session_id, round_number, challenger_player_id,
      opponent_player_id, duel_space_id, status)
    values (${seed.sessionId}, ${round + 1}, ${josh}, ${leo2}, ${space.duel},
      'wager_not_selected')
    returning id`;
  await placeBet({
    requester: leo,
    opponent: josh,
    description: 'Colin will win the duel',
    betType: 'duel',
    details: { duelId: Number(current.id), challengerWins: true },
    accept: true,
  });

  await logMoves({ [olivia]: { gameboardSpaceId: space.blue } });
  expect((await sessionState()).bets).toEqual([
    { description: 'Colin will win the duel', status: 'active' },
  ]);
  await sql`select submit_duel_results(${current.id}, true,
    ${sql.json({ [colin]: 10, [molly]: -10 })}::json)`;
  await setRoundPhase('gameboard_moves');
  await logMoves({ [olivia]: { gameboardSpaceId: space.red } });
  await setRoundPhase('gameboard_moves', round + 1);
  await logMoves({ [leo2]: { gameboardSpaceId: space.blue } }, round + 1);
  const after = await sessionState();

  expect(after.spaceEvents).toEqual([
    {
      kind: 'duel',
      player_id: String(colin),
      space_id: String(space.duel),
      status: 'challenger_won',
    },
  ]);
  const nextRound =
    await sql`select status::text from duel where id = ${next.id}`;
  expect([...nextRound]).toEqual([{ status: 'wager_not_selected' }]);
  expect(after.bets).toEqual([
    { description: 'Colin will win the duel', status: 'requester_won' },
  ]);
  expect(playerChanges(after, before)).toEqual({
    [leo]: { score: 5, tokens: 0 },
    [olivia]: { score: -10, tokens: 0 },
    [molly]: { score: -10, tokens: 0 },
    [leo2]: { score: 10, tokens: 0 },
    [josh]: { score: -5, tokens: 0 },
    [colin]: { score: 10, tokens: 0 },
  });
  expect(after.bankBalance).toBe('10');
});

const laterRoundRefusal =
  'Round 2 cannot be replayed, because round 3 has been played since. Correct points with Override Points, and set the phase with Override Game State.';

const legacyRoundRefusal =
  'Round 1 was submitted before replays were tracked, so it cannot be replayed. Correct points with Override Points, and set the phase with Override Game State.';

test('a GM replay of gameboard moves submitted before replays were tracked is refused', async () => {
  const before = await sessionState(1);

  await expect(
    logMoves({ [colin]: { gameboardSpaceId: space.blue } }, 1),
  ).rejects.toThrow(legacyRoundRefusal);

  expect(await sessionState(1)).toEqual(before);
  const [state] = await sql`select round_phase::text from game_state`;
  expect(state['round_phase']).toBe('gameboard_moves');
});

test('a GM replay of event results submitted before replays were tracked is refused', async () => {
  await setRoundPhase('event', 1);
  const before = await sessionState(1);

  await expect(endRound({ 1349: 10, 1350: 0 }, 1)).rejects.toThrow(
    legacyRoundRefusal,
  );

  expect(await sessionState(1)).toEqual(before);
  const [state] = await sql`select round_phase::text from game_state`;
  expect(state['round_phase']).toBe('event');
});

test('a GM replay of the gameboard moves keeps a bank balance the GM set after the first submit', async () => {
  await setRoundPhase('gameboard_moves');
  await sql`update session set bank_balance = 10 where id = ${seed.sessionId}`;
  const before = await sessionState();
  const reds: Moves = {
    [olivia]: { gameboardSpaceId: space.red },
    [molly]: { gameboardSpaceId: space.red },
    [leo2]: { gameboardSpaceId: space.red },
  };
  await logMoves(reds);
  expect((await sessionState()).bankBalance).toBe('40');
  await sql`select override_bank_balance(${sql.json({
    sessionId: seed.sessionId,
    change: 5,
    replace: true,
  })}::json)`;

  await setRoundPhase('gameboard_moves');
  await logMoves(reds);
  const replay = await sessionState();

  expect(replay.bankBalance).toBe('5');
  expect(playerChanges(replay, before)).toEqual({
    [olivia]: { score: -10, tokens: 0 },
    [molly]: { score: -10, tokens: 0 },
    [leo2]: { score: -10, tokens: 0 },
  });
  expect(replay.transactions).toHaveLength(3);

  const shortfall =
    'Replaying round 2 would take the bank to -25 points. Raise the bank with Override Bank Balance, then submit again.';
  const bankSpaceShortfall =
    'Replaying round 2 would pay the bank space from a bank of -25 points. Raise the bank with Override Bank Balance, then submit again.';
  await setRoundPhase('gameboard_moves');
  await expect(
    logMoves({
      [olivia]: { gameboardSpaceId: space.blue },
      [molly]: { gameboardSpaceId: space.blue },
      [leo2]: { gameboardSpaceId: space.blue },
    }),
  ).rejects.toThrow(shortfall);
  await expect(
    logMoves({ ...reds, [olivia]: { gameboardSpaceId: space.bank } }),
  ).rejects.toThrow(bankSpaceShortfall);
  expect(await sessionState()).toEqual(replay);
});

test('a GM replay of a round is refused once a later round has been played', async () => {
  await setRoundPhase('gameboard_moves');
  const [first, second] = await addEventTeams();
  await logMoves({ [molly]: { gameboardSpaceId: space.red } });
  await setRoundPhase('event');
  await endRound({ [first]: 10, [second]: 0 });
  await setRoundPhase('gameboard_moves', round + 1);
  await logMoves({ [olivia]: { gameboardSpaceId: space.bank } }, round + 1);
  const played = await sessionState();

  await setRoundPhase('gameboard_moves');
  await expect(
    logMoves({ [molly]: { gameboardSpaceId: space.blue } }),
  ).rejects.toThrow(laterRoundRefusal);
  await setRoundPhase('event');
  await expect(endRound({ [first]: 0, [second]: 10 })).rejects.toThrow(
    laterRoundRefusal,
  );

  expect(await sessionState()).toEqual(played);
});

test('a GM replay of the gameboard moves of a round with no event results is refused once a later round has been played', async () => {
  await setRoundPhase('gameboard_moves');
  await logMoves({ [molly]: { gameboardSpaceId: space.red } });
  await setRoundPhase('gameboard_moves', round + 1);
  await logMoves({ [olivia]: { gameboardSpaceId: space.blue } }, round + 1);
  const played = await sessionState();

  await setRoundPhase('gameboard_moves');
  await expect(
    logMoves({ [molly]: { gameboardSpaceId: space.blue } }),
  ).rejects.toThrow(laterRoundRefusal);
  expect(await sessionState()).toEqual(played);
});

test('a first submit of an earlier round is allowed after a later round, and a replay of it is refused', async () => {
  await setRoundPhase('gameboard_moves', round + 1);
  await logMoves({ [olivia]: { gameboardSpaceId: space.blue } }, round + 1);
  await setRoundPhase('event');
  const [first, second] = await addEventTeams();
  const before = await sessionState();

  await endRound({ [first]: 10, [second]: 0 });
  const played = await sessionState();
  expect(playerChanges(played, before)).toEqual({
    [colin]: { score: 10, tokens: 1 },
    [leo]: { score: 10, tokens: 1 },
    [leo2]: { score: 10, tokens: 1 },
  });

  await setRoundPhase('gameboard_moves');
  await expect(
    logMoves({ [molly]: { gameboardSpaceId: space.red } }),
  ).rejects.toThrow(laterRoundRefusal);
  expect(await sessionState()).toEqual(played);
});

test('event results that a moves replay took back can be submitted after a later round', async () => {
  await setRoundPhase('gameboard_moves');
  const [first, second] = await addEventTeams();
  await logMoves({ [molly]: { gameboardSpaceId: space.red } });
  await setRoundPhase('event');
  await endRound({ [first]: 10, [second]: 0 });
  await setRoundPhase('gameboard_moves');
  await logMoves({ [molly]: { gameboardSpaceId: space.red } });
  await setRoundPhase('gameboard_moves', round + 1);
  await logMoves({ [olivia]: { gameboardSpaceId: space.blue } }, round + 1);
  const before = await sessionState();

  await setRoundPhase('event');
  await endRound({ [first]: 0, [second]: 10 });

  expect(playerChanges(await sessionState(), before)).toEqual({
    [josh]: { score: 10, tokens: 1 },
    [olivia]: { score: 10, tokens: 1 },
  });
});

test('a bet on a duel or space event that a GM replay took back cannot be accepted', async () => {
  await setRoundPhase('gameboard_moves');
  const star = await addSpace('Star', 'special');
  const chaos = await addSpace('Chaos', 'chaos');
  await logMoves({
    [leo]: { gameboardSpaceId: star },
    [josh]: { gameboardSpaceId: space.duel },
    [colin]: { gameboardSpaceId: chaos },
  });
  const [ids] = await sql<
    { duel: string; special: string; chaos: string }[]
  >`select
      (select id from duel where session_id = ${seed.sessionId}
        and round_number = ${round}) as duel,
      (select id from special_space_event where session_id = ${seed.sessionId}
        and round_number = ${round}) as special,
      (select id from chaos_space_event where session_id = ${seed.sessionId}
        and round_number = ${round}) as chaos`;
  await setRoundPhase('gameboard_moves');
  await logMoves({
    [leo]: { gameboardSpaceId: space.blue },
    [josh]: { gameboardSpaceId: space.blue },
    [colin]: { gameboardSpaceId: space.blue },
  });
  const before = await sessionState();

  const staleBets: { betType: string; details: BetDetails }[] = [
    {
      betType: 'duel',
      details: { duelId: Number(ids.duel), challengerWins: true },
    },
    {
      betType: 'special_space_event',
      details: {
        ssEventId: Number(ids.special),
        directionIsOver: true,
        ouValue: 3,
      },
    },
    {
      betType: 'chaos_space_event',
      details: {
        chaosEventId: Number(ids.chaos),
        subtype: 'number_of_losers',
        directionIsOver: true,
        ouValue: 0.5,
      },
    },
  ];
  for (const bet of staleBets) {
    const betId = await placeBet({
      requester: leo2,
      opponent: olivia,
      description: `Stale ${bet.betType} bet`,
      ...bet,
      accept: false,
    });
    await expect(sql`select submit_bet_accepted(${betId})`).rejects.toThrow(
      'The duel or space event for this bet no longer exists. Reject the bet instead.',
    );
  }

  const after = await sessionState();
  expect(after.bets.map((bet) => bet['status'])).toEqual([
    'pending_acceptance',
    'pending_acceptance',
    'pending_acceptance',
  ]);
  expect({ ...after, bets: [] }).toEqual({ ...before, bets: [] });
});

test('a bet the GM canceled cannot be accepted', async () => {
  const betId = await placeBet({
    requester: leo,
    opponent: josh,
    description: 'Colin will land on a(n) Red space next',
    betType: 'gameboard_move',
    details: { playerId: colin, gameboardSpaceId: space.red },
    accept: false,
  });
  await sql`select submit_bet_canceled_by_gm(${betId})`;
  const before = await sessionState();

  await expect(sql`select submit_bet_accepted(${betId})`).rejects.toThrow(
    'This bet is no longer waiting to be accepted.',
  );

  expect(await sessionState()).toEqual(before);
  expect(before.bets.map((bet) => bet['status'])).toEqual(['canceled_by_gm']);
});

test('results for a duel or space event that a GM replay took back are refused', async () => {
  await setRoundPhase('gameboard_moves');
  const star = await addSpace('Star', 'special');
  const chaos = await addSpace('Chaos', 'chaos');
  await logMoves({
    [leo]: { gameboardSpaceId: star },
    [josh]: { gameboardSpaceId: space.duel },
    [colin]: { gameboardSpaceId: chaos },
  });
  const [ids] = await sql<
    { duel: string; special: string; chaos: string }[]
  >`select
      (select id from duel where session_id = ${seed.sessionId}
        and round_number = ${round}) as duel,
      (select id from special_space_event where session_id = ${seed.sessionId}
        and round_number = ${round}) as special,
      (select id from chaos_space_event where session_id = ${seed.sessionId}
        and round_number = ${round}) as chaos`;
  await sql`update duel set opponent_player_id = ${olivia},
    game_name = 'Ping Pong', status = 'in_progress' where id = ${ids.duel}`;
  await setRoundPhase('gameboard_moves');
  await logMoves({
    [leo]: { gameboardSpaceId: space.blue },
    [josh]: { gameboardSpaceId: space.blue },
    [colin]: { gameboardSpaceId: space.blue },
  });
  const before = await sessionState();
  const scoreChanges = sql.json({ [josh]: 5, [olivia]: -5 });

  await expect(
    sql`select submit_duel_results(${ids.duel}, true, ${scoreChanges}::json)`,
  ).rejects.toThrow('This duel no longer exists. Reload the page.');
  await expect(
    sql`select submit_special_space_event_score(${ids.special}, 3)`,
  ).rejects.toThrow('This space event no longer exists. Reload the page.');
  for (const [eventId, isChaos] of [
    [ids.special, false],
    [ids.chaos, true],
  ] as const) {
    await expect(
      sql`select submit_space_event_player_score_changes(${eventId}, null,
        ${scoreChanges}::json, 'Stale results', ${isChaos})`,
    ).rejects.toThrow('This space event no longer exists. Reload the page.');
  }

  expect(await sessionState()).toEqual(before);
});

test("a player on two event teams gets both teams' points and one round score, also on a replay", async () => {
  const event = await sql<{ id: string }[]>`
    select id from event
    where session_id = ${seed.sessionId} and round_number = ${round}`;
  const teams: number[] = [];
  for (const members of [
    [colin, leo],
    [colin, josh],
  ]) {
    const [team] = await sql<{ id: string }[]>`
      insert into event_team (event_id) values (${event[0].id}) returning id`;
    for (const playerId of members) {
      await sql`insert into event_participant (team_id, player_id)
        values (${team.id}, ${playerId})`;
    }
    teams.push(Number(team.id));
  }
  const before = await sessionState();

  await setRoundPhase('event');
  await endRound({ [teams[0]]: 10, [teams[1]]: 4 });
  await setRoundPhase('event');
  await endRound({ [teams[0]]: 3, [teams[1]]: 2 });
  const after = await sessionState();

  expect(playerChanges(after, before)).toMatchObject({
    [colin]: { score: 5 },
    [leo]: { score: 3 },
    [josh]: { score: 2 },
  });
  expect(
    after.transactions
      .filter((row) => Number(row['player_id']) === colin)
      .map((row) => Number(row['num_points'])),
  ).toEqual([2, 3]);
  expect(
    after.roundScores.filter((row) => Number(row['player_id']) === colin),
  ).toEqual([
    { player_id: String(colin), score: String(seed.colin.score + 5) },
  ]);
});

test('the bank cannot go below 0 outside a replay either', async () => {
  await sql`select override_points(${sql.json({
    playerId: molly,
    change: -10,
    replace: false,
  })}::json, true)`;
  await sql`select override_bank_balance(${sql.json({
    sessionId: seed.sessionId,
    change: 0,
    replace: true,
  })}::json)`;
  const before = await sessionState();
  expect(before.bankBalance).toBe('0');

  await expect(
    sql`delete from transaction where player_id = ${molly}
      and id >= ${firstUnseededId.transaction} and lost_to_bank`,
  ).rejects.toThrow('The bank balance cannot go below 0');
  await expect(
    sql`select override_bank_balance(${sql.json({
      sessionId: seed.sessionId,
      change: -1,
      replace: true,
    })}::json)`,
  ).rejects.toThrow('The bank balance cannot go below 0');
  expect(await sessionState()).toEqual(before);
});

test('a bank space submit pays out a bank balance the GM changes at the same time', async () => {
  await setRoundPhase('gameboard_moves');
  await sql`update session set bank_balance = 20 where id = ${seed.sessionId}`;
  const gm = connect();
  const [{ pid }] = await gm<{ pid: number }[]>`select pg_backend_pid() as pid`;
  let submit: Promise<unknown> = Promise.resolve();
  await sql.begin(async (tx) => {
    await tx`select override_bank_balance(${tx.json({
      sessionId: seed.sessionId,
      change: 50,
      replace: false,
    })}::json)`;
    submit = gm`select log_round_moves(${gm.json({
      [olivia]: { gameboardSpaceId: space.bank, distanceTraveled: 4 },
    })}::json, ${round})`.execute();
    await expect
      .poll(async () => {
        const [row] = await tx<{ blocked: boolean }[]>`
          select pg_backend_pid() = any (pg_blocking_pids(${pid})) as blocked`;
        return row.blocked;
      })
      .toBe(true);
  });
  await submit;
  await gm.end();

  const state = await sessionState();
  expect(state.bankBalance).toBe('0');
  expect(pointsByPlayer(state)).toEqual([[olivia, 70]]);
});

test('a submitted round cannot be deleted from the app', async () => {
  await setRoundPhase('gameboard_moves');
  await sql`update session set bank_balance = 20 where id = ${seed.sessionId}`;
  await logMoves({ [olivia]: { gameboardSpaceId: space.bank } });
  const before = await sessionState();

  for (const role of ['authenticated', 'anon']) {
    for (const statement of [
      'delete from round_submit',
      'truncate round_submit',
    ]) {
      await expect(
        sql.begin(async (tx) => {
          await tx.unsafe(`set local role ${role}`);
          await tx.unsafe(statement);
        }),
      ).rejects.toThrow('permission denied for table round_submit');
    }
  }

  expect(await sessionState()).toEqual(before);
});
