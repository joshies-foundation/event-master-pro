import type { Page } from '@playwright/test';
import { score, sql } from './support/db';
import {
  confirmDialog,
  expect,
  openTab,
  test,
  typeNumber,
} from './support/fixtures';
import { seed } from './support/seed';

async function placeBetAgainstLeo(page: Page, terms: string, wager: number) {
  await openTab(page, 'Betting');
  await page.getByRole('link', { name: 'Custom' }).tap();
  await page.getByRole('combobox', { name: 'Select an opponent' }).tap();
  await page.getByRole('option', { name: 'Leo (70 points)' }).tap();
  await page.getByRole('textbox', { name: 'Bet Terms' }).fill(terms);
  await typeNumber(page.getByRole('spinbutton'), wager);
  await page.getByRole('button', { name: 'Submit Bet' }).tap();
  await confirmDialog(page).getByRole('button', { name: 'Yes' }).tap();
  await expect(page).toHaveURL(/\/betting$/);
}

async function betStatus(terms: string) {
  const rows = await sql<{ status: string }[]>`
    select status from bet where description = ${terms}`;
  return rows.map((row) => row.status);
}

test('a custom bet goes from request to acceptance to the GM settling it', async ({
  page,
  login,
  secondPhone,
}) => {
  const terms = 'Colin finishes the bracket first';
  await login();
  await placeBetAgainstLeo(page, terms, 5);
  await expect(page.getByText('Awaiting Acceptance (1)')).toBeVisible();
  await expect.poll(() => betStatus(terms)).toEqual(['pending_acceptance']);

  const leo = await secondPhone(seed.leo);
  await openTab(leo, 'Betting');
  await expect(leo.getByText('Bet Requests (1)')).toBeVisible();
  await expect(leo.getByText(terms)).toBeVisible();
  await leo.getByRole('button', { name: 'Accept' }).tap();
  await expect(confirmDialog(leo, 'Confirm Accept')).toContainText(
    'Are you sure you want to wager 5 points against Colin?',
  );
  await confirmDialog(leo, 'Confirm Accept')
    .getByRole('button', { name: 'Yes' })
    .tap();
  await expect(leo.getByText("ACCEPTED Colin's bet")).toBeVisible();
  await expect(leo.getByText('Bet Requests (1)')).toHaveCount(0);
  await expect.poll(() => betStatus(terms)).toEqual(['active']);

  await openTab(page, 'GM Tools');
  await page.getByRole('link', { name: 'Settle or Cancel Bets' }).tap();
  const custom = page.getByRole('region', { name: 'Custom Bets (1)' });
  await expect(custom).toContainText('Colin bet Leo');
  await expect(custom).toContainText('Both wagered 5 points');
  await custom.getByRole('button', { name: 'Colin Wins' }).tap();
  await expect(confirmDialog(page, 'Colin won?')).toContainText(
    'Are you sure Colin won?',
  );
  await confirmDialog(page, 'Colin won?')
    .getByRole('button', { name: 'Yes' })
    .tap();
  await expect(page.getByText('Bet resolved')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Custom Bets (0)' }),
  ).toBeVisible();

  await expect.poll(() => betStatus(terms)).toEqual(['requester_won']);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score + 5);
  expect(await score(seed.leo.playerId)).toBe(seed.leo.score - 5);
});

test('the opponent can reject a bet request', async ({
  page,
  login,
  secondPhone,
}) => {
  const terms = 'Leo loses the trivia round';
  await login();
  await placeBetAgainstLeo(page, terms, 3);

  const leo = await secondPhone(seed.leo);
  await openTab(leo, 'Betting');
  await leo.getByRole('button', { name: 'Reject' }).tap();
  await expect(confirmDialog(leo, 'Confirm Reject')).toContainText(
    "Are you sure you want to REJECT Colin's bet request?",
  );
  await confirmDialog(leo, 'Confirm Reject')
    .getByRole('button', { name: 'Yes' })
    .tap();
  await expect(leo.getByText("REJECTED Colin's bet")).toBeVisible();

  await expect.poll(() => betStatus(terms)).toEqual(['rejected']);
  expect(await score(seed.colin.playerId)).toBe(seed.colin.score);
  expect(await score(seed.leo.playerId)).toBe(seed.leo.score);
});

test('the requester can cancel a bet before it is accepted', async ({
  page,
  login,
}) => {
  const terms = 'Colin changes his mind';
  await login();
  await placeBetAgainstLeo(page, terms, 2);
  await page.getByRole('button', { name: 'Cancel Bet Request' }).tap();
  await expect(confirmDialog(page, 'Confirm Cancel')).toContainText(
    'Are you sure you want to cancel your bet request against Leo?',
  );
  await confirmDialog(page, 'Confirm Cancel')
    .getByRole('button', { name: 'Yes' })
    .tap();
  await expect(page.getByText('Canceled bet against Leo')).toBeVisible();

  await expect.poll(() => betStatus(terms)).toEqual(['canceled_by_requester']);
  await expect(page.getByText('Awaiting Acceptance (1)')).toHaveCount(0);
});
