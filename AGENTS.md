# Repository Instructions

## Project State

- `PROJECT_PLAN.md` is the product specification and records the agreed MVP scope and architecture decisions; read it before planning or implementing.
- The repository contains a Next.js 15 App Router application under `src/`; auth, profile, resume CRUD, screen preview, and PDF route foundations exist, while live Supabase credentials, migrations, and the test runner are still setup work.

## OpenCode Setup

- `opencode.json` enables the Superpowers plugin; `.agents/skills/` and `skills-lock.json` contain the committed project skills. Preserve them when changing tooling.
- OpenCode loads configuration and skills at startup. After changing `opencode.json`, project skills, or other OpenCode configuration, restart OpenCode before verifying the change.
- The skills/configuration and `/init` setup sequence was completed before scaffolding. Future sessions should read `PROJECT_PLAN.md` and preserve the committed OpenCode setup before changing tooling.

## Product Constraints

- MVP scope is authentication, reusable profile, dashboard resume CRUD, live preview, ATS-Friendly/Modern Professional/Minimalist templates, and selectable-text PDF export.
- MVP authentication is email/password plus Google OAuth; resume creation uses copy-on-create data snapshots; photo upload, share links, AI, and additional templates are deferred.
- Template metadata must control supported sections/photo/ATS behavior, and empty sections must not render headings. Screen previews and PDFs should share the same data/rendering model.

## Verification

- The app uses npm; install dependencies with `npm install` and use the root scripts `npm run dev`, `npm run lint`, `npm run build`, and `npm run start`.
- `npm run build` uses Next.js Turbopack and performs lint/type validation as part of the production build.
- There is no test runner yet. Do not invent test commands until one is added to the root manifest.
- shadcn/ui is initialized through `components.json`; do not rerun initialization casually because it can rewrite `src/app/globals.css` and the project's visual tokens.
- Prisma is intentionally pinned to major version 6 because the schema uses Supabase's pooled `DATABASE_URL` and direct `DIRECT_URL`; Prisma 7 requires a different adapter/configuration model.
- `npx prisma validate` and `npx prisma generate` require both database URL variables to be present, but do not require a live database connection; use real local env values or process-scoped placeholders for schema-only checks.
- Prisma CLI does not automatically load `.env.local`; load `DATABASE_URL` and `DIRECT_URL` into the process or provide a CLI-readable env file before Prisma commands.
- This Supabase project’s direct database hostname resolves IPv6-only in the current environment; use the session pooler on port `5432` for `DIRECT_URL` when IPv6 is unavailable, and the transaction pooler on port `6543` for `DATABASE_URL`.
- Supabase browser/server boundaries live in `src/lib/supabase/`; middleware currently protects `/dashboard`, `/profile`, and `/resumes` by checking the authenticated user.
