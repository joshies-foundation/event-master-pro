import type { Page } from '@playwright/test';
import { sql } from './support/db';
import {
  acceptNextDialog,
  confirmDialog,
  expect,
  openTab,
  test,
} from './support/fixtures';
import { seed } from './support/seed';

test('the GM renames the session and every phone sees it', async ({
  page,
  login,
  secondPhone,
}) => {
  await login();
  const leo = await secondPhone(seed.leo);
  await expect(
    leo.getByRole('heading', { name: seed.sessionName, level: 1 }),
  ).toBeVisible();

  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Edit Session' }).tap();
  const name = page.getByRole('textbox', { name: 'Session Name' });
  await expect(name).toHaveValue(seed.sessionName);
  await name.fill('Summer Jaybies');
  await page.getByRole('button', { name: 'Update Session' }).tap();
  await expect(confirmDialog(page)).toContainText(
    'Are you sure you want to update the session?',
  );
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(page.getByText('Session updated')).toBeVisible();

  await expect
    .poll(
      async () =>
        (
          await sql<
            { name: string }[]
          >`select name from session where id = ${seed.sessionId}`
        )[0].name,
    )
    .toBe('Summer Jaybies');
  await openTab(page, 'Home');
  await expect(
    page.getByRole('heading', { name: 'Summer Jaybies', level: 1 }),
  ).toBeVisible();
  await expect(
    leo.getByRole('heading', { name: 'Summer Jaybies', level: 1 }),
  ).toBeVisible();
});

async function endSessionAndCreateAnother(page: Page): Promise<string> {
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'End Session' }).tap();
  const endPrompt = acceptNextDialog(page, 'END SESSION');
  await page.getByRole('button', { name: 'End Session' }).tap();
  await endPrompt;
  await expect(page.getByText('Session ended')).toBeVisible();

  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Create Session' }).tap();
  await page
    .getByRole('textbox', { name: 'Session Name' })
    .fill('Fall Jaybies');
  await page.locator('.p-multiselect').tap();
  await page.getByRole('option', { name: 'Colin', exact: true }).tap();
  await page.getByRole('option', { name: 'Josh', exact: true }).tap();
  await page.getByText('Number of Rounds', { exact: true }).tap();
  await page.getByRole('button', { name: 'Create Session' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(page.getByText('Session created')).toBeVisible();

  const [{ sessionId }] = await sql<{ sessionId: string }[]>`
    select session_id as "sessionId" from game_state where id = 1`;
  expect(Number(sessionId)).toBeGreaterThan(seed.sessionId);
  return sessionId;
}

test('a session the GM creates starts with the previous session rules', async ({
  page,
  login,
}) => {
  await login();
  const sessionId = await endSessionAndCreateAnother(page);
  expect(
    await sql`select events from rules where session_id = ${sessionId}`,
  ).toEqual([{ events: '<p>These are the events!</p>' }]);

  await openTab(page, 'Rules');
  await expect(page.getByText('These are the events!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ping Pong' })).toBeVisible();
});

test('a session the GM creates keeps the previous session events in order from round 1', async ({
  page,
  login,
  secondPhone,
}) => {
  const eventsInOrder = [
    'Magic school',
    'Ping Pong',
    'Kickball',
    'Cornhole',
    'Mini Golf',
    'Bowling',
  ];
  await login();
  const sessionId = await endSessionAndCreateAnother(page);
  expect(
    await sql`
      select round_number, name from event
      where session_id = ${sessionId} order by round_number`,
  ).toEqual(
    eventsInOrder.map((name, index) => ({ round_number: index + 1, name })),
  );

  const freshPhone = await secondPhone(seed.colin);
  await openTab(freshPhone, 'Rules');
  await expect(
    freshPhone.getByRole('heading', { name: 'Bowling' }),
  ).toBeVisible();
  const eventHeadings = freshPhone
    .getByRole('heading', { level: 3 })
    .filter({ hasText: new RegExp(eventsInOrder.join('|')) });
  await expect(eventHeadings).toHaveText(
    eventsInOrder.map((name) => new RegExp(name)),
  );
});

test('a session created after one without rules gets blank rules the GM can edit', async ({
  page,
  login,
}) => {
  await sql`delete from rules where session_id = ${seed.sessionId}`;
  await login();
  const sessionId = await endSessionAndCreateAnother(page);
  const rulesOfNewSession = () => sql<
    {
      intro: string;
      events: string | null;
      gameboard: string | null;
      special_space_events: string | null;
      chaos_space_events: string | null;
    }[]
  >`
    select intro, events, gameboard, special_space_events, chaos_space_events
    from rules where session_id = ${sessionId}`;
  expect(await rulesOfNewSession()).toEqual([
    {
      intro: '',
      events: null,
      gameboard: null,
      special_space_events: null,
      chaos_space_events: null,
    },
  ]);

  await openTab(page, 'Rules');
  await page.locator('joshies-page-header .pi-pencil').tap();
  await page.locator('#intro .ql-editor').fill('Welcome to Fall Jaybies');
  await page.getByRole('button', { name: 'Save Rules' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(page.getByText('Rules saved')).toBeVisible();

  await expect
    .poll(async () => (await rulesOfNewSession())[0].intro)
    .toBe('<p>Welcome to Fall Jaybies</p>');
  await expect(page.getByText('Welcome to Fall Jaybies')).toBeVisible();
});
