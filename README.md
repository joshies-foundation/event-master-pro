<h1 align="center">EventMaster Pro</h1>

<p align="center">Supercharge dynamic, multi-day competitions with realtime brackets, betting, analytics, and more</p>

<p align="center">
  <img alt="EventMaster Pro Logo" height="200" width="100%" src="https://colinaw.com/images/logos/emp.svg" />
</p>

## About

Forget the admin, and focus on the games. EventMaster Pro saves you hours of manual work by performing automatic score calculations, managing realtime brackets, and operating a player-to-player point-betting system. And what's a competition without detailed analytics?

[![Angular](https://img.shields.io/badge/angular-%23DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Getting Started

Install [mise](https://mise.jdx.dev/getting-started.html) and activate it in your shell. You also need [Git](https://git-scm.com/) and a running [Docker](https://docs.docker.com/get-docker/).

```sh
git clone https://github.com/joshies-foundation/event-master-pro.git
cd event-master-pro
mise install
npm install
npm run start-supabase
npm start
```

Open http://localhost:4200 and log in as `colin` (the GM) or `leo` (a player). Every seeded user has the password `password`. On a phone on the same Wi-Fi, open `http://<your computer's LAN IP>:4200`.

Each checkout and git branch gets its own local Supabase project, so run `npm run start-supabase` again after you switch branches. Start it before `npm start`. `npx supabase status` prints its URLs, including Studio.

### Database

| Command                            | What it does                                                             |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `npm run reset-supabase`           | Rebuilds the local database from the migrations and `supabase/seed.sql`. |
| `npm run create-migration <name>`  | Writes the local schema changes to a new migration.                      |
| `npm run generate-db-types`        | Regenerates `src/app/shared/util/schema.ts` from the local database.     |
| `npm run save-seed`                | Overwrites `supabase/seed.sql` with the local data.                      |
| `npm run edge-function-logs`       | Follows the edge function logs.                                          |
| `npm run stop-supabase`            | Stops the local project and keeps its data.                              |
| `npx supabase stack destroy --yes` | Deletes this checkout's local project and its data.                      |

To change the schema, change the local database, then run `create-migration`, `reset-supabase`, and `generate-db-types`.

### End-to-end tests

```sh
npx playwright install webkit chromium   # once per machine
npm run e2e
npm run e2e -- --ui                      # also takes --project=iphone or a spec file
```

The local Supabase project must be running. Each test resets the local database to `supabase/seed.sql`, so you lose local changes and logins.

### Builds and deploys

`ng build` and `npm run deploy` use the hosted Supabase project named in `.env`. Only `npm start` uses the local one.

```sh
cp .env.example .env
```

A push to `main` that passes CI deploys to `joshies.app`. To deploy by hand, point `.env` at PROD, sign in with `npx cf auth login`, and run `npm run deploy`.

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
