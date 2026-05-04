# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # React Router typegen + tsc
npm run test         # Run all tests (Vitest)
npm run test -- --run app/services/courseService.test.ts  # Run single test file
npm run db:migrate   # Apply Drizzle migrations
npm run db:generate  # Generate new migration from schema changes
npm run db:seed      # Seed database (scripts/seed.ts)
```

### Architecture

**Framework**: React Router v7 with SSR enabled. Routes live in `app/routes/` using file-based routing declared in `app/routes.ts`. The main app shell is `app/routes/layout.app.tsx`, which loads current user, recent courses, and PPP tier info server-side, then renders the Sidebar and nested Outlet.

**Database**: SQLite via better-sqlite3 + Drizzle ORM. Schema defined in `app/db/schema.ts`. The database is instantiated in `app/db/index.ts` with WAL mode and foreign keys enabled. Migrations live in `drizzle/`. The `DATABASE_URL` env var overrides the default `./data.db` path (on Render, this is `/data/data.db` on a persistent disk).

**Services layer** (`app/services/`): All business logic lives here, not in route loaders. Services use positional parameters (not object destructuring). Cascading deletes are handled manually in service functions—database foreign keys alone are not relied upon for cleanup ordering.

**Path alias**: `~/` maps to `./app/`. Use this for all internal imports.

**PPP (Purchasing Power Parity)**: `app/lib/ppp.ts` maps countries to 4 discount tiers (0/30/50/70%). The DevUI (`app/components/dev-ui.tsx`) lets developers simulate different countries without changing the real session.

**Session**: Cookie-based, managed in `app/lib/session.ts`. Stores `userId` and `devCountry`.

**Country detection**: `app/lib/country.server.ts` — server-side only, reads from Cloudflare headers or falls back to DevUI's override.

## Key Schema Concepts

- **Roles**: `Student | Instructor | Admin` (UserRole enum)
- **Course status**: `Draft | Published | Archived`
- **Progress**: Per-lesson `NotStarted | InProgress | Completed`; `progressService` supports duration-weighted and quiz-inclusive progress calculation
- **Teams**: Group purchases via `teams` / `teamMembers`; coupons link to teams

## Testing

Tests use an in-memory SQLite database. `app/test/setup.ts` exports `createTestDb()` (fresh DB with migrations) and `seedBaseData(testDb)` (baseline fixtures). Import these in service tests — never use the real `app/db/index.ts` in tests.

## Routing Patterns

- API-style routes (no UI) follow the `/api/*` naming convention and use `data()` responses
- Loader functions handle all data fetching; actions handle mutations
- The `layout.app.tsx` loader data is available to all nested routes via `useRouteLoaderData`

## Deployment

Deployed on Render.com. On first deploy: `db:migrate` then `db:seed` runs before `start`. The seed script (`scripts/seed.ts`) is idempotent — it checks for existing data before inserting.
