# Home

The home tab shows the current session's name and dates, a "Happening Now" card for the current round phase with its action buttons, an "Up Next" card with the next main event, the player's bank balance, and the live Current Rankings table. The footer tab bar is the main navigation.

## Sub-features

- `home-header` shows the session name as the page heading and the date range under it.
- `home-happening-now` describes the current round phase and offers its actions, such as `Enter Gameboard Moves` for the GM and a `Place Bet for ...` button.
- `home-up-next` names the next main event with a `Place Bet for <event>` button.
- `home-bank` shows `Bank Balance` in points.
- `home-rankings` lists every player with rank, avatar, name, and score. The leader gets a crown (👑) instead of `1`.
- `home-footer` shows Home, Rules, Betting (players only), Prizes (only with prizes or tokens, with a token-count badge), GM Tools (GM only), Analytics, and Profile.

## How to get to it (user POV)

- Log in, which lands on `/home`.
- Home tab in the footer.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`. The seeded session "Test Jaybies" is `in_progress`.

- **Open.** Run `$V browser tap --role link --name Home --within nav`, then `$V browser wait --role table`. `snapshot` shows `heading "Test Jaybies" [level=1]` and `heading " Current Rankings"`.
- **Rankings.** Run `$V browser count --role row`. The header row plus one row per player (11 seeded players). `$V browser text --role row --name Colin` prints Colin's rank and score.
- **Phase card.** The `Happening Now` paragraph names the phase, for example `Gameboard moves for turn 1 of 3.`. As GM, `--role button --name "Enter Gameboard Moves"` is visible.
- **Footer.** `$V browser snapshot --css nav` lists the tabs. For `colin` this includes `GM Tools` and a `Prizes` link whose name includes the token count.
- **Proof.** Save `snapshot --path home/home.aria.txt` and `screenshot --path home/home.png`. Use `screenshot --full` to capture the rankings below the fold.

## Gotchas

- The footer is fixed at the bottom of the screen and overlaps content in non-full screenshots. Use `--full` for long pages.
- Rankings update over Supabase realtime. A score change made elsewhere shows up without a reload. Wait for the new value instead of reloading immediately.
- Every page ARIA snapshot ends with an unnamed `alertdialog`. That is the app-wide confirm dialog host, not an open dialog.
- The card text depends on the global `game_state` row (phase and round), which other runs on this machine can change. Assert on what the phase implies, not on a fixed sentence, unless you set the phase yourself.
