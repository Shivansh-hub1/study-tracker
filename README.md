# FocusFlow — Study Tracker

A full-stack study tracker with deep-focus timers, an auto weekly timetable generator,
rich progress analytics, and a fully themeable neon UI.

![Stack](https://img.shields.io/badge/Next.js%2014-black) ![DB](https://img.shields.io/badge/SQLite-better--sqlite3-blue) ![Auth](https://img.shields.io/badge/Auth-JWT%20cookie-green)

## ✨ Features

- **Authentication** — email/password signup & login with bcrypt hashing and a 30-day JWT
  session cookie. All pages and APIs are protected by middleware.
- **Focus timers** (`/timer`)
  - **Pomodoro** — configurable work / short-break / long-break / rounds, round dots,
    auto-advance (toggleable in Settings), completed focus blocks log automatically.
  - **Countdown timer** — presets (15–120 min) or any custom duration; finished runs log automatically.
  - **Stopwatch** — laps, pause/resume, "Done" logs the elapsed time as a session.
  - **Works in the background** — timers are clock-based, not tick-based: they stay accurate
    in background tabs, after minimizing the window, and even across page reloads (state is
    persisted and re-synced on return). Optional browser notifications + sound on phase end
    and a live countdown in the browser tab title.
- **Auto weekly timetable maker** (`/timetable`) — pick study days, daily window, session &
  break lengths, intensity and weekly hours per subject; the generator fairly distributes
  subjects across days, inserts short/long breaks, and warns when your request doesn't fit.
  Preview as a color-coded weekly grid, **download as PNG**, **print/save as PDF**, and
  save/reload/delete named plans.
- **Progress analytics** (`/progress`) — daily trend (30d, minutes or sessions), weekly
  comparison bars (12 weeks with % delta), monthly totals (6 months, hours + sessions),
  subject-donut with % bars, balance radar, hour-of-day histogram, timer-style breakdown
  donut, best-day / averages / peak-hour cards, and a 20-week consistency heatmap.
- **Dashboard** (`/dashboard`) — streak, today / week / all-time stats, 30-day area chart,
  subject donut, goals with progress rings, recent sessions, and the heatmap.
- **Full CRUD** — subjects (with colors & weekly targets), sessions (log/edit/delete/filter),
  goals, and timetables. Mutations use **optimistic updates** with rollback + toasts.
- **Export** — sessions as CSV, or the entire account (subjects, sessions, goals, timetables)
  as JSON (`/settings` or the sessions page).
- **Six themes** — Daylight, Midnight, plus four neon modes (Nebula, Matrix, Cyber, Ember),
  switchable from the sidebar, topbar or Settings. Everything (charts included) re-themes.
- **Polished UI** — skeleton loading states, empty states with calls-to-action, responsive
  layout with a collapsible mobile sidebar.

## 🚀 Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

### Demo account

The database seeds itself on first run with a rich demo account (~150 sessions over 75 days,
6 subjects, goals and a saved timetable):

```
email:    demo@study.app
password: demo1234
```

Or click **"Try the demo account"** on the login page. Sign up any time for a fresh, empty account.

### 👑 Owner (admin) account

A master account with full access is created automatically:

```
email:    owner@focusflow.app
password: owner1234
```

Logging in as the owner reveals an **Admin Panel** in the sidebar with:

- Platform stats — total users, active today, total sessions & study time
- All users — search, joined date, last-active ("online now" dot), sessions & study time
- Per-user detail — subjects, goals, recent sessions, totals
- Management — rename users, promote/demote admins, reset passwords, delete users (with full data cascade)
- Safety rails — you can't demote or delete yourself; non-admins get 403s everywhere

**Change the owner password after your first login** (Admin Panel → edit the Owner row).

## ☁️ Deploying to Vercel (free)

The app auto-switches to **Turso** (hosted SQLite) when these environment variables exist —
locally it keeps using the SQLite file, nothing else changes:

| Variable | Where to get it |
|---|---|
| `TURSO_DATABASE_URL` | [turso.tech](https://turso.tech) → create database → copy `libsql://…` URL |
| `TURSO_AUTH_TOKEN` | same page → Generate Token |
| `ST_SECRET` | any long random string (JWT signing) |

Steps: push to GitHub → [vercel.com/new](https://vercel.com/new) → import repo → add the 3 env vars → Deploy.
The owner + demo seed runs automatically on first request after deploy.

## 🗂 Tech & structure

- **Next.js 14 (App Router)** — one server serves UI + REST API under `/api/*`
- **SQLite** via `better-sqlite3` (file at `data/study.db`, created & seeded automatically)
- **Auth**: `jose` JWT in an httpOnly cookie, edge middleware guards all routes
- **Charts**: Recharts + a hand-rolled GitHub-style heatmap
- **PNG export**: `html-to-image`

```
app/
  (auth)/login|signup      auth pages
  (app)/dashboard|timer|subjects|timetable|progress|sessions|settings
  api/auth|subjects|sessions|goals|timetables|settings|stats|export
components/                AppShell, UI kit, Providers (theme/toast), Heatmap
lib/                       db (schema + seed), auth, timetable generator, utils
middleware.ts              route guard
```

## 🔐 Notes

- Set `ST_SECRET` in production to override the dev JWT secret.
- Timer state lives in `localStorage` (per browser); completed study time is stored
  server-side in SQLite per user.
