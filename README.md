<h1 align="center">EventMaster Pro</h1>

<p align="center">Supercharge dynamic, multi-day competitions with realtime brackets, betting, analytics, and more</p>

<p align="center">
  <img alt="EventMaster Pro Logo" height="200" width="100%" src="https://colinaw.com/images/logos/emp.svg" />
</p>

## About

Forget the admin, and focus on the games. EventMaster Pro saves you hours of manual work by performing automatic score calculations, managing realtime brackets, and operating a player-to-player point-betting system. And what's a competition without detailed analytics?

### Technology Stack

[![Angular](https://img.shields.io/badge/angular-%23DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) v24
- [Docker](https://docs.docker.com/get-docker/), running. The local Supabase project runs in containers.

### Install

```sh
git clone https://github.com/joshies-foundation/event-master-pro.git
cd event-master-pro
npm install
```

### Start the local Supabase project

```sh
npm run start-supabase
```

The first start downloads the Supabase images and takes a few minutes. It creates a local Supabase project, applies every migration in `supabase/migrations`, and loads `supabase/seed.sql`. `supabase/supabase.lock` pins the image versions.

Each checkout and git branch gets its own project, with its own database, on ports that the CLI picks and keeps across restarts. Two worktrees never share a database, and switching branches switches to another project, so run `npm run start-supabase` again after you switch. `npx supabase status` prints the URLs, including Supabase Studio. Postgres starts right away. The other services start on their first request.

### Run the app

```sh
npm start
```

Open http://localhost:4200 and log in as `colin` with the password `password`. Colin is the Game Master of the seeded in-progress session "Test Jaybies". Every seeded user has the password `password`, so you can also log in as a regular player such as `leo`.

To try the app on a phone, connect it to the same Wi-Fi network and open `http://<your computer's LAN IP>:4200`. The dev server (`npm start`, which runs `ng serve`) forwards the Supabase API paths to this checkout's local project, so the phone reaches it through port 4200 without extra setup. The dev server reads the project's address when it starts, so start the project first. It ignores the Supabase values in `.env`.

Dev builds do not register the service worker, and the seed has no push subscriptions. Actions that send push notifications run the local `push` edge function, which logs what it would send and sends nothing.

### Database tasks

| Command                            | What it does                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run reset-supabase`           | Rebuilds the local database from the migrations and `supabase/seed.sql`. Ends every login.   |
| `npm run create-migration <name>`  | Writes the difference between the local database and the migrations to a new migration file. |
| `npm run generate-db-types`        | Regenerates `src/app/shared/util/schema.ts` from the local database.                         |
| `npm run save-seed`                | Overwrites `supabase/seed.sql` with the data now in the local database.                      |
| `npm run edge-function-logs`       | Prints the edge function logs and follows new lines.                                         |
| `npm run stop-supabase`            | Stops the local project. The data stays until the next reset.                                |
| `npx supabase stack destroy --yes` | Deletes the local project of this checkout and branch, with its data.                        |
| `npx supabase stack list`          | Lists every local project on this computer.                                                  |

To change the schema, make the change in the local database (in Studio or with SQL), run `npm run create-migration <name>`, then run `npm run reset-supabase` to check that the migrations rebuild it. Run `npm run generate-db-types` after any schema change.

### End-to-end tests

```sh
npx playwright install webkit chromium   # once per machine
npm run e2e
```

The tests in `e2e/` drive the app the way players and the GM use it, on an emulated iPhone 16 Pro (WebKit) and Pixel 8 (Chromium). CI runs only the iPhone project. Playwright starts its own `ng serve` on a free port and never reuses a dev server you already have running. The local Supabase project of this checkout must be up.

Each test starts by putting the local database back to `supabase/seed.sql`, which takes under a second. That wipes whatever you changed in the local database, including logins. Tests run one at a time because they share that database. Runs in two worktrees use two databases, so they can overlap. `E2E_PORT` and `E2E_DB_URL` override the port and the database. A test fails if the page logs a console error that the test did not expect.

Useful variations:

| Command                              | What it does                                            |
| ------------------------------------ | ------------------------------------------------------- |
| `npm run e2e -- --project=iphone`    | Runs on the iPhone only, which halves the time.         |
| `npm run e2e -- e2e/betting.spec.ts` | Runs one file.                                          |
| `npm run e2e -- --ui`                | Opens Playwright's UI to step through tests and traces. |
| `npx playwright show-report`         | Opens the report of the last run, with failure traces.  |

### Builds

Every `ng build` talks to the hosted Supabase project named in `.env`, in both the production and development configurations. That includes `npm run build`, both deploy scripts below, and `ng serve --configuration production`. Only `ng serve` in its default configuration swaps in the local project. Create `.env` and fill in the variables:

```shell
cp .env.example .env
```

`NG_APP_SUPABASE_PUBLISHABLE_KEY` is the project's publishable key (`sb_publishable_...`, under Settings > API Keys in the Supabase dashboard). The app never uses the legacy `anon` key.

### Deploys

The app runs on Cloudflare Workers as a Worker named `event-master-pro` that serves the build output as static assets on `joshies.app`. `cloudflare.config.ts` configures the Worker, and `wrangler.config.ts` names the assets directory. Paths that are not files get `index.html`, so Angular handles every route.

The `cf` CLI does not build Angular projects yet. Its `cf build` and plain `cf deploy` fail with `Unknown argument: prod`. `npm run deploy` builds the production configuration with `ng build`, packages the output with `cf-wrangler build`, and uploads it to `joshies.app` with `--prebuilt`.

The build reads the Supabase project from `.env`, so point `.env` at PROD before `npm run deploy`. Sign in first with `npx cf auth login`, or set `CLOUDFLARE_API_TOKEN`.

GitHub Actions deploys for you. Every pull request and every push to `main` runs lint, a production build, and the end-to-end tests. A push to `main` that passes deploys to `joshies.app` and then checks that the site answers. The workflow reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the repository secrets, and the `NG_APP_` variables from the `production` environment.

## Authors

<a href="https://github.com/c-o-l-i-n">
  <img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/40863449?v=4&w=140&fit=cover&mask=circle&maxage=7d" style="width: 70px" align="left" alt=""/>
</a>

**Colin A. Williams**

Website: [colinaw.com](https://colinaw.com)
<br>
Github: [@c-o-l-i-n](https://github.com/c-o-l-i-n)

<a href="https://github.com/theuphonist">
  <img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/120233007?v=4&w=140&fit=cover&mask=circle&maxage=7d" style="width: 70px" align="left" alt=""/>
</a>

**Josh T. Mack**

Github: [@theuphonist](https://github.com/theuphonist)

<br/>
<a href="https://github.com/SimBuckeye">
  <img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/9426441?v=4&w=140&fit=cover&mask=circle&maxage=7d" style="width: 70px" align="left" alt=""/>
</a>

**Leo Steinkerchner**

Github: [@SimBuckeye](https://github.com/SimBuckeye)

## License

Copyright © 2023 [Colin A. Williams](https://github.com/c-o-l-i-n), [Josh T. Mack](https://github.com/theuphonist), and [Leo Steinkerchner](https://github.com/SimBuckeye).
