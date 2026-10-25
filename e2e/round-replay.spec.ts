import { resetDatabase, sql } from './support/db';
import { expect, test } from './support/fixtures';
import { seed } from './support/seed';

const round = 2;
const space = { blue: 32, red: 33, duel: 34, bank: 35 };
const firstUnseededId = { transaction: 989, bet: 159 };
const colin = seed.colin.playerId;
const leo = seed.leo.playerId;
const josh = seed.josh.playerId;
const maddie = 110;
const ben = 111;
const kyle = 112;

type Moves = Record<number, { gameboardSpaceId: number }>;

async function setRoundPhase(phase: string) {
  await sql`update game_state set round_number = ${round}, round_phase = ${phase}
    where id = 1`;
}

async function addSpace(name: string, effect: string) {
  const [row] = await sql<{ id: string }[]>`
    insert into gameboard_space (session_id, name, effect)
    values (${seed.sessionId}, ${name}, ${effect}) returning id`;
  return Number(row.id);
}

async function logMoves(moves: Moves) {
  const withDistance = Object.fromEntries(
    Object.entries(moves).map(([player, move]) => [
      player,
      { ...move, distanceTraveled: 4 },
    ]),
  );
  await sql`select log_round_moves(${sql.json(withDistance)}::json, ${round})`;
}

async function endRound(teamScores: Record<number, number>) {
  const [row] = await sql<{ result: { token_recipient_user_ids: string[] } }[]>`
    select end_round(${round}, ${sql.json(teamScores)}) as result`;
  return [...row.result.token_recipient_user_ids].sort();
}

async function placeMoveBet(
  description: string,
  playerId: number,
  gameboardSpaceId: number,
) {
  const [bet] = await sql<{ id: string }[]>`
    insert into bet (session_id, requester_player_id, opponent_player_id,
      requester_wager, opponent_wager, description, status, bet_type, details)
    values (${seed.sessionId}, ${leo}, ${josh}, 5, 5,
      ${description}, 'pending_acceptance',
      'gameboard_move', ${sql.json({ playerId, gameboardSpaceId })})
    returning id`;
  await sql`select submit_bet_accepted(${bet.id})`;
}

