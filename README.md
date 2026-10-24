<h1 align="center">EventMaster Pro</h1>

<p align="center">Supercharge dynamic, multi-day competitions with realtime brackets, betting, analytics, and more</p>

<p align="center">
  <img alt="EventMaster Pro Logo" height="200" width="100%" src="https://colinaw.com/assets/images/logos/emp.svg" />
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
- [Docker](https://docs.docker.com/get-docker/), running. The local Supabase stack runs in containers.

### Install

```sh
git clone https://github.com/joshies-foundation/event-master-pro.git
cd event-master-pro
npm install
```

### Start the local Supabase stack

```sh
npm run start-supabase
```

The first start downloads the Supabase images and takes a few minutes. The stack applies every migration in `supabase/migrations` and loads `supabase/seed.sql`. It uses ports 55320 to 55329, so it can run next to another project's Supabase stack on the default ports. Supabase Studio is at http://127.0.0.1:55323.

### Run the app

```sh
npm start
```

Open http://localhost:4200 and log in as `colin` with the password `password`. Colin is the Game Master of the seeded in-progress session "Test Jaybies". Every seeded user has the password `password`, so you can also log in as a regular player such as `leo`.

To try the app on a phone, connect it to the same Wi-Fi network and open `http://<your computer's LAN IP>:4200`. The dev server (`npm start`, which runs `ng serve`) builds an app that talks to the Supabase stack on the same host at port 55321, so the phone reaches your local stack without extra setup. The dev server ignores the Supabase values in `.env`.

Dev builds do not register the service worker, and the seed has no push subscriptions. Actions that send push notifications run the local `push` edge function, which logs what it would send and sends nothing.

### Database tasks

| Command                           | What it does                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run reset-supabase`          | Rebuilds the local database from the migrations and `supabase/seed.sql`. Ends every login.   |
| `npm run create-migration <name>` | Writes the difference between the local database and the migrations to a new migration file. |
| `npm run generate-db-types`       | Regenerates `src/app/shared/util/schema.ts` from the local database.                         |
| `npm run save-seed`               | Overwrites `supabase/seed.sql` with the data now in the local database.                      |
| `npm run serve-edge-functions`    | Runs the edge functions in the foreground and prints their logs.                             |
| `npm run stop-supabase`           | Stops the local stack. The data stays until the next reset.                                  |

To change the schema, make the change in the local database (in Studio or with SQL), run `npm run create-migration <name>`, then run `npm run reset-supabase` to check that the migrations rebuild it. Run `npm run generate-db-types` after any schema change.

### Builds

Every `ng build` talks to the hosted Supabase project named in `.env`, in both the production and development configurations. That includes `npm run build`, the Cloudflare Pages deploys (production from `main`, a development-configuration preview for every other branch), and `ng serve --configuration production`. Only `ng serve` in its default configuration swaps in the local stack. Create `.env` and fill in the variables:

```shell
cp .env.example .env
```

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
