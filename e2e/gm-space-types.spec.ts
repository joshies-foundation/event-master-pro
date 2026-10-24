import { sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  typeNumber,
} from './support/fixtures';

test('the GM changes the points a space type gives', async ({
  page,
  login,
}) => {
  await login();
  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Manage Gameboard Spaces' }).tap();
  await page.getByRole('link', { name: /^Blue Space Gain 10 points/ }).tap();
  await typeNumber(page.getByRole('spinbutton'), 11);
  await page.getByRole('button', { name: 'Submit Changes' }).tap();
  await expect(confirmDialog(page)).toContainText(
    /Before.*Gain 10 points.*After.*Gain 11 points/,
  );
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();

  await expect(page.getByText('Blue Space updated')).toBeVisible();
  await expect(page).toHaveURL(/\/gm-tools\/space-types$/);
  await expect(
    page.getByRole('link', { name: /^Blue Space Gain 11 points/ }),
  ).toBeVisible();
  const [blue] = await sql<{ effect_data: unknown }[]>`
    select effect_data from gameboard_space where id = 32`;
  expect(blue.effect_data).toEqual({ pointsGained: 11 });
});
