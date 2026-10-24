import { sql } from './support/db';
import { confirmDialog, expect, openTab, test } from './support/fixtures';
import { seed } from './support/seed';

const eventsInOrder = [
  'Magic school',
  'Ping Pong',
  'Kickball',
  'Cornhole',
  'Mini Golf',
  'Bowling',
];

test('Rules lists the events in order and the gameboard spaces', async ({
  page,
  login,
}) => {
  await login(seed.leo);
  await openTab(page, 'Rules');
  const events = page.getByRole('heading', { level: 3 });
  for (const [index, name] of eventsInOrder.entries()) {
    await expect(events.nth(index)).toContainText(name);
  }
  await expect(
    page.getByText('When tennis is too big, just play it on a table.'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Gameboard', level: 2 }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Blue Space' })).toBeVisible();
  await expect(page.getByText('Gain 10 points')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Edit / })).toHaveCount(0);
});

test('the GM edits an event from the Rules page', async ({ page, login }) => {
  await login();
  await openTab(page, 'Rules');
  await page.getByRole('link', { name: 'Edit Ping Pong' }).tap();
  await expect(page).toHaveURL(/\/gm-tools\/events\/edit\/72$/);
  await expect(page.getByText('Edit Ping Pong')).toBeVisible();

  const description = page.getByRole('textbox', { name: 'Description' });
  await expect(description).toHaveValue(
    'When tennis is too big, just play it on a table.',
  );
  await description.fill('Table tennis, best of three.');
  await page.getByRole('button', { name: 'Submit Changes' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(page.getByText('Ping Pong event updated')).toBeVisible();

  await expect
    .poll(
      async () =>
        (
          await sql<
            { description: string }[]
          >`select description from event where id = 72`
        )[0].description,
    )
    .toBe('Table tennis, best of three.');
  await openTab(page, 'Rules');
  await expect(page.getByText('Table tennis, best of three.')).toBeVisible();
});
