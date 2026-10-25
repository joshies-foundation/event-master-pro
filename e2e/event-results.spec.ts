import type { Page } from '@playwright/test';
import { sql } from './support/db';
import {
  expect,
  openTab,
  pushFailure,
  test,
  typeNumber,
} from './support/fixtures';

async function setRoundPhase(phase: string) {
  await sql`update game_state set round_phase = ${phase} where id = 1`;
}

async function roundPhase() {
  const [row] = await sql<{ round_phase: string }[]>`
    select round_phase from game_state`;
  return row.round_phase;
}

async function transactionCount() {
  const [row] = await sql<
    { count: string }[]
  >`select count(*) from transaction`;
  return Number(row.count);
}

function endRoundRequests(page: Page): unknown[] {
  const bodies: unknown[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/rpc/end_round')) {
      bodies.push(request.postDataJSON());
    }
  });
  return bodies;
}

async function reviewTenPointsForTheFirstTeam(page: Page) {
  await openTab(page, 'GM Tools');
  await page
    .getByRole('link', { name: 'Assign Session Points Based on Event Results' })
    .tap();
  await typeNumber(page.getByRole('spinbutton').first(), 10);
  await page.getByRole('button', { name: 'Review Score Changes' }).tap();
  await expect(
    page.getByRole('button', { name: 'Submit Session Points' }),
  ).toBeVisible();
}

async function expectAssignSessionPoints(page: Page, event: string) {
  await expect(page).toHaveURL(/\/gm-tools\/end-round$/);
  await expect(
    page.getByText(`Assign session points based on ${event} results`),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit Session Points' }),
  ).toHaveCount(0);
}

test('Back after submitting the event results returns the GM to GM Tools', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await setRoundPhase('event');
  await login();
  await reviewTenPointsForTheFirstTeam(page);
  await page.getByRole('button', { name: 'Submit Session Points' }).tap();
  await expect(page).toHaveURL(/\/home$/);

  await page.goBack();

  await expect(page).toHaveURL(/\/gm-tools$/);
  await expect(
    page.getByRole('heading', { name: 'GM Tools', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit Session Points' }),
  ).toHaveCount(0);
});

test('the event-results review with no saved results sends the GM to Assign Session Points and submits nothing', async ({
  page,
  login,
}) => {
  await setRoundPhase('event');
  const transactionsBefore = await transactionCount();
  const submits = endRoundRequests(page);
  await login();

  await page.goto('/gm-tools/end-round/review');

  await expectAssignSessionPoints(page, 'Magic school');
  expect(submits).toEqual([]);
  expect(await roundPhase()).toBe('event');
  expect(await transactionCount()).toBe(transactionsBefore);
});

test('the event-results review sends the GM back when a team joined the event after the results were saved', async ({
  page,
  login,
}) => {
  await setRoundPhase('event');
  const submits = endRoundRequests(page);
  await login();
  await reviewTenPointsForTheFirstTeam(page);

  await sql`insert into event_team (id, event_id, seed, name)
    values (1351, 76, 3, 'Team 3')`;
  await sql`update event_participant set team_id = 1351 where player_id = 115`;
  await page.reload();

  await expectAssignSessionPoints(page, 'Magic school');
  expect(submits).toEqual([]);
});

test('event results saved in one round are not offered in the next', async ({
  page,
  login,
}) => {
  await setRoundPhase('event');
  const submits = endRoundRequests(page);
  await login();
  await reviewTenPointsForTheFirstTeam(page);

  await sql`select end_round(1, ${sql.json({ 1349: 10, 1350: 0 })})`;
  await sql`insert into event_team (id, event_id, seed, name)
    values (1351, 72, 1, 'Team 1'), (1352, 72, 2, 'Team 2')`;
  await sql`insert into event_participant (team_id, player_id)
    values (1351, 119), (1352, 109)`;
  await sql`update game_state
    set round_number = 2, round_phase = 'event' where id = 1`;
  await page.goto('/gm-tools/end-round/review');

  await expectAssignSessionPoints(page, 'Ping Pong');
  expect(submits).toEqual([]);
});
