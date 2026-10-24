# GM override points

The GM can change any player's session score, either by adding or subtracting points or by replacing the score entirely, with an optional reason. The change appears in the rankings and as a transaction for that player.

## Sub-features

- `override-choose` lists every player and score with an `Edit` button.
- `override-add` adds or subtracts a delta and shows Before, Change, and After.
- `override-replace` replaces the score with a new value.
- `override-reason` records an optional `Reason for Override`.
- `override-from-gameboard` opens the "override points" popup from GM gameboard move entry (`Enter Gameboard Moves`).

## How to get to it (user POV)

- GM Tools tab, Players section, `Override Points`.
- Home tab, `Enter Gameboard Moves` (during the gameboard moves phase), then the override points button on a player's move entry.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`, the GM of the seeded session.
- Note Colin's current score from the home rankings before changing it (`$V browser text --role row --name Colin`).

- **Choose player.** Run `$V browser tap --role link --name "GM Tools" --within nav`, then `$V browser tap --role link --name "Override Points"` and `$V browser wait --url override-points`. A table of `Player`/`Score` rows appears, each with `button " Edit"`.
- **Open player.** Run `$V browser tap --role button --name Edit --within 'tr:has-text("Colin")'`, then `$V browser wait --role button --name "Submit Override"`. The URL is `/gm-tools/override-points/<playerId>`, `radio "Add or Subtract Points" [checked]`, and the table rows read `Before <score>`, `Change 0`, `After <score>`.
- **Enter change.** Run `$V browser type --role spinbutton --value 5` (not `fill`, which this number widget ignores) and `$V browser fill --role textbox --name "Reason for Override" --value "verify run $RUN_ID"`. The `After` row shows the score plus 5, and `Submit Override` is enabled.
- **Confirm.** Tap `--role button --name "Submit Override"`, then `$V browser wait --role alertdialog --name Confirmation`. The page also holds empty unnamed `alertdialog` elements, so an unnamed wait times out. The dialog `alertdialog "Confirmation"` asks `Do you want to submit this override for Colin?` and repeats Before, Change, and After. Tap `--role button --name Yes --within '[role=alertdialog]:has-text("Confirmation")'` to submit, or `No` to back out without a change.
- **Submit.** After `Yes`, run `$V browser wait --url /gm-tools/override-points` and check that the URL no longer ends in the player ID. The player's row shows the new score, and `$V browser rest "/player?select=id,score&id=eq.<playerId>"` returns it. Colin's player ID in the seeded session is `119`, and his seeded score is 33.
- **Second view.** On Home, the rankings row for Colin shows the new score. On Analytics, `All Transactions` lists the override with the reason.
- **Restore.** Run `$V reset`. If another run shares the database, repeat with `-5` and reason `verify run $RUN_ID restore` instead. A negative change shows `checkbox "Add lost points to Bank Balance" [checked]`. Untick it with `$V browser tap --role checkbox --name "Add lost points to Bank Balance"` before submitting, or the restore also adds 5 points to the shared bank. Then confirm the original score on Home and the unchanged `Bank Balance`.
- **Proof.** Save `snapshot` and `screenshot` under `gm-override-points/` for the filled form, the updated list, and the restored rankings.

## Gotchas

- Each submit calls the local `push` function's `/override` route. With no seeded push subscriptions it answers 500 `No notifications subscriptions found`, which logs one `Failed to load resource ... 500` console error. That error is expected.
- A manual restore leaves two transactions behind, which you cannot delete through the UI. `reset` removes both.
- Typing a negative number logs `NG02100: InvalidPipeArgument: '33- is not a number'` while only `-` has been entered. This is a known app bug in the After cell, not a harness fault. Mention it, do not hide it.
- `Replace Score Entirely` changes what the spinbutton means. Record the original score before using it.
- Non-GMs who open `/gm-tools` get the alert `You are not authorized to view this page.` and land on `/home`. The browser auto-accepts it and logs it.
