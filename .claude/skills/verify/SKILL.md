---
name: verify
description: Launch EventMaster Pro (the Angular + Supabase PWA in this repo) on a local dev server and drive it in a headless phone browser (iPhone on WebKit or Android on Chromium) to prove a UI change works the way a player or GM would see it. Use whenever a change touches anything a user can see or do in the app, before calling the work done.
---

# Verify EventMaster Pro

EventMaster Pro is a mobile PWA. Players install it on iPhone or Android and use it full screen, so every verification runs in an emulated phone: Playwright's `iPhone 16 Pro` profile on WebKit by default (touch, 402x874 standalone viewport, DPR 3, iOS Safari UA). Desktop-size screenshots are not proof.

All commands go through one helper. Run them from the repo root:

```sh
V=.claude/skills/verify/bin/emp-verify
export RUN_ID=$(date +%Y%m%d-%H%M%S)   # one id per verification run
```

| Path                                          | Holds                                                            | Survives cleanup |
| --------------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| `$TMPDIR/emp-verify/$RUN_ID/`                 | pids, dev-server log, browser console log                        | no               |
| `tmp/verify/$RUN_ID/` (repo root, gitignored) | evidence: screenshots, ARIA snapshots, REST reads, `console.log` | yes              |

## What you are driving

- The dev server (`ng serve`) builds the app from this checkout. In its default configuration the app calls the dev server's own origin, and the dev server proxies the Supabase API paths to this checkout's local Supabase project. The app never reaches the hosted TEST or PROD projects, whatever `.env` says. An `ng build` of any configuration uses the hosted project in `.env` instead.
- Each checkout and git branch has its own local Supabase project in Docker, on ports the CLI assigns (`npx supabase status </dev/null` prints them). `$V up` runs `npm run start-supabase`, which starts the project if it is down, and leaves it running afterwards.
- `supabase/seed.sql` loads one in-progress session, "Test Jaybies", with `colin` as GM and a player (score 33, 1 prize token), 3 un-won prizes, and 10 more players. The single `game_state` row is global, so a GM action changes the game for every run from this checkout.
- Every seeded account has the password `password`. `$V login` logs in as `colin`, and `$V login leo` logs in as a player who is not the GM. Usernames are the part before `@joshies.app` in `auth.users`.
- Seeded image URLs (avatars, prize images) point at TEST's public storage. The browser loads them read-only; nothing writes to TEST.

## Launch

```sh
$V setup            # once per machine: installs Playwright + WebKit + Chromium into ~/.cache/emp-verify/node
$V up               # ng serve on 127.0.0.1, first free port from 4310; blocks until the page serves
$V browser start    # phone browser holding one context for this run
$V login [user]     # clears the old session, logs in as colin (or user) with the seeded password, waits for /home
```

`up` is ready when it prints `ready: http://127.0.0.1:<port>` (the log shows `Local:` and `/` returns the `<joshies-root>` shell). A cold build takes 10 to 30 s. Each `browser start` creates a fresh context, so run `login` again after it.

Android instead of iPhone: `$V browser stop`, then `EMP_VERIFY_DEVICE="Pixel 8" $V browser start` (Chromium). Any Playwright device name works, for example `iPhone 16e` or `Galaxy S24`. Verify on both platforms when the change touches layout, safe areas, touch handling, or input widgets.

Two runs can coexist. Each gets its own port, browser, and state dir. Runs from different worktrees also get different databases. Two runs from the same checkout share its database, so they must not mutate the same rows, and neither may reset while the other is up.

## Reset

```sh
$V reset            # npm run reset-supabase: reapply every migration and the seed
$V login
```

Start a run from `reset` when you need the seeded state, and use it to undo whatever a run changed. It takes about 10 s, ends every session, and restarts realtime, so log in again afterwards. It first moves this run's browser off the app. If the page still had requests in flight, WebKit logs them as `... due to access control checks` page errors, which are expected. It refuses while another run from this checkout has a live dev server or browser, because that run shares the database. Runs from other worktrees do not block it. `--force` resets anyway. The output goes to `$TMPDIR/emp-verify/$RUN_ID/reset.log`.

## Doctor

Run this first, and again whenever anything looks off:

```sh
$V doctor
```

All lines must be `ok`. It checks that the auth service of this checkout's local project answers, that its database holds exactly this checkout's migrations, that this run's dev server process group owns its port, serves EventMaster Pro, and proxies Supabase to the project, and that every Supabase API call the page has made went to the dev server (`ok the app calls only http://127.0.0.1:4310, which proxies to http://127.0.0.1:<API port>`). It prints `INFO` while the page has made no API call yet, and when other runs from this checkout share the database. It also prints the device, current URL, and logged-in user (`session colin@joshies.app ...`). `$V status` lists every run on this machine with dev-server and browser state and the checkout it came from. Never drive a run you did not start.

## Drive

`$V browser <command>` sends one action to the run's browser and prints the result. Exit code 1 means the action failed. Paths are relative to the dev server, and `--path` values are relative to the evidence dir.

