# Analytics

The analytics tab shows the player's points over time, their latest transactions, and links to session-wide stats: roll history, space stats, duel history, player duel stats, previous session rankings, and past prizes.

## Sub-features

- `analytics-chart` is the `Points Over Time` chart (a canvas).
- `analytics-transactions` is `Latest Transactions` with an `All Transactions` button that opens `/analytics/transactions`.
- `analytics-roll-history` shows dice rolls and spaces landed on per turn.
- `analytics-space-stats` and `analytics-duels` cover Space Stats, Duel History, and Player Duel Stats.
- `analytics-previous` covers Previous Session Rankings and Past Prizes.

## How to get to it (user POV)

- Analytics tab in the footer, then the cards and links on the page.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`.

- **Open.** Run `$V browser tap --role link --name Analytics --within nav`, then `$V browser wait --role heading --name "Latest Transactions"`. `snapshot` shows `heading " Points Over Time"` with an `img` (the chart) and a transactions table with rows such as `Points earned from Magic school ... +30`.
- **All transactions.** Run `$V browser tap --role button --name "All Transactions"`, then `$V browser wait --url /analytics/transactions`. The full transactions table appears with a back link `Analytics`.
- **Sub-pages.** From `/analytics`, tap `--role link --name "Roll History"` and the other links. Each opens `/analytics/<page>` with a back link `Analytics` and a table. Use `$V browser back` to return.
- **Proof.** Save `snapshot` and `screenshot` under `analytics/`. For chart changes, a screenshot is the only proof, because the canvas has no ARIA content.

## Gotchas

- The chart is a canvas. ARIA snapshots show only `img`, so verify chart changes visually from the screenshot.
- Transactions are per user. Another player's transactions are not visible here.
- Analytics read the shared TEST history. Counts change when other developers play TEST rounds.
