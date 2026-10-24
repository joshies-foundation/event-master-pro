# EventMaster Pro verification map

This directory is the maintained source for verifying the user-facing behavior of EventMaster Pro. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- A run is up: `$V up`, `$V browser start`, `$V login`, where `V=.claude/skills/verify/bin/emp-verify` and `RUN_ID` is exported.
- `$V doctor` prints only `ok` lines, the device line names a phone, and the session is `colin@joshies.app`.
- `doctor` reports `ok the app calls only http://127.0.0.1:55321`, the local Supabase stack.
- The seeded session "Test Jaybies" is `in_progress`, and `colin` is its GM and a player. If the home page shows something else, an earlier run changed the database. Run `$V reset` and `$V login` to get the seeded state back.
- Never drive a run you did not start.

## Driving conventions

- Start from `/home` unless a recipe says otherwise. Move between tabs by tapping the footer (`--within nav`), the way a player does. Use `goto` only for deep links the app itself produces.
- Use `tap`, not `click`. The browser is a touch device.
- Prefer roles and visible names. Footer and card link names start with an icon glyph, so match by substring (the default).
- Wait for data-driven elements (`wait --role table`, `wait --text ...`) before asserting. Supabase data arrives after first render.
- Native `prompt`/`confirm`/`alert` dialogs are answered by `dialog` before the triggering tap. The default is accept.
- Undo a run's changes with `$V reset` before `down`. While another run shares the database, restore by hand and prove the restore instead.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes `snapshot --path <feature>/<step>.aria.txt` and `screenshot --path <feature>/<step>.png`.
- Mutation proof includes a second view: a reload, another screen that shows the same data, or `rest ... --path <feature>/<step>.json`.
- Save `console --errors --path <feature>/console-errors.log` at the end of each feature.
- Record the device and engine. Snapshot headers include them.
- Report an unreachable path with the command you ran and the precondition that was not met.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then has exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with emp-verify` starts with `Preconditions:` and has labeled bullets that pair each user action with an exact command and an observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Log in and sign out](./auth.md): username login, bad-password error, route guard, sign out.
- [Home](./home.md): session header, Happening Now / Up Next cards, bank balance, current rankings, footer tabs.
- [Profile](./profile.md): display name edit, Squidward Mode, login username, sign out entry.
- [Betting](./betting.md): betting dashboard stats, open and settled bets, place-bet form.
- [GM override points](./gm-override-points.md): GM changes a player's score by delta or replacement.
- [Prizes](./prizes.md): Prize Machine spin, tokens badge, your prizes, GM prize pool and tokens.
- [Analytics](./analytics.md): points chart, transactions, gameboard, duel, and previous-session stats.