| Command                                                                 | Does                                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `goto /betting`                                                         | load a route (full page load; Angular boots again)                                       |
| `tap --role link --name "Analytics" --within nav`                       | touch-tap an element; use `tap`, not `click`, since this is a touch device               |
| `fill --placeholder Username --value colin`                             | set an input's value                                                                     |
| `type --role spinbutton --value -5`                                     | clear and type real keystrokes; needed for Optimus UI number inputs, which ignore `fill` |
| `press --key Enter`                                                     | keyboard key                                                                             |
| `back`                                                                  | browser back (the iOS swipe-back gesture)                                                |
| `wait --url /home` / `wait --role table` / `wait --text "Saved" --gone` | wait for a URL substring, or for an element to appear or disappear                       |
| `text --role heading --name "Colin"` / `count --role row`               | read text or count matches                                                               |
| `dialog --value "New name"` / `dialog --dismiss`                        | answer the next native `prompt`/`confirm`/`alert` (default: accept)                      |
| `snapshot [--path x.aria.txt] [--css sel]`                              | ARIA snapshot of the page, the main way to see what is on screen                         |
| `screenshot --path x.png [--full]`                                      | phone-size screenshot                                                                    |
| `rest "/user?select=display_name&id=eq.<uuid>" [--path x.json]`         | read-only PostgREST GET as the logged-in user, for checking stored state                 |
| `console [--errors] [--tail 80] [--path x.log]`                         | browser console, page errors, dialogs, and navigations for this browser                  |
| `eval "document.title"`                                                 | run JS in the page                                                                       |
| `api`                                                                   | origins of every Supabase API call the page made                                         |
| `whoami`                                                                | device, URL, Supabase origins, session user                                              |

Locators: `--role` + `--name` (substring match unless `--exact`), `--text`, `--placeholder`, `--label`, or `--css`. Add `--within <css>` to scope and `--nth N` to pick a match. Prefer roles and visible names. Examples that work in this app:

- Footer tabs: `tap --role link --name "GM Tools" --within nav`. Tab names have a leading icon glyph, so a substring match is what finds them.
- A button in a table row: `tap --role button --name Edit --within 'tr:has-text("Colin")'`.
- Optimus UI inputs: `--role spinbutton` (with `type`), `--role switch`, `--role checkbox`, `--role combobox --name "Select an opponent"`, `--role radio --name "Replace Score Entirely"`.
- In-app confirm dialogs (Optimus UI, not native): `tap --role button --name Yes --within '[role=alertdialog]:has-text("Confirmation")'`. Native `confirm()`/`prompt()` use the `dialog` command instead.

Any command that triggers a console error, page error, or native dialog appends them under `-- during this command:`. Read that output.

`tap` returns immediately, so its printed URL can be the old one. Follow navigation with `wait --url`. Data comes from Supabase after render, so wait for the element you need (`wait --role table`) instead of sleeping.

The feature map in [`features/README.md`](features/README.md) has the recipe for each user-facing feature. Read the matching file before driving one. When a feature has several entry points, prove each one.

## Evidence

A proof for a change includes:

1. The user action, driven through the real UI path (taps, fills, dialogs), never by calling Supabase or internal setters directly.
2. An ARIA snapshot and a phone screenshot of the resulting state, saved with `--path <feature>/<step>.<ext>`.
3. A second view of the stored state: reload the page, or reach the data through another screen (rankings, analytics, transactions), and where it matters a `rest` read saved with `--path`.
4. `console --errors --path <feature>/console-errors.log`, which should be empty or only contain errors you can explain.
5. The device and engine. Every snapshot header records them, for example `(iPhone 16 Pro, webkit)`.

Side effects outside the page:

- Notifications. GM actions (override points, prize tokens, Send Notifications) call the local `push` edge function, and inserting or updating a `bet` row fires a trigger that calls it too. The seed has no push subscriptions, so no push leaves the machine. A route that notifies everyone (for example `/override`) answers 500 `No notifications subscriptions found`, which shows as one `Failed to load resource ... 500` console error. That error is expected. The functions log (`npx supabase stack logs --service functions --output-format text </dev/null`) shows what the function would have sent. Functions stop after a minute without calls, and the next cold start takes longer than the bet trigger's 1 s timeout, so `net._http_response` can show a timeout for the first bet after a pause. `start-supabase` and `reset-supabase` wake functions, so a bet right after them gets through.
- Push permission. "Enable Push Notifications" on Profile needs a service worker, and dev builds do not register one (`navigator.serviceWorker.getRegistrations()` is empty). You cannot verify it here; say so instead of claiming it works.
- Undo what a run changed with `$V reset` before `down`, unless another run is still using the database. In that case, restore by hand and check the restore with the same second view.

## Cleanup

```sh
$V down
```

This kills only this run's browser server and dev server by process group, copies the browser console log into the evidence dir, deletes `$TMPDIR/emp-verify/$RUN_ID/`, and lists the evidence it kept in `tmp/verify/$RUN_ID/`. Run it after failed attempts too. It never touches other runs or processes it did not start. It leaves this checkout's local Supabase project running. `npm run stop-supabase` stops it, and `npx supabase stack destroy --yes </dev/null` deletes it with its data.

## Helpers

- `bin/emp-verify`: lifecycle (`setup`, `up`, `doctor`, `browser start|stop|<command>`, `login`, `reset`, `status`, `down`). Run it with no arguments to print usage.
- `bin/browser-server.mjs`: the long-lived Playwright process that holds the phone context. `browser start` launches it, and it reads `EMP_VERIFY_DEVICE` (default `iPhone 16 Pro`) and `EMP_VERIFY_ENGINE` (default: the device's engine).
- `bin/browser.mjs`: the client behind `$V browser <command>`.

Environment overrides: `EMP_VERIFY_PORT` (first port to try, default 4310), `EMP_VERIFY_DEVICE`, `EMP_VERIFY_ENGINE`, `EMP_VERIFY_PW_HOME` (Playwright install dir).
