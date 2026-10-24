# Log in and sign out

A player logs in with a username and password (the app appends `@joshies.app`), sees an error toast for bad credentials, is redirected to the login page when signed out, and signs out from Profile after a confirm dialog.

## Sub-features

- `auth-login` logs in and lands on `/home`.
- `auth-bad-password` shows `Error Invalid login credentials` and stays on the login page.
- `auth-guard` sends a signed-out visitor from any app route to `/auth/login`.
- `auth-signout` asks `Are you sure you want to sign out?` and returns to `/auth/login`.

## How to get to it (user POV)

- Open the app while signed out. Any route lands on the login page.
- Profile tab, `Sign Out` button.

## Driving it with emp-verify

Preconditions:

- A run is up with `browser start` done. `login` is not required, because this feature covers it.
- `.claude/skills/verify/.env.local` holds the TEST username and password.

- **Login.** Run `$V login`. It runs `goto /auth/login`, fills `--placeholder Username` and `--placeholder Password`, taps `--role button --name "Log In"`, and waits for `/home`. `$V browser whoami` prints `session colin@joshies.app`.
- **Sign out.** Run `$V browser tap --role link --name Profile --within nav`, then `$V browser tap --role button --name "Sign Out"`, then `$V browser wait --url /auth/login`. The tap output shows `dialog.confirm Are you sure you want to sign out? -> accept`, and `whoami` prints `session none`.
- **Guard.** While signed out, run `$V browser goto /gm-tools`, then `$V browser eval "location.pathname"`. The result is `"/auth/login"`.
- **Bad password.** Fill `Username` with `colin` and `Password` with `wrong-password`, then tap `Log In`. `$V browser snapshot` shows an `alert` containing `Error Invalid login credentials`, and the URL stays `/auth/login`.
- **Proof.** Save `snapshot --path auth/<step>.aria.txt` and `screenshot --path auth/<step>.png` after each step. Run `$V login` again at the end so later features start logged in.

## Gotchas

- The bad-password attempt logs `console.error Failed to load resource: ... 400`. That error is expected, so do not report it as a regression.
- `Log In` stays disabled until both fields are non-empty.
- To cancel sign out, run `$V browser dialog --dismiss` before the tap. The user stays logged in.
- Every `browser start` begins signed out. Sessions do not carry across browser restarts.
