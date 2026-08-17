# Resume Builder — Project Plan

**Target users:** People who struggle to create/format a resume and want to try several professional layouts without starting over each time.

**Build approach:** Fully vibe-coded in **OpenCode** (Plan mode → Build mode), $0 budget, deployed to Vercel. Sequencing, folder structure, and environment setup are left to OpenCode to figure out during planning — this document defines *what* the product needs to do, not the order to build it in.

**Repo:** [github.com/NeserxDD/resume-builder](https://github.com/NeserxDD/resume-builder)

---

## Agreed MVP decisions

The first release will focus on a small, complete core product rather than
shipping every planned feature at once.

- **MVP scope:** authentication, reusable profile, resume dashboard CRUD, live
  preview, three templates, and selectable-text PDF export.
- **MVP templates:** ATS-Friendly, Modern Professional, and Minimalist.
- **MVP authentication:** email/password and Google OAuth. GitHub OAuth is
  deferred.
- **Resume data model:** copy-on-create. A new resume snapshots the profile;
  later edits belong to that resume and do not change the shared profile.
- **Photo support:** deferred from the MVP. No photo upload or Storage setup is
  needed initially.
- **PDF strategy:** use a shared data/rendering model with a screen component
  and matching `@react-pdf/renderer` component for each template.
- **Deferred features:** share links, AI assistance, photo upload, Harvard,
  Stanford, and Two-Column templates, cover letters, resume scoring, and
  internationalization.
- **App design:** minimalist modern product UI with deliberate typography,
  calm neutrals, and enough visual character to avoid a generic plain SaaS
  interface. Resume pages themselves remain professional and print-focused.
- **Language:** English UI; users may enter resume content in any language.

The remaining sections describe the long-term product direction. The MVP is
the first implementation milestone and can expand toward the full plan after
the core workflow is stable.

---

## 0. Before writing any code — do this first, in this order

Skills change how the agent behaves for the *entire* project, so they need to be installed before a single line of app code exists — installing them later means going back and redoing early work to match conventions the agent wasn't yet following.

1. **Clone the repo and open it in OpenCode**
   ```bash
   git clone https://github.com/NeserxDD/resume-builder.git
   cd resume-builder
   opencode
   ```

2. **Install the three skills/plugins, then restart OpenCode:**

   **a) Superpowers** (workflow discipline — brainstorm → plan → TDD → review loop instead of one-shot generation). Add to `opencode.json` in the project root:
   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
   }
   ```
   Restart OpenCode, then verify with: `Tell me about your superpowers`

   **b) Frontend Design** (Anthropic's skill — pushes the agent toward a deliberate, distinctive UI instead of generic "AI slop" layouts. Directly relevant since this app is UI-heavy: template pickers, live previews, a multi-step form):
   ```bash
   npx skills add anthropics/skills --skill frontend-design --agent opencode
   ```

   **c) React Best Practices** (Vercel Engineering's performance/pattern rules for React + Next.js — waterfalls, bundle size, re-renders, server/client boundary. Matches the Next.js 15 stack exactly):
   ```bash
   npx skills add vercel-labs/agent-skills --skill react-best-practices --agent opencode
   ```

   Confirm all three loaded: ask OpenCode `use skill tool to list skills` — you should see `frontend-design`, `react-best-practices`, and the superpowers skill set (brainstorming, writing-plans, test-driven-development, etc.) alongside the project's own `add-resume-template` skill.

3. **Only after that** — run `/init` in OpenCode to let it review the repo, then start planning the build (roadmap, folder structure, env setup) itself from this spec.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | First-party Vercel support, huge amount of training data so the coding agent writes it well, one framework for frontend + API routes |
| Styling / UI kit | **Tailwind CSS + shadcn/ui** | Fast to build, accessible by default, easy for an agent to keep consistent — good match for "user-friendly UI" |
| Auth + Database + File storage | **Supabase** | One free backend instead of three separate services: Postgres DB, Auth (email + Google/GitHub OAuth), and Storage (for shared resume files) all in one dashboard/SDK |
| ORM | **Prisma** | Most-documented ORM, agent writes reliable schema/migrations. Use Supabase's *pooled* connection string (pgbouncer) to avoid serverless connection issues |
| Forms/validation | **React Hook Form + Zod** | Handles the long "enter your resume info" forms cleanly, validates before saving |
| PDF export | **@react-pdf/renderer** | Generates **real text PDFs** (selectable, ATS-parseable) with zero headless-browser overhead — fits comfortably inside Vercel's free-tier function limits. (Puppeteer/Chromium is the "prettier" alternative but is heavier and riskier on a free serverless plan — worth revisiting once you're on a paid plan) |
| AI chat assistant | **Google Gemini API (Flash / Flash-Lite)** via **Vercel AI SDK** | Real free tier (roughly 1,000–1,500 requests/day as of mid-2026, though Google has trimmed these before — treat as a bonus, not a guarantee). Vercel AI SDK makes streaming chat UI easy and lets you swap providers later with minimal rework |
| Deployment | **Vercel — Hobby (free) plan** | ⚠️ Hobby is licensed for **personal/non-commercial use only**. Fine for building and testing. If you ever charge users or run ads, you'll need Pro ($20/mo) |

**Free-tier watch-outs to know going in:**
- Supabase free projects **auto-pause after 7 days with no activity** — a small `curl` cron ping (e.g. GitHub Actions, once every few days) keeps it awake if you go quiet for a while.
- Vercel Hobby: ~100GB bandwidth/month, ~1M function invocations, 1GB Blob storage, non-commercial only.
- Gemini free tier is generous but rate-limited and has shifted before — build the AI chat with a graceful "try again in a bit" fallback for 429 errors.

---

## 2. Features

### 2.1 Multiple resume layouts

The core of the product: one set of resume content, rendered into any of several distinct, genuinely different professional layouts — not just re-skinned CSS.

| Layout | What it's for | Sections | Photo | ATS-safe |
|---|---|---|---|---|
| **ATS-Friendly** | Applying through online portals / applicant tracking systems | Personal info, summary, experience, education, skills (projects/certs optional) | No | Yes — single column, no tables, no icons, standard headers |
| **Harvard / Traditional** | Conservative industries (law, finance, academia-adjacent) | Same core sections, often no summary — bullets speak for themselves | No | Mostly |
| **Stanford / Academic** | Academic, research, or PhD-adjacent applications | Adds publications, research, honors/awards; core sections too | Often yes | No — richer formatting |
| **Modern Professional** | General private-sector roles | Core sections, contemporary typography/spacing | Optional | Usually |
| **Two-Column** | Roles wanting a scannable, visually organized resume | Sidebar (contact/skills/photo) + main column (experience/education) | Yes, in sidebar | No — multi-column layouts confuse ATS parsers |
| **Minimalist** | Anyone wanting maximum focus on content, minimum decoration | Only the essentials, even if the user filled in more | No | Yes |
| *(+ room to add more later)* | | | | |

**Key product rule:** these layouts are not interchangeable skins. Each one has an opinion about which sections it shows and whether it supports a photo — see § 3 for how that's modeled. A user with no projects shouldn't see an empty "Projects" heading on *any* layout, and a photo should only ever appear on layouts designed to show one.

### 2.2 Reusable profile ("fill in once, use everywhere")

- The user fills in their information **one time** — personal info, summary, work experience, education, skills, projects, certifications, and an optional photo.
- Every resume the user creates pulls from that same profile, rendered through whichever layout they pick.
- Switching layouts on an existing resume should feel instant — same data, new look, no re-entry.
- A resume can optionally diverge from the base profile later (e.g. a trimmed-down summary for one specific application) without touching the shared profile — but the profile stays the single source of truth by default.

### 2.3 Account system

- Sign up / log in (email + password, plus Google/GitHub OAuth via Supabase Auth).
- A dashboard listing all of the user's saved resumes, each showing its layout and last-edited date.
- From the dashboard: create a new resume (pick a layout), rename, duplicate (useful for tailoring one resume per job application), and delete.

### 2.4 Downloadable PDF export

- One-click export to a real PDF — not a screenshot or rasterized image.
- Text stays selectable and machine-readable, which matters most for the ATS-Friendly layout (an ATS parser can't read text baked into an image).
- Export should visually match the on-screen preview exactly (WYSIWYG).

### 2.5 Shareable resumes

- Each resume can generate a public, read-only share link (e.g. to send to a recruiter without emailing a PDF attachment).
- The shared view offers its own "download PDF" button so a recipient without an account can still get a file.
- Share links can be revoked/regenerated by the owner.

### 2.6 AI chat support (advanced feature)

An AI assistant that helps with the actual writing, not just the formatting:
- Rewrite or strengthen a specific bullet point (stronger action verbs, quantify impact).
- Tailor a resume's summary/skills toward a pasted job description.
- Suggest missing keywords likely to matter to an ATS scan, based on a job description.
- Nice-to-have extensions: an overall resume "score"/checklist (length, action verbs, quantified results), and a cover-letter generator that reuses the profile data.

This is explicitly the **last** feature to build if time/complexity runs short — the product is already complete and usable without it.

### 2.7 User-friendly UI

- A guided, multi-step flow for entering resume information (not one giant intimidating form).
- Live preview that updates as the user types and switches instantly between layouts.
- Clear, unintimidating language throughout — the target user is someone who finds resume-building stressful, so the tone and flow should reduce friction, not add to it.
- Fully responsive/usable on mobile.

---

## 3. How the multi-layout system actually works

Because layouts aren't interchangeable skins (§ 2.1), each layout needs to declare its own capabilities, and the rendering logic needs to read from that declaration rather than assuming every layout shows every field.

```ts
type SectionKey = 'summary' | 'experience' | 'education' | 'skills'
  | 'projects' | 'certifications' | 'publications' | 'awards';

interface TemplateMeta {
  id: string;
  name: string;
  thumbnail: string;
  supportsPhoto: boolean;
  sections: SectionKey[];   // which sections this layout is designed to render, in order
  atsSafe: boolean;         // true only for genuinely ATS-parseable layouts (no images, no tables, single column)
}
```

Each layout renders (both on-screen and in the exported PDF) by looping over its own `sections` list and skipping any section that's empty in the user's data — this one pattern handles "no projects," "no summary," and "this layout doesn't support publications" all at once, instead of needing special-case logic per layout. Photo rendering is gated on `supportsPhoto`, not on whether the user happens to have uploaded one.

The profile itself needs one field beyond the obvious ones: an optional `photoUrl`, skippable during setup, shown only by layouts that support it.
