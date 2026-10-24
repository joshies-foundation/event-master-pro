import { test, expect, acceptNextDialog, openTab } from './support/fixtures';
import { seed } from './support/seed';

test('logging in lands on Home for the seeded session', async ({
  page,
  login,
}) => {
  await login(seed.colin);
  await expect(
    page.getByRole('heading', { name: seed.sessionName, level: 1 }),
  ).toBeVisible();
});

test('a wrong password shows an error and stays on the login page', async ({
  page,
  consoleGuard,
}) => {
  consoleGuard.allow(/status of 400/);
  await page.goto('/auth/login');
  const logIn = page.getByRole('button', { name: 'Log In' });
  await expect(logIn).toBeDisabled();
  await page.getByPlaceholder('Username').fill(seed.colin.username);
  await page.getByPlaceholder('Password').fill('wrong-password');
  await logIn.tap();
  await expect(page.getByRole('alert')).toContainText(
    'Invalid login credentials',
  );
  await expect(page).toHaveURL(/\/auth\/login$/);
});

for (const route of ['/home', '/gm-tools', '/betting', '/dashboard']) {
  test(`a signed-out visitor to ${route} is sent to the login page`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });
}

test('signing out asks first, then ends the session', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Profile');
  const question = acceptNextDialog(page);
  await page.getByRole('button', { name: 'Sign Out' }).tap();
  expect(await question).toBe('Are you sure you want to sign out?');
  await expect(page).toHaveURL(/\/auth\/login$/);

  await page.goto('/home');
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('dismissing the sign-out question keeps the player signed in', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'Profile');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Sign Out' }).tap();
  await expect(page).toHaveURL(/\/profile$/);
  await page.reload();
  await expect(page.getByText('Login Username:')).toBeVisible();
});

test('a player who is not the GM cannot open GM Tools', async ({
  page,
  login,
}) => {
  await login(seed.leo);
  await expect(
    page.locator('nav').getByRole('link', { name: 'GM Tools' }),
  ).toHaveCount(0);
  const alert = acceptNextDialog(page);
  await page.goto('/gm-tools/override-points');
  expect(await alert).toBe('You are not authorized to view this page.');
  await expect(page).toHaveURL(/\/home$/);
});
