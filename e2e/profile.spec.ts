import { test, expect, acceptNextDialog, openTab } from './support/fixtures';
import { sql } from './support/db';
import { seed } from './support/seed';

async function displayName(userId: string): Promise<string> {
  const [row] = await sql<{ display_name: string }[]>`
    select display_name from public.user where id = ${userId}`;
  return row.display_name;
}

test('Profile shows the display name and login username', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Profile');
  await expect(page.getByText('Display Name:')).toBeVisible();
  await expect(
    page.locator('p').filter({ hasText: 'Display Name:' }),
  ).toContainText('Colin');
  await expect(
    page.locator('p').filter({ hasText: 'Login Username:' }),
  ).toContainText('colin');
});

test('renaming yourself changes your name in the rankings', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Profile');
  const prompt = acceptNextDialog(page, 'Colin E2E');
  await page.locator('i.pi-pencil').tap();
  expect(await prompt).toBe('Change display name');
  await expect(
    page.locator('p').filter({ hasText: 'Display Name:' }),
  ).toContainText('Colin E2E');
  await expect.poll(() => displayName(seed.colin.userId)).toBe('Colin E2E');

  await openTab(page, 'Home');
  await expect(
    page.getByRole('row', { name: /Colin E2E/ }).getByRole('cell'),
  ).toHaveText(['5', 'Colin E2E', '33']);
});

test('a display name over 16 characters is refused', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Profile');
  await expect(
    page.locator('p').filter({ hasText: 'Display Name:' }),
  ).toContainText('Colin');
  const prompt = acceptNextDialog(page, 'ThisNameIsWayTooLong');
  const refusal = new Promise<string>((resolve) =>
    page.on('dialog', (dialog) => {
      if (dialog.type() === 'alert') {
        resolve(dialog.message());
        void dialog.accept();
      }
    }),
  );
  await page.locator('i.pi-pencil').tap();
  await prompt;
  expect(await refusal).toContain('20 characters');
  expect(await displayName(seed.colin.userId)).toBe('Colin');
});

test('Squidward Mode stays on after a reload', async ({ page, login }) => {
  await login();
  await openTab(page, 'Profile');
  const toggle = page.getByRole('switch');
  await expect(toggle).not.toBeChecked();
  await toggle.tap();
  await expect(toggle).toBeChecked();
  await expect
    .poll(async () => {
      const [row] = await sql<{ squidward_mode: boolean }[]>`
        select squidward_mode from public.user where id = ${seed.colin.userId}`;
      return row.squidward_mode;
    })
    .toBe(true);
  await page.reload();
  await expect(page.getByRole('switch')).toBeChecked();
});
