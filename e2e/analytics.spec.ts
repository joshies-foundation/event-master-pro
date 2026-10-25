import type { Chart, LineElement, PointElement } from 'chart.js';
import { sql } from './support/db';
import { expect, openTab, test } from './support/fixtures';
import { seed } from './support/seed';

test('Analytics shows the latest transactions and the full list', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Analytics');
  await expect(
    page.getByRole('heading', { name: 'Points Over Time' }),
  ).toBeVisible();
  const latest = page.getByRole('table').getByRole('row');
  await expect(latest).toHaveCount(3);
  await expect(latest.first()).toHaveText(
    /Points earned from Magic school.*\+30/s,
  );

  await page.getByRole('button', { name: 'All Transactions' }).tap();
  await expect(page).toHaveURL(/\/analytics\/transactions$/);
  await expect(
    page.getByRole('row', { name: /^Won bet against Leo .* \+20$/ }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('row', { name: /^GM Discretion .* \+20$/ }),
  ).toHaveCount(1);
});

test('the stats pages open from Analytics and lead back', async ({
  page,
  login,
}) => {
  await login();
  for (const link of [
    'Roll History',
    'Space Stats',
    'Duel History',
    'Player Duel Stats',
    'Previous Session Rankings',
    'Past Prizes',
  ]) {
    await openTab(page, 'Analytics');
    await page.getByRole('link', { name: link }).tap();
    await expect(page).not.toHaveURL(/\/analytics$/);
    await page.getByRole('link', { name: 'Analytics' }).first().tap();
    await expect(page).toHaveURL(/\/analytics$/);
  }
});

const plans = [
  ['enable_mergejoin', 'enable_nestloop'],
  ['enable_hashjoin', 'enable_nestloop'],
  ['enable_hashjoin', 'enable_mergejoin'],
  ['enable_sort'],
];

interface PlayerRow {
  display_name: string;
  user_id: string;
}

async function playerOrderUnderEachPlan(query: string): Promise<PlayerRow[][]> {
  const orders: PlayerRow[][] = [];
  for (const disabled of plans) {
    const rows = await sql.begin(async (tx) => {
      await tx`discard plans`;
      for (const setting of disabled) {
        await tx.unsafe(`set local ${setting} = off`);
      }
      return tx.unsafe<PlayerRow[]>(query);
    });
    orders.push([...rows]);
  }
  return orders;
}

test('Previous Session Rankings orders tied players by name under every join plan', async () => {
  const [first, ...others] = await playerOrderUnderEachPlan(
    `select display_name, user_id::text
     from get_all_scores_from_session(37)
       as (user_id uuid, score bigint, display_name text, avatar_url text)`,
  );
  for (const order of others) expect(order).toEqual(first);
  expect(first.map((row) => row.display_name)).toEqual([
    'Alyssa',
    'Brittany',
    'Dan',
    'Ellie',
    'Josh',
    'Leo',
    'Leo',
    'Molly',
    'Olivia',
    'Tim',
  ]);
});

test('Roll History orders players by name under every join plan', async () => {
  const [first, ...others] = await playerOrderUnderEachPlan(
    `select r->>'display_name' as display_name, r->>'user_id' as user_id
     from get_roll_history_for_session(${seed.sessionId}) as r`,
  );
  for (const order of others) expect(order).toEqual(first);
  expect(first.map((row) => row.display_name)).toEqual([
    'Alyssa',
    'Brittany',
    'Colin',
    'Dan',
    'Ellie',
    'Josh',
    'Leo',
    'Leo',
    'Molly',
    'Olivia',
    'Tim',
  ]);
});

test('Space Stats lists only the session players, by name, under every plan', async () => {
  const [first, ...others] = await playerOrderUnderEachPlan(
    `select display_name, user_id::text, player_id::text
     from get_space_stats_for_session(${seed.sessionId})
       as (user_id uuid, player_id bigint, display_name text, avatar_url text, space_stats json)`,
  );
  for (const order of others) expect(order).toEqual(first);
  expect(first.map((row) => row.display_name)).toEqual([
    'Alyssa',
    'Brittany',
    'Colin',
    'Dan',
    'Ellie',
    'Josh',
    'Leo',
    'Leo',
    'Molly',
    'Olivia',
    'Tim',
  ]);
});

