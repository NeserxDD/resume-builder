export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
        <a className="flex items-center gap-3" href="#top" aria-label="Resume Builder home">
          <span className="brand-mark" aria-hidden="true">
            EGD
          </span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">
            resume / builder
          </span>
        </a>
        <nav className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)] sm:gap-8 sm:text-[11px]">
          <a className="nav-link hidden sm:inline" href="#template-preview">
            Layouts
          </a>
          <a className="nav-link hidden sm:inline" href="#process">
            The method
          </a>
          <span className="flex items-center gap-2 text-[var(--ink)]">
            <span className="status-dot" aria-hidden="true" />
            Private beta
          </span>
        </nav>
      </header>

      <section id="top" className="mx-auto grid w-full max-w-7xl gap-16 px-6 pb-24 pt-12 sm:px-10 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-14 lg:pb-32 lg:pt-24">
        <div className="flex max-w-2xl flex-col justify-center">
          <p className="eyebrow mb-7">
            <span className="text-[var(--signal)]">01</span>
            Resume Builder — your work, better arranged
          </p>
          <h1 className="display-text max-w-3xl text-5xl leading-[0.96] tracking-[-0.065em] sm:text-7xl lg:text-[6.8rem]">
            One profile.
            <br />
            <span className="text-[var(--ink-muted)]">Many strong</span>
            <br />
            first impressions.
          </h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
            Build your experience once, then see it through layouts made for
            the way people actually apply. Less formatting. More focus on the
            work.
          </p>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a className="button-primary" href="/auth/signup">
              Start your profile
              <span aria-hidden="true">↘</span>
            </a>
            <a className="button-quiet" href="#process">
              See the method
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--line)] pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            <span>Multiple layouts</span>
            <span>1 content set</span>
            <span>PDF-ready</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="paper-card w-full max-w-[32rem] rotate-[2.5deg] p-7 sm:p-10">
            <div className="mb-12 flex items-start justify-between border-b border-[var(--line)] pb-5">
              <div>
                <div className="mb-3 h-2 w-28 rounded-full bg-[var(--ink)]" />
                <div className="h-1.5 w-44 rounded-full bg-[var(--soft-line)]" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                ATS / 01
              </span>
            </div>
            <div className="grid grid-cols-[1fr_0.7fr] gap-8">
              <div className="space-y-9">
                <div>
                  <div className="resume-rule mb-4" />
                  <div className="mb-3 h-1.5 w-24 rounded-full bg-[var(--ink)]" />
                  <div className="space-y-2">
                    <div className="resume-line w-full" />
                    <div className="resume-line w-[92%]" />
                    <div className="resume-line w-[80%]" />
                  </div>
                </div>
                <div>
                  <div className="resume-rule mb-4" />
                  <div className="mb-3 h-1.5 w-28 rounded-full bg-[var(--ink)]" />
                  <div className="space-y-2">
                    <div className="resume-line w-full" />
                    <div className="resume-line w-[87%]" />
                    <div className="resume-line w-[95%]" />
                    <div className="resume-line w-[63%]" />
                  </div>
                </div>
              </div>
              <div className="space-y-9 border-l border-[var(--line)] pl-5">
                <div>
                  <div className="mb-4 h-1.5 w-16 rounded-full bg-[var(--ink)]" />
                  <div className="space-y-2">
                    <div className="resume-line w-full" />
                    <div className="resume-line w-[76%]" />
                    <div className="resume-line w-[90%]" />
                  </div>
                </div>
                <div>
                  <div className="mb-4 h-1.5 w-20 rounded-full bg-[var(--ink)]" />
                  <div className="flex flex-wrap gap-2">
                    <span className="skill-pill" />
                    <span className="skill-pill w-10" />
                    <span className="skill-pill w-8" />
                    <span className="skill-pill w-12" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
              <span>clear / considered</span>
              <span className="text-[var(--signal)]">fit check 94%</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -left-2 hidden w-40 border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_16px_40px_rgba(25,25,22,0.06)] sm:block lg:-left-8">
            <p className="font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--ink-muted)]">
              Same story.
              <br />
              New emphasis.
            </p>
            <div className="mt-4 h-px w-8 bg-[var(--signal)]" />
          </div>
        </div>
      </section>

      <section id="template-preview" className="border-y border-[var(--line)] bg-[var(--paper-deep)]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-4">
                <span className="text-[var(--signal)]">02</span>
                Choose your emphasis
              </p>
              <h2 className="display-text max-w-xl text-4xl leading-none tracking-[-0.05em] sm:text-6xl">
                Different rooms for the same story.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[var(--ink-muted)]">
              Every layout has an opinion about what deserves the first look.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="template-card">
              <div className="template-preview template-preview-ats">
                <div className="preview-heading" />
                <div className="preview-wide-line" />
                <div className="preview-section-title" />
                <div className="preview-copy" />
                <div className="preview-copy short" />
                <div className="preview-section-title second" />
                <div className="preview-copy" />
                <div className="preview-copy medium" />
              </div>
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">ATS-Friendly</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">Straightforward by design.</p>
                </div>
                <span className="template-number">A / 01</span>
              </div>
            </article>
            <article className="template-card">
              <div className="template-preview template-preview-modern">
                <div className="modern-bar" />
                <div className="preview-heading" />
                <div className="modern-intro" />
                <div className="preview-section-title" />
                <div className="preview-copy" />
                <div className="preview-copy medium" />
                <div className="preview-section-title second" />
                <div className="preview-copy" />
              </div>
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">Modern Professional</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">A little more point of view.</p>
                </div>
                <span className="template-number">B / 02</span>
              </div>
            </article>
            <article className="template-card">
              <div className="template-preview template-preview-minimal">
                <div className="minimal-heading" />
                <div className="minimal-contact" />
                <div className="preview-section-title" />
                <div className="preview-copy" />
                <div className="preview-copy short" />
                <div className="preview-section-title second" />
                <div className="preview-copy" />
                <div className="preview-copy medium" />
              </div>
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">Minimalist</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">For when the work speaks first.</p>
                </div>
                <span className="template-number">C / 03</span>
              </div>
            </article>
          </div>
            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
              Also: Classic Tech · Awesome CV · Two-Column (with photo)
            </p>
        </div>
      </section>

      <section id="process" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-14 lg:py-28">
        <div>
          <p className="eyebrow mb-4">
            <span className="text-[var(--signal)]">03</span>
            The method
          </p>
          <h2 className="display-text max-w-sm text-4xl leading-none tracking-[-0.05em] sm:text-5xl">
            Less starting over. More moving forward.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="process-step">
            <span className="process-mark">01</span>
            <h3 className="mt-8 font-medium">Build once</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Keep your experience in one reusable profile.
            </p>
          </div>
          <div className="process-step">
            <span className="process-mark">02</span>
            <h3 className="mt-8 font-medium">Tune the signal</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Choose the layout that fits the role and the room.
            </p>
          </div>
          <div className="process-step">
            <span className="process-mark">03</span>
            <h3 className="mt-8 font-medium">Take it with you</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Export a clean, selectable PDF when it is ready.
            </p>
          </div>
        </div>
      </section>


    </main>
  );
}
