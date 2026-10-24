import type { Page } from '@playwright/test';
import { test, expect, waitForWebKitToFinishLoading } from './support/fixtures';
import { seed } from './support/seed';

const playerRoutes: [route: string, title: string][] = [
  ['/home', 'Test Jaybies'],
  ['/rules', 'Rules'],
  ['/betting', 'Betting'],
  ['/betting/place-bet', 'Place a Bet'],
  ['/betting/accept-bets', 'Accept Bets'],
  ['/betting/review-user-bets', 'Current Bets'],
  ['/betting/resolved-bets', 'Settled Bets'],
  ['/prizes', 'Prizes'],
  ['/profile', 'Profile'],
  ['/analytics', 'Analytics'],
  ['/analytics/transactions', 'Transactions'],
  ['/analytics/current-rankings', 'Current Rankings'],
  ['/analytics/previous-rankings', 'Previous Rankings'],
  ['/analytics/lifetime-stats', 'Lifetime Stats'],
  ['/analytics/roll-history', 'Roll History'],
  ['/analytics/space-stats', 'Space Stats'],
  ['/analytics/duel-history', 'Duel History'],
  ['/analytics/player-duel-stats', 'Player Duel Stats'],
  ['/analytics/prizes', 'Past Prizes'],
  ['/dashboard', 'Test Jaybies'],
  ['/dashboard/randomizer', 'Randomizer'],
];

const gmRoutes: [route: string, title: string][] = [
  ['/gm-tools', 'GM Tools'],
  ['/gm-tools/end-round', 'Assign Session Points'],
  ['/gm-tools/space-entry', 'Move Entry'],
  ['/gm-tools/resolve-special-space-events', 'Special Space Events'],
  ['/gm-tools/special-space-event-templates', 'Special Space Events'],
  [
    '/gm-tools/special-space-event-templates/new',
    'New Special Space Event Type',
  ],
  ['/gm-tools/resolve-duels', 'Duels'],
  ['/gm-tools/manage-duels', 'Manage Duels'],
  ['/gm-tools/resolve-chaos-space-events', 'Chaos Space Events'],
  ['/gm-tools/chaos-space-event-templates', 'Chaos Space Events'],
  ['/gm-tools/chaos-space-event-templates/new', 'New Chaos Space Event Type'],
  ['/gm-tools/enter-event-scores', 'Enter Event Scores'],
  ['/gm-tools/enter-tournament-results', 'Enter Tournament Results'],
  ['/gm-tools/resolve-bets', 'Settle Bets'],
  ['/gm-tools/bet-bulk-cancel', 'Bulk Cancel Bets'],
  ['/gm-tools/override-points', 'Override Points'],
  ['/gm-tools/edit-profiles', 'Edit Profiles'],
  ['/gm-tools/edit-permissions', 'Edit Permissions'],
  ['/gm-tools/change-gm', 'Change GM'],
  ['/gm-tools/send-notifications', 'Send Notifications'],
  ['/gm-tools/create-session', 'Create Session'],
  ['/gm-tools/edit-session', 'Edit Session'],
  ['/gm-tools/edit-game-state', 'Override Game State'],
  ['/gm-tools/start-session-early', 'Start Session Early'],
  ['/gm-tools/end-session', 'End Session'],
  ['/gm-tools/space-types', 'Space Types'],
  ['/gm-tools/space-types/new', 'New Space Type'],
  ['/gm-tools/events', 'Events'],
  ['/gm-tools/events/new', 'New Event'],
  ['/gm-tools/override-bank-balance', 'Override Bank Balance'],
  ['/gm-tools/manage-prize-pool', 'Manage Prize Pool'],
  ['/gm-tools/adjust-prize-tokens', 'Adjust Prize Tokens'],
];

async function expectPage(page: Page, route: string, title: string) {
  await page.goto(route);
  await expect(page, route).toHaveURL(new RegExp(`${route}$`));
  await expect(
    page
      .locator('joshies-page-header p, h1')
      .filter({ hasText: title })
      .first(),
    route,
  ).toBeVisible();
  await waitForWebKitToFinishLoading(page);
}

test('every page opens for the GM without errors', async ({ page, login }) => {
  test.setTimeout(180_000);
  await login(seed.colin);
  for (const [route, title] of [...playerRoutes, ...gmRoutes]) {
    await expectPage(page, route, title);
  }
});

test('every player page opens for a player without errors', async ({
  page,
  login,
}) => {
  test.setTimeout(120_000);
  await login(seed.leo);
  for (const [route, title] of playerRoutes) {
    await expectPage(page, route, title);
  }
});

test('an unknown path inside the app falls back to Home', async ({
  page,
  login,
}) => {
  await login();
  await page.goto('/no-such-page');
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole('heading', { name: seed.sessionName, level: 1 }),
  ).toBeVisible();
});
