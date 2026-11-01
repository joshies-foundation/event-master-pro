import type { Page } from '@playwright/test';
import { sql } from './support/db';
import { expect, test, waitForWebKitToFinishLoading } from './support/fixtures';
import { seed } from './support/seed';

const liveTables = [
  {
    table: 'game_state',
    read: /\/rest\/v1\/game_state\?select=\*&id=eq\.1$/,
    change: () =>
      sql`update game_state set round_number = round_number where id = 1`,
  },
  {
    table: 'session',
    read: /\/rest\/v1\/session\?select=\*&id=eq\./,
    change: () =>
      sql`update session set name = name where id = ${seed.sessionId}`,
  },
  {
    table: 'player',
    read: /\/rest\/v1\/player\?select=\*&session_id=eq\./,
    change: () =>
      sql`update player set score = score where id = ${seed.colin.playerId}`,
  },
];

const readAfterJoin = 2;

function realtimeUpdateArrives(page: Page, table: string): Promise<void> {
  return new Promise((resolve) => {
    page.on('websocket', (socket) =>
      socket.on('framereceived', ({ payload }) => {
        const frame = String(payload);
        if (
          frame.includes(`"table":"${table}"`) &&
          frame.includes('"type":"UPDATE"')
        ) {
          resolve();
        }
      }),
    );
  });
}

test('a page opened while the game changes loads without errors', async ({
  page,
  login,
}) => {
  await login();

  const updates: Promise<void>[] = [];
  for (const { table, read, change } of liveTables) {
    const updateArrived = realtimeUpdateArrives(page, table);
    updates.push(updateArrived);
    let reads = 0;
    await page.route(read, async (route) => {
      reads++;
      if (reads === readAfterJoin) {
        await change();
        await updateArrived;
      }
      await route.continue();
    });
  }

  await page.goto('/gm-tools/edit-game-state');
  await expect(
    page.getByRole('combobox', { name: seed.sessionName }),
  ).toBeVisible();
  await Promise.all(updates);
  await waitForWebKitToFinishLoading(page);
});

test('team members keep their order whatever order the rows arrive in', async ({
  page,
  login,
}) => {
  const teams = page.locator('tbody tr td:first-child .text-xs');
  const expectTeams = () =>
    expect(teams).toHaveText([
      'Olivia, Colin, Molly, Leo, Josh & Dan',
      'Brittany, Tim, Leo, Ellie & Alyssa',
    ]);

  await login();
  await page.goto('/gm-tools/enter-event-scores');
  await expectTeams();

  let reversed = false;
  await page.route(
    /\/rest\/v1\/event_participant\?select=\*/,
    async (route) => {
      const response = await route.fetch();
      const rows: unknown[] = await response.json();
      reversed = true;
      await route.fulfill({ response, json: rows.reverse() });
    },
  );
  await page.reload();
  await expectTeams();
  await expect.poll(() => reversed).toBe(true);
});
