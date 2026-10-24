# Prizes

Players spend a Prize Token at the Prize Machine to win a random, unique prize image from the session's Prize Pool. The prizes tab shows the machine, the player's token count, and the prizes they own. The GM manages the pool (uploads images, sets whether event winners earn tokens) and adjusts each player's tokens.

## Sub-features

- `prizes-machine` is the Prize Machine with a `Spin` button. It shows `EMPTY` and a disabled `Spin` when the pool has no un-won prizes.
- `prizes-spin` spends one token and awards one un-won prize.
- `prizes-yours` lists `Your Prizes`, or `Your prizes will appear here once you win them.`.
- `prizes-badge` is the footer `Prizes` tab, which shows only with tokens or prizes and carries a token-count badge.
- `prizes-gm-pool` is GM Tools, `Manage Prize Pool`: the `Award token to event winners` switch, `Choose Images` upload, and the Un-Won and Won lists.
- `prizes-gm-tokens` is GM Tools, `Adjust Prize Tokens`: a per-player token count with minus and plus buttons.
- `prizes-past` is Analytics, `Past Prizes`, for prizes from earlier sessions.

## How to get to it (user POV)

- Prizes tab in the footer.
- GM Tools tab, Prizes section.
- Analytics tab, Previous Sessions, `Past Prizes`.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`. The seed gives `colin` and 5 other players 1 token each, gives the other 5 players none, and puts 3 un-won prizes (ids 10, 11, 12) in the pool.

- **Machine.** Run `$V browser tap --role link --name Prizes --within nav`, then `$V browser wait --role heading --name "Your Prizes"`. With an empty pool, `snapshot` shows `text: EMPTY`, `The Prize Pool is empty. Tell the GM to add more!`, and `button " Spin" [disabled]`.
- **Pool.** Run `$V browser tap --role link --name "GM Tools" --within nav`, then `$V browser tap --role link --name "Manage Prize Pool"`. `snapshot` shows `heading "Un-Won Prizes (N)"` and `heading "Won Prizes (N)"`, which should agree with the machine state.
- **Tokens.** Tap `Adjust Prize Tokens`. Each row is `<name> <tokens>` with two icon buttons. Minus is `$V browser tap --css button --within 'tr:has-text("Colin")' --nth 0` and plus is `--nth 1`. The token cell and the footer `Prizes` badge both change. Restore with the opposite button, or `reset`.
- **Spin.** This requires at least one un-won prize and one token. Tap `--role button --name Spin`, then `$V browser wait --role button --name "Hell yeah" --timeout 20000` for the reveal, and tap `Hell yeah` to close it. Confirm the new prize under `Your Prizes`, a lower badge count, and the prize under `Won Prizes` on Manage Prize Pool.
- **Proof.** Save `snapshot` and `screenshot` under `prizes/` for the machine, the pool, and the token table.

## Gotchas

- The app cannot revoke a won prize, not even for the GM. `$V reset` is the only way to put it back in the pool.
- Adding prizes needs `Choose Images`, a native file picker that `emp-verify` does not drive. If the pool is empty, `reset` refills it.
- Adding a token calls the local `push` function's `/prize-token` route. With no seeded push subscriptions it sends nothing and answers 500, which logs one expected `Failed to load resource ... 500` console error.
- The token buttons have no accessible names, so select them by position within the row.