test('Player Duel Stats lists players by name under every plan', async () => {
  const [first, ...others] = await playerOrderUnderEachPlan(
    `select s->>'display_name' as display_name, s->>'user_id' as user_id
     from get_player_duel_stats_for_session(${seed.sessionId}) as s`,
  );
  for (const order of others) expect(order).toEqual(first);
  expect(first.map((row) => row.display_name)).toEqual([
    'Alyssa',
    'Brittany',
    'Colin',
    'Dan',
    'Ellie',
    'Josh',
    'Leo',
    'Leo',
    'Molly',
    'Olivia',
    'Tim',
  ]);
});

const replayedSession = 35;

test('Roll History shows the latest move of a replayed round', async ({
  page,
  login,
}) => {
  await sql`update game_state set session_id = ${replayedSession}`;
  await login();
  await openTab(page, 'Analytics');
  await page.getByRole('link', { name: 'Roll History' }).tap();
  await expect(
    page.getByRole('row').filter({ hasText: 'Olivia' }).getByRole('cell'),
  ).toHaveText(['Olivia', '4', '3', '3', '1', '3']);
});

test('Points Over Time has one point per round when a round was replayed', async () => {
  const series = await sql<{ display_name: string; scores: string[] }[]>`
    select display_name, scores
    from get_player_round_scores_from_session(${replayedSession})`;
  const olivia = series.find((row) => row.display_name === 'Olivia');
  expect(olivia?.scores.map(Number)).toEqual([50, 32, 21, 102, 124]);

  const misaligned = await sql`
    select v.session_id, r.display_name
    from unnest(array[19, 35]) as v(session_id)
    cross join lateral get_player_round_scores_from_session(v.session_id) r
    where array_length(r.scores, 1) <> (
      select count(distinct round_number)
      from player_round_score where player_id = r.player_id)`;
  expect(misaligned).toEqual([]);
});

test('Points Over Time plots each total at its round when players skip rounds', async ({
  page,
  login,
}) => {
  await sql`update game_state set session_id = 19`;
  await sql`
    delete from player_round_score
    where round_number in (3, 10) and player_id = (
      select p.id from player p join "user" u on u.id = p.user_id
      where p.session_id = 19 and u.display_name = 'Josh')`;
  await login();
  await openTab(page, 'Analytics');
  await expect(page.locator('p-chart canvas')).toBeVisible();

  const plotted = await page.locator('p-chart').evaluate((element) => {
    const { ng } = window as unknown as {
      ng: { getComponent(element: Element): { chart: Chart<'line'> } };
    };
    const { chart } = ng.getComponent(element);
    const labels = chart.data.labels as number[];
    return {
      labels,
      players: chart.data.datasets.map((dataset, index) => {
        const meta = chart.getDatasetMeta(index);
        const points = meta.data as PointElement[];
        return {
          name: dataset.label,
          points: points.flatMap((point, round) =>
            point.skip ? [] : [[labels[round], dataset.data[round]]],
          ),
          lines: (meta.dataset as LineElement).segments.length,
        };
      }),
    };
  });

  expect(plotted.labels).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(plotted.players[0]).toEqual({
    name: 'Josh',
    points: [
      [0, 0],
      [1, 0],
      [2, 9],
      [4, 100],
      [5, 100],
      [7, -1],
    ],
    lines: 1,
  });
  expect(plotted.players[1]).toEqual({
    name: 'Dan',
    points: [
      [0, 0],
      [1, -2],
      [2, 1],
      [3, 160],
      [4, 0],
      [5, 0],
      [7, 1],
      [10, 180],
    ],
    lines: 1,
  });
});

test('Space Stats counts the latest landing of a replayed round', async ({
  page,
  login,
}) => {
  await sql`update game_state set session_id = ${replayedSession}`;
  await login();
  await openTab(page, 'Analytics');
  await page.getByRole('link', { name: 'Space Stats' }).tap();
  await expect(
    page.getByRole('row').filter({ hasText: 'Olivia' }).getByRole('cell'),
  ).toHaveText(['Olivia', '3', '2', '–', '–', '–', '–', '–', '–']);

  const miscounted = await sql`
    select v.session_id, s.display_name
    from unnest(array[19, 35]) as v(session_id)
    cross join lateral get_space_stats_for_session(v.session_id)
      as s(user_id uuid, player_id bigint, display_name text, avatar_url text, space_stats json)
    where (select sum(value::text::int) from json_each(s.space_stats)) <> (
      select count(distinct round_number)
      from gameboard_move where player_id = s.player_id)`;
  expect(miscounted).toEqual([]);
});