async function addEventTeams() {
  const event = await sql<{ id: string }[]>`
    select id from event
    where session_id = ${seed.sessionId} and round_number = ${round}`;
  const teams: number[] = [];
  for (const members of [
    [colin, leo, kyle],
    [josh, maddie],
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

async function sessionState() {
  const players = await sql`
    select id, score, prize_tokens from player
    where session_id = ${seed.sessionId} order by id`;
  const [session] = await sql<{ bank_balance: string }[]>`
    select bank_balance from session where id = ${seed.sessionId}`;
  const moves = await sql`
    select gm.player_id, gm.gameboard_space_id from gameboard_move gm
    join player p on p.id = gm.player_id
    where p.session_id = ${seed.sessionId} and gm.round_number = ${round}
    order by gm.player_id`;
  const spaceEvents = await sql`
    select 'duel' as kind, challenger_player_id as player_id,
      duel_space_id as space_id, status::text from duel
    where session_id = ${seed.sessionId} and round_number = ${round}
    union all
    select 'special', player_id, special_space_id, status::text
    from special_space_event
    where session_id = ${seed.sessionId} and round_number = ${round}
    union all
    select 'chaos', player_id, chaos_space_id, status::text
    from chaos_space_event
    where session_id = ${seed.sessionId} and round_number = ${round}
    order by 1, 2`;
  const roundScores = await sql`
    select s.player_id, s.score from player_round_score s
    join player p on p.id = s.player_id
    where p.session_id = ${seed.sessionId} and s.round_number = ${round}
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
      : { [kyle]: { gameboardSpaceId: space.blue } };
    return {
      [colin]: { gameboardSpaceId: replayed ? space.blue : space.duel },
      [leo]: { gameboardSpaceId: star },
      [josh]: { gameboardSpaceId: replayed ? space.duel : chaos },
      [maddie]: { gameboardSpaceId: replayed ? space.bank : space.red },
      [ben]: { gameboardSpaceId: space.red },
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
      'Kyle will land on a(n) Blue space next',
      kyle,
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
    [maddie]: { score: 25, tokens: 0 },
    [ben]: { score: -10, tokens: 0 },
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
      description: 'Kyle will land on a(n) Blue space next',
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
    [maddie]: { score: 10, tokens: 1 },
    [josh]: { score: 10, tokens: 1 },
  });
  expect(replay.roundScores).toHaveLength(5);
  expect(replay.transactions).toHaveLength(5);
  const winners = await sql<{ user_id: string }[]>`
    select user_id from player where id in (${josh}, ${maddie})
    order by user_id`;
  expect(replayRecipients).toEqual(winners.map((row) => row.user_id));
  expect(replayRecipients).toEqual(onceRecipients);
  expect(replay).toEqual(once);
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
    update duel set opponent_player_id = ${ben}, game_name = 'Ping Pong',
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
    ${sql.json({ [josh]: 10, [ben]: -10 })}::json)`;
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
    select (spin_prize_machine(${kyle})).id`;

  await setRoundPhase('event');
  expect(await endRound({ [first]: 10, [second]: 0 })).toEqual([]);
  const tokensAfterSameWinners = await sql`
    select id, prize_tokens from player where id in (${colin}, ${kyle})
    order by id`;
  expect([...tokensAfterSameWinners]).toEqual([
    { id: String(kyle), prize_tokens: 0 },
    { id: String(colin), prize_tokens: 2 },
  ]);

  await setRoundPhase('event');
  await endRound({ [first]: 0, [second]: 10 });
  const tokens = await sql`
    select id, prize_tokens from player where id in (${colin}, ${kyle})
    order by id`;
  expect([...tokens]).toEqual([
    { id: String(kyle), prize_tokens: 0 },
    { id: String(colin), prize_tokens: 1 },
  ]);
  const [won] = await sql<{ won_by_player_id: string }[]>`
    select won_by_player_id from prize where id = ${prize.id}`;
  expect(won.won_by_player_id).toBe(String(kyle));
});

test('a GM replay of the gameboard moves puts back the bank the first submit paid out', async () => {
  const start = async () => {
    await setRoundPhase('gameboard_moves');
    await sql`update session set bank_balance = 25 where id = ${seed.sessionId}`;
    return addSpace('Star', 'special');
  };
  const replayMoves: Moves = {
    [leo]: { gameboardSpaceId: space.blue },
    [maddie]: { gameboardSpaceId: space.red },
    [ben]: { gameboardSpaceId: space.red },
  };

  await start();
  const before = await sessionState();
  await logMoves(replayMoves);
  const once = await sessionState();

  await resetDatabase();
  const star = await start();
  await logMoves({
    [leo]: { gameboardSpaceId: star },
    [maddie]: { gameboardSpaceId: space.bank },
    [ben]: { gameboardSpaceId: space.red },
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
    [maddie]: { score: -10, tokens: 0 },
    [ben]: { score: -10, tokens: 0 },
  });
  expect(replay.spaceEvents).toEqual([]);
  expect(replay.transactions).toHaveLength(3);
  expect(replay).toEqual(once);
});

test('a GM replay of the gameboard moves leaves a bet the GM canceled canceled', async () => {
  await setRoundPhase('gameboard_moves');
  const before = await sessionState();
  await placeMoveBet(
    'Kyle will land on a(n) Blue space next',
    kyle,
    space.blue,
  );
  await logMoves({ [kyle]: { gameboardSpaceId: space.blue } });
  await sql`select submit_bet_canceled_by_gm(id) from bet
    where id >= ${firstUnseededId.bet}`;

  await setRoundPhase('gameboard_moves');
  await logMoves({ [colin]: { gameboardSpaceId: space.blue } });
  const replay = await sessionState();

  expect(replay.bets).toEqual([
    {
      description: 'Kyle will land on a(n) Blue space next',
      status: 'canceled_by_gm',
    },
  ]);
  expect(playerChanges(replay, before)).toEqual({
    [colin]: { score: 10, tokens: 0 },
  });
});
