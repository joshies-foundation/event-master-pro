import { sql } from './support/db';
import {
  expect,
  openTab,
  pushFailure,
  test,
  typeNumber,
} from './support/fixtures';

test('Back after submitting the event results returns the GM to GM Tools', async ({
  page,
  login,
  consoleGuard,
}) => {
  consoleGuard.allow(pushFailure);
  await sql`update game_state set round_phase = 'event' where id = 1`;
  await login();
  await openTab(page, 'GM Tools');
  await page
    .getByRole('link', { name: 'Assign Session Points Based on Event Results' })
    .tap();
  await typeNumber(page.getByRole('spinbutton').first(), 10);
  await page.getByRole('button', { name: 'Review Score Changes' }).tap();
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
