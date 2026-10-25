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

test('a session the GM creates starts with the previous session rules', async ({
  page,
  login,
}) => {
  await login();
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
  expect(
    await sql`select events from rules where session_id = ${sessionId}`,
  ).toEqual([{ events: '<p>These are the events!</p>' }]);

  await openTab(page, 'Rules');
  await expect(page.getByText('These are the events!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ping Pong' })).toBeVisible();
});
