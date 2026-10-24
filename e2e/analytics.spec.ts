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

const joinPlans = [
  ['enable_mergejoin', 'enable_nestloop'],
  ['enable_hashjoin', 'enable_nestloop'],
  ['enable_hashjoin', 'enable_mergejoin'],
];

interface PlayerRow {
  display_name: string;
  user_id: string;
}

async function playerOrderUnderEachJoinPlan(
  query: string,
): Promise<PlayerRow[][]> {
  const orders: PlayerRow[][] = [];
  for (const disabled of joinPlans) {
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
  const [first, ...others] = await playerOrderUnderEachJoinPlan(
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
  const [first, ...others] = await playerOrderUnderEachJoinPlan(
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
