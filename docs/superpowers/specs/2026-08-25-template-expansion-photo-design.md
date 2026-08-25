# Template Expansion + Transient Photo — Design

**Date:** 2026-08-25
**Status:** Approved (user approved reference set, then revised: add Jake's Resume + Awesome-CV + a photo-capable template; photos are never persisted)

## Goal

Grow the template registry from four to seven layouts and add photo support that lives only in the browser session: the user uploads a picture, sees it in the live preview, and it is sent only with the PDF render request. Nothing is stored in Postgres or Supabase Storage.

## Template lineup

| ID | Name | Reference | Photo |
|---|---|---|---|
| `ats` | ATS-Friendly | sb2nov resume | no |
| `modern` | Modern Professional | moderncv (casual) | no |
| `minimalist` | Minimalist | harshibar resume | no |
| `harvard` | Harvard / Traditional | Harvard FAS official bullet-point template | no |
| `classic-tech` | Classic Tech | Jake's Resume (jakegut/resume) | no |
| `awesome-cv` | Awesome CV | posquit0/Awesome-CV | yes |
| `two-column` | Two-Column | liantze/AltaCV (paracol layout) | yes |

References are layout inspiration only. All rendering stays in the existing React screen components and `@react-pdf/renderer` document components; no LaTeX is compiled or copied at runtime.

### Metadata per new template

- `classic-tech`: sections `summary, experience, education, skills, projects, certifications`; fields mirror ATS conventions (`headline: true`, `website: true`, flat skills); `supportsPhoto: false`.
- `awesome-cv`: sections `summary, experience, education, skills, projects, certifications`; fields `headline/website/linkedin: true`, grouped skills false; `supportsPhoto: true`.
- `two-column`: sections `experience, education, skills, projects`; fields `headline/website/linkedin: true`; `supportsPhoto: true`. Layout = right sidebar (contact, skills, optional circular photo) + left main column.

All templates join the existing rendering rules for free: visible sections = `meta.sections ∩ selection.sections ∩ hasContent`; highlight-style markers apply via the existing `highlightMarker` / marker-class plumbing.

## Transient photo pipeline

1. **Upload (editor only):** when the selected template has `supportsPhoto: true`, a file input accepts JPEG/PNG/WebP up to 2 MB. The `File` is held in React state; preview uses `URL.createObjectURL`. A hint states the photo is session-only.
2. **Persistence:** `personalInfo.photoUrl` is never written on save. No DB column, no Storage object. Refresh/navigation discards the photo; the user re-uploads next session.
3. **PDF export:** the editor download action POSTs to `/api/resumes/[id]/pdf` with an optional JSON body `{ photoDataUrl }` (base64 data URI). The route passes it to `@react-pdf/renderer` as a data-URI image source and discards the bytes after rendering. GET remains for direct-link downloads without a photo.
4. **Gating:** renderers draw the photo only when `meta.supportsPhoto` and a photo was provided for this request/session.

## Companion fix: skillGroups persistence

The profile wizard collects grouped skills, but `coreSections()` drops them and the `profiles` table lacks a column, so they were silently lost. Fix:

- Add `skillGroups Json` to the Prisma `Profile` model.
- Generate migration SQL via `prisma migrate diff` between schema snapshots (no live DB required to author). Applying the migration to Supabase is a separate user-run step.
- Include `skillGroups` in profile POST storage and GET reconstruction.

## Verification

- `npm run lint` and `npm run build` must pass (kill dev server before build; restart after).
- Manual QA checklist: all seven templates render preview + PDF identically enough for WYSIWYG; empty sections suppressed; long names/bullets behave; highlight styles apply; photo appears only on Awesome CV / Two-Column and never survives refresh; PDF without POST body renders photo-free.
- `README.md` updated to reflect seven templates.

## Out of scope (unchanged deferrals)

Share links, AI assistance, photo upload persistence (Supabase Storage), Stanford/Academic template, cover letters, scoring, i18n, test runner.
