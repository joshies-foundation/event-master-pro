import { expect, openTab, test } from './support/fixtures';

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
