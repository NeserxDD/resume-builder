# Resume Builder

Resume Builder helps people create one reusable profile, then shape it into
focused professional resumes. The current MVP foundation includes the Next.js
app shell, Supabase auth boundaries, Prisma data model, profile wizard, resume
CRUD, three template metadata definitions, live screen previews, and a
selectable-text PDF route.

Read [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the product scope and agreed
architecture decisions. Read [`AGENTS.md`](./AGENTS.md) for repository-specific
OpenCode and verification guidance.

## Local Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Fill `.env.local` with Supabase URL/key values and the pooled/direct Postgres
URLs before using authenticated or database-backed routes.

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

Prisma schema-only checks require both database URL variables, but do not need
a live database connection:

```bash
npx prisma validate
npx prisma generate
```

## Current MVP Direction

- Authentication: email/password and Google OAuth through Supabase
- Data model: profile defaults are copied into each new resume
- Templates: ATS-Friendly, Modern Professional, and Minimalist
- Deferred: photo upload, share links, AI assistance, and additional templates
