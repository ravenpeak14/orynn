# Orynn

> **"What am I doing today, and when?"**

Orynn is a personal daily planner that shows your day as a calm, vertical timeline. It combines a **weekly routine** (templates resolved when a date is viewed, never copied forward), **one-off schedules**, and **per-date overrides** of the routine, then derives your **free time** from the gaps.

It is a mobile-first PWA (installable on iPhone and Android) backed by a Laravel REST API.

## Features

- **Today timeline**: date selector (Monday–Sunday), a "Now" card with the time left, activities and free-time gaps in one continuous line, and overlap warnings.
- **Weekly routine**: recurring activities per weekday, which can be paused or edited once for every week.
- **Single-day changes**: skip, move, rename or mark one occurrence as done without touching the routine.
- **Categories and reminders**: pastel category colors and icons; reminder settings (5–60 minutes) are stored and shown.
- **Accounts**: register, login, profile, timezone and password change.
- **PWA**: installable and offline-capable app shell. Private API data is never cached by the service worker.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Router, vite-plugin-pwa |
| Backend | Laravel 12 (PHP 8.2+), Laravel Sanctum (SPA cookie auth) |
| Database | MySQL / MariaDB (SQLite in-memory for tests) |
| Tests | PHPUnit (API), Vitest (frontend logic) |

## Project structure

```text
Orynn/
├── Orynn_Final_Documentation/   PRD, API spec, database schema, security, UI style guide
├── backend/                     Laravel API
│   ├── app/Services/            TimelineService (timeline resolution), OverlapChecker
│   ├── app/Http/                Controllers, FormRequests (validation + ownership), Resources
│   └── tests/                   Feature tests (auth, IDOR, timeline, overrides...)
└── frontend/                    React PWA
    └── src/
        ├── features/            today, weekly, settings, auth
        ├── components/          AppShell, Sheet, UI primitives
        └── lib/                 API client, date/time/timeline logic
```

## Running locally

### Prerequisites

- PHP 8.2+ with `pdo_mysql`, Composer 2
- Node.js 20+
- MySQL 8 or MariaDB 10.4+ (for example XAMPP)

### 1. Backend (http://127.0.0.1:8000)

```bash
cd backend
composer install
cp .env.example .env          # set DB_DATABASE / DB_USERNAME / DB_PASSWORD
php artisan key:generate
php artisan migrate --seed    # creates the demo account
php artisan serve --host=127.0.0.1 --port=8000
```

Create the database first, e.g. `CREATE DATABASE orynn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.

### 2. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

In development, Vite proxies `/api` and `/sanctum` to the Laravel server, so the SPA and API share one origin and no CORS setup is needed.

### Demo account

```text
Email:    demo@orynn.test
Password: password123
```

The seeder adds a weekly routine (swimming, university, gym, coding...) and two one-off schedules.

## Tests and checks

```bash
# Backend: 55 tests, SQLite in-memory
cd backend && php artisan test

# Frontend
cd frontend
npm test          # Vitest: date, time and timeline logic
npm run lint      # ESLint
npm run build     # type-check + production build + service worker
```

The backend tests cover the security rules from `04-Security.md`:
- Cross-user access returns 404 for GET, PUT, PATCH and DELETE.
- Another user's category or template IDs are rejected.
- Invalid time ranges return 422.
- Logins are rate-limited (429).
- Logout invalidates the session.

## Deployment notes

Example domains: frontend `https://orynn.example.com`, API `https://api.example.com`. Both must be on the same parent domain, because the session cookie is shared.

**Backend `.env`**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://orynn.example.com        # the only allowed CORS origin
SANCTUM_STATEFUL_DOMAINS=orynn.example.com
SESSION_DOMAIN=.example.com
SESSION_SECURE_COOKIE=true
DB_USERNAME=orynn                             # dedicated user, not root
```

Then run `php artisan migrate --force` and `php artisan config:cache`.

**Frontend**

- Build with `VITE_API_URL=https://api.example.com npm run build` and serve `dist/` over HTTPS.
- Configure SPA fallback to `index.html`.
- Keep `Referrer-Policy: strict-origin-when-cross-origin`, because Sanctum identifies the SPA by its Origin/Referer.
- Recommended CSP: `default-src 'self'; connect-src 'self' https://api.example.com; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'`.

**Icons**

- `npm run icons` regenerates the PWA icons from `frontend/public/logo.svg`.

## Documentation

- [Product Requirements](Orynn_Final_Documentation/01-PRD.md)
- [API Specification](Orynn_Final_Documentation/02-API-Spec.md)
- [Database Schema](Orynn_Final_Documentation/03-Database-Schema.md)
- [Security Specification](Orynn_Final_Documentation/04-Security.md)
- [UI Style Guide](Orynn_Final_Documentation/05-UI-Style.md)

## Roadmap

- **V1.1:** reminder notifications (Web Push), weekly overview, schedule search.
- **V1.2:** calendar integration, presets, statistics.
- **V2:** smart and AI-assisted planning.
