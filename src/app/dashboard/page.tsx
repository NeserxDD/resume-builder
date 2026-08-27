import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ResumeActions } from "@/components/dashboard/resume-actions";
import { getTemplateMeta } from "@/lib/templates/registry";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Resume Builder",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth/login");

  const displayName =
    data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "there";
  const [profile, resumes] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: data.user.id }, select: { id: true } }),
    prisma.resume.findMany({
      where: { userId: data.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, templateId: true, updatedAt: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-6 text-[var(--ink)] sm:px-10 lg:px-14">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[var(--line)] pb-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="brand-mark" aria-hidden="true">EGD</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">resume / builder</span>
        </Link>
        <SignOutButton />
      </header>
      <section className="mx-auto max-w-7xl py-20 sm:py-28">
        <p className="eyebrow">
          <span className="text-[var(--signal)]">workspace</span>
          Dashboard
        </p>
        <div className="mt-8 flex max-w-3xl flex-col justify-between gap-10 border-b border-[var(--line)] pb-12 lg:flex-row lg:items-end">
          <div>
            <h1 className="display-text text-5xl leading-none tracking-[-0.06em] sm:text-7xl">
              Welcome, {displayName}.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[var(--ink-muted)]">
              Keep your profile reusable, then make a focused version for each application.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--ink-muted)]">
            <span className="status-dot" aria-hidden="true" />
            Account connected
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link className="block border border-[var(--line)] bg-[#fffefa] p-6 transition-transform hover:-translate-y-1 sm:p-8" href="/profile">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">{profile ? "Profile ready" : "Next up"}</p>
            <h2 className="display-text mt-6 text-3xl tracking-[-0.04em]">{profile ? "Keep your foundation current." : "Build your reusable profile."}</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">{profile ? "Edit your source information before creating another tailored resume." : "Add your experience once so every future resume starts from solid ground."}</p>
          </Link>
          <Link className="block border border-dashed border-[var(--line)] p-6 transition-colors hover:border-[var(--ink)] sm:p-8" href="/resumes/new">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">Your resumes</p>
            <p className="mt-8 text-4xl font-medium tracking-[-0.05em]">{resumes.length}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Choose the sections you want and pick a layout — your profile is just a starting point.</p>
          </Link>
        </div>
        <div className="mt-12 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="eyebrow"><span className="text-[var(--signal)]">library</span> Saved resumes</p>
          </div>
          {<Link className="button-primary" href="/resumes/new">New resume <span aria-hidden="true">↗</span></Link>}
        </div>
        {resumes.length ? (
          <div className="resume-list">
            {resumes.map((resume) => (
              <article className="resume-list-card" key={resume.id}>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">{getTemplateMeta(resume.templateId).name}</p>
                  <h2 className="display-text mt-4 text-2xl tracking-[-0.04em]">{resume.title}</h2>
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">Edited {resume.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <ResumeActions id={resume.id} title={resume.title} templateId={resume.templateId} />
              </article>
            ))}
          </div>
        ) : (
          <div className="resume-empty">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">No saved resumes</span>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">When your profile is ready, choose a layout and start your first focused version.</p>
          </div>
        )}
      </section>
    </main>
  );
}
