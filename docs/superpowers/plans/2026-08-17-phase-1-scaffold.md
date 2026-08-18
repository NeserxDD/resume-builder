# Phase 1 Scaffold Implementation Plan

> **For agentic workers:** Use this plan task-by-task with the repository's configured Superpowers workflow.

**Goal:** Establish a verified Next.js 15 App Router foundation for the resume builder without implementing product features yet.

**Architecture:** Use a TypeScript Next.js App Router application in `src/`, with Tailwind CSS and ESLint configured at the root. Keep the initial route as a small branded shell so later auth, dashboard, and editor work has a stable entrypoint without prematurely coupling product state or backend services.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, ESLint, npm, shadcn/ui-compatible configuration.

**Spec:** `PROJECT_PLAN.md`

## Global Constraints

- Do not add authentication, database, PDF, AI, photo, share-link, or resume-template behavior in this scaffold task.
- Preserve `PROJECT_PLAN.md`, `AGENTS.md`, `opencode.json`, `.agents/skills/`, and `skills-lock.json`.
- Use English UI copy and the approved minimalist-modern visual direction.
- Do not claim a verification command until it is defined in `package.json` and has been run successfully.

---

### Task 1: Bootstrap Next.js

**Files:**
- Create: root Next.js application files through `create-next-app`.
- Preserve: `PROJECT_PLAN.md`, `AGENTS.md`, `LICENSE`, `opencode.json`, `.agents/`, and `skills-lock.json`.

- [x] Run the approved scaffold command from a temporary directory, then merge the generated app/toolchain files into the repository because the root already contains project instructions:

```bash
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes --disable-git
```

- [x] Confirm the generated root manifest contains scripts for `dev`, `build`, `start`, and `lint`, and that the app entrypoint is under `src/app/`.

- [x] Run the generated lint command:

```bash
npm run lint
```

Expected: the scaffold passes without lint errors.

### Task 2: Establish the Initial App Shell

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [x] Replace the starter copy with a calm, minimalist-modern landing shell for Resume Builder: a short product label, a clear headline about building one resume and trying multiple layouts, one primary action, and a quiet supporting line.

- [x] Use a restrained editorial palette, intentional typography, responsive spacing, visible focus states, and a reduced-motion-safe treatment. Do not add a component library or product interactions yet.

- [x] Keep the page server-rendered; do not add `"use client"` unless an interaction genuinely requires it.

- [x] Run:

```bash
npm run lint
npm run build
```

Expected: both commands pass with the shell rendered from `src/app/page.tsx`.

### Task 3: Add shadcn/ui Baseline Configuration

**Files:**
- Create or modify: `components.json`
- Modify: `package.json` and lockfile only through the shadcn CLI.

- [x] Initialize shadcn/ui with the existing Tailwind and TypeScript setup, then reconcile its default token names so the approved visual tokens remain authoritative.

- [x] Do not retain UI components that are not needed by the current shell; the generated unused Button component was removed while the shadcn baseline and utilities were preserved.

- [x] Run:

```bash
npm run lint
npm run build
```

Expected: the app remains buildable after the baseline configuration.

### Task 4: Document the Established Toolchain

**Files:**
- Modify: `AGENTS.md`

- [x] Add only verified commands and non-obvious scaffold facts discovered during Tasks 1-3, including the exact package-manager commands and any shadcn or Tailwind caveats.

- [x] Do not add speculative commands or duplicate the full product plan.

- [x] Verify the final worktree and run the complete available validation sequence:

```bash
npm run lint
npm run build
git status --short --branch
```

Expected: lint and build pass, and only intentional changes remain.
