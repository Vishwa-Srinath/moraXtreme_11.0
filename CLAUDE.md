# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

MoraXtreme 11.0 — the website for a coding competition run by the IEEE Student Branch, University of Moratuwa. It has a public landing page, a team registration wizard (`/register`), and an admin dashboard (`/dashboard`).

## Commands

```bash
npm run dev          # dev server on http://localhost:6001
npm run build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier (no semicolons, double quotes, tailwind class sorting)

npm run db:generate  # generate a migration from src/lib/db/schema.ts into drizzle/
npm run db:migrate   # apply migrations
npm run db:push      # push schema directly (local prototyping only)
npm run db:studio
npm run auth:generate  # regenerate Better Auth tables after changing src/lib/auth.ts
```

There is no test suite. Verify changes with `npm run typecheck` and `npm run lint`.

Environment: copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL), `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (`http://localhost:6001` in dev).

## Stack

Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui on `@base-ui/react` (style `base-vega`, not Radix), Drizzle ORM + `pg`, Better Auth (email/password + `admin` plugin), react-hook-form + zod v4, sonner. Path alias `@/*` → `src/*`. Add UI primitives with `npx shadcn@latest add <component>`.

Next.js 16 has breaking changes from older versions. Read `node_modules/next/dist/docs/` before relying on Next APIs.

## Architecture

**Data layer.** All tables live in one file, `src/lib/db/schema.ts`: the Better Auth tables (`user`, `session`, `account`, `verification`, `passkey`) plus the app tables `universities`, `teams`, `team_members`, and `app_settings` (a key/jsonb store). `src/lib/db/index.ts` exports a single `db` built on a `pg` Pool. Migrations are committed in `drizzle/`.

**Registration domain (`src/lib/registration/`).** This folder holds the business logic. API routes are thin wrappers around it.
- `schema.ts` defines the zod schemas and the email/WhatsApp normalization for participants.
- `constants.ts` lists the countries and known universities, plus an "other university" sentinel.
- `db.ts` handles submission. In-progress drafts live only in the browser (`localStorage`); the server never stores or returns drafts, so there is no endpoint that reads participant data by email. `/api/register/submit` inserts a new `teams` row with `status: "submitted"` and a `registrationCode`, rejecting any email or WhatsApp number already on a submitted team. (The `draft` enum value is legacy.)
- `settings.ts` reads the open time, close time, force-closed flag, and closed message from `app_settings` and computes registration availability on the server. `/register` shows a closed state instead of the wizard when registration is not open.
- `admin.ts` holds the dashboard queries, such as listing and deleting registered teams.

Server-side data functions call `await connection()` from `next/server` so they render dynamically.

**Auth.** `src/lib/auth.ts` is the server config and `src/lib/auth-client.ts` is the client. Better Auth is mounted at `src/app/api/auth/[...all]`. There is no middleware or proxy. `src/app/dashboard/layout.tsx` checks the session and redirects to `/login`, and every `/api/dashboard/*` route must call `auth.api.getSession({ headers: request.headers })` itself and return 401 when there is no session.

**Registration wizard.** The wizard is `src/app/register/registration-wizard.tsx`, with its step config and UI in `_components/`. The steps change with team size: Team Details → Leader → Member 1 (when size ≥ 2) → Member 2 (when size is 3) → Review. You can only move forward after the current step validates. See `LAYOUT.md` for the shell, container, sticky, and grid rules (`src/components/layout/`).

**Dashboard.** `/dashboard` uses the shadcn sidebar. `ModalProvider` and `<Toaster>` are mounted in the dashboard layout, so `useModal()` only works under `/dashboard`. The dashboard has pages for teams (with CSV export via papaparse), users (Better Auth admin), and registration settings.

**Landing page.** `src/app/page.tsx` is built from `src/components/landing/*` and the top-level components in `src/components/` (Timeline, TeamSlider, ImageGallery, etc.). Some of these use CSS modules. Placeholder content lives in `src/data/`. The root layout loads several Google fonts as CSS variables (`--font-orbitron`, `--font-space`, `--font-bebas`, `--font-montserrat`, `--font-mono`) and wraps the app in `ClientAppLoader` and `CustomCursor`.

## Project conventions

- Before building forms or modals, read `docs/forms.md` (the `Form`, `Form.Item`, `Form.CustomController`, and `FormListInput` wrappers in `src/components/form`, and the inputs in `src/components/form-inputs`) and `docs/modals.md` (the registry in `src/components/modals/modal-registry.tsx` and `useModal()`). New modals must be registered in the registry.
- Use `cn()` from `@/lib/utils` for class merging.
- `.github/workflows/keep-db-alive.yml` pings the database every hour so a free-tier Postgres instance does not go idle.
