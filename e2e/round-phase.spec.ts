import type { Page } from '@playwright/test';
import { sql } from './support/db';
import { confirmDialog, expect, test } from './support/fixtures';

const roundMovedOn =
  'The round already moved on. Check the current phase and try again.';

async function setGameState(roundNumber: number, roundPhase: string) {
  await sql`update game_state
    set round_number = ${roundNumber}, round_phase = ${roundPhase} where id = 1`;
}

async function moveOnWithoutTellingThePhone(
  roundNumber: number,
  roundPhase: string,
) {
  await sql`delete from realtime.subscription`;
  await setGameState(roundNumber, roundPhase);
}

async function gameState() {
  const [row] = await sql<{ round_number: number; round_phase: string }[]>`
    select round_number, round_phase from game_state where id = 1`;
  return row;
}

async function tapAndConfirm(page: Page, button: string) {
  await page.getByRole('button', { name: button }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
}

test('a GM on an old phase cannot advance a round that already moved on', async ({
  page,
  login,
}) => {
  await setGameState(1, 'special_space_events');
  await login();
  await expect(
    page.getByRole('button', { name: 'Proceed to Duel Phase' }),
  ).toBeVisible();

  await moveOnWithoutTellingThePhone(1, 'event');
  await tapAndConfirm(page, 'Proceed to Duel Phase');

  await expect(page.getByText(roundMovedOn)).toBeVisible();
  expect(await gameState()).toEqual({ round_number: 1, round_phase: 'event' });
});

test('a GM on an old round cannot start a turn when the same phase came round again', async ({
  page,
  login,
}) => {
  await setGameState(1, 'waiting_for_next_round');
  await login();
  await expect(
    page.getByRole('button', { name: 'Start Turn 2' }),
  ).toBeVisible();

  await moveOnWithoutTellingThePhone(2, 'waiting_for_next_round');
  await tapAndConfirm(page, 'Start Turn 2');

  await expect(page.getByText(roundMovedOn)).toBeVisible();
  expect(await gameState()).toEqual({
    round_number: 2,
    round_phase: 'waiting_for_next_round',
  });
});

test('a GM on the current phase still advances the round', async ({
  page,
  login,
}) => {
  await setGameState(1, 'special_space_events');
  await login();

  await tapAndConfirm(page, 'Proceed to Duel Phase');

  await expect
    .poll(gameState)
    .toEqual({ round_number: 1, round_phase: 'duels' });
  await expect(page.getByText(roundMovedOn)).toHaveCount(0);
});
