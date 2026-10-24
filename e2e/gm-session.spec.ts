import { sql } from './support/db';
import { confirmDialog, expect, openTab, test } from './support/fixtures';
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
