# Betting

Players bet points against each other. The betting tab shows the player's settled-bet stats, buttons to place a bet for each bet type, open bets, and settled bets with outcomes. The place-bet form picks an opponent, bet type, and terms, and sets odds and wagers.

## Sub-features

- `betting-stats` shows `Settled Bets`, `Total Profit`, and `Overall Win %`.
- `betting-place-for` links to the place-bet form for Custom, Main Event, Duel, Special Space Event, Chaos Space Event, and Gameboard Move.
- `betting-open` lists open bets, or `No open bets`.
- `betting-settled` lists settled bets with the result and points won or lost.
- `betting-form` is the place-bet form: opponent combobox, bet type, `Bet Terms`, `Even Odds` switch, wager spinbutton(s), and `Submit Bet`.
- `betting-accept` and `betting-review` cover accepting incoming bet requests and reviewing a user's bets (`/betting/accept-bets`, `/betting/review-user-bets`, `/betting/resolved-bets`).

## How to get to it (user POV)

- Betting tab in the footer. The tab appears only for users who are players in the session, and it shows a badge with the number of incoming bet requests.
- Home tab, `Place Bet for ...` buttons on the Happening Now and Up Next cards.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`, who is a player in the seeded session.

- **Dashboard.** Run `$V browser tap --role link --name Betting --within nav`, then `$V browser wait --text "Overall Win %"`. `snapshot` shows the three stats, `heading " Open Bets (N)"`, and `heading " Settled Bets (N)"`.
- **Form from Betting.** Run `$V browser tap --role link --name Custom`, then `$V browser wait --url place-bet`. The URL ends in `?betType=custom`, the heading reads `Your score: <n>`, and `button "Submit Bet" [disabled]` is present.
- **Form from Home.** Go to Home and tap `--role button --name "Place Bet for Magic school"` (the event name comes from the Up Next card). The place-bet form opens with the bet type preselected.
- **Fill without submitting.** Run `$V browser tap --role combobox --name "Select an opponent"`, tap an option such as `--role option --name Leo`, then `$V browser fill --role textbox --name "Bet Terms" --value "verification only"`. `Submit Bet` becomes enabled. Stop here unless the change under test is bet submission.
- **Proof.** Save `snapshot` and `screenshot` under `betting/` for the dashboard and the filled form.

## Gotchas

- Submitting, accepting, rejecting, or settling a bet changes the shared local database, so `reset` afterwards. Each insert or update on `bet` fires a trigger that calls the local `push` function. The seed has no push subscriptions, so the edge runtime log shows `No notifications subscriptions found` and nothing is sent.
- The Betting tab is missing for users who are not players in the session. That is not a bug.
- Bet type, opponent, and wager inputs are PrimeNG widgets. Use `--role combobox`, `--role option`, `--role switch`, and `--role spinbutton` rather than CSS classes.
