export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          <span className="brand-mark" aria-hidden="true">
            rb
          </span>
          <span>© 2026 Ernes Glenn Dalope</span>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]"
          aria-label="Creator links"
        >
          <a
            className="nav-link hover:text-[var(--ink)]"
            href="https://ernesdalope.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio ↗
          </a>
          <a
            className="nav-link hover:text-[var(--ink)]"
            href="https://github.com/NeserxDD/resume-builder"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a className="nav-link hover:text-[var(--ink)]" href="mailto:ernesdalope02@gmail.com">
            Email
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-6 sm:px-10 lg:px-14">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)] opacity-70">
          Next.js · Supabase · Prisma · @react-pdf
        </p>
      </div>
    </footer>
  );
}
