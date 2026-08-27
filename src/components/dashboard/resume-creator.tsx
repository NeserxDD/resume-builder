"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { entryIdsForSection, emptyResumeContent } from "@/lib/resume/schema";
import { SECTION_KEYS } from "@/lib/resume/types";
import type { ResumeContentInput, ResumeSelectionInput } from "@/lib/resume/schema";
import type { SectionKey } from "@/lib/resume/types";

const sectionLabels: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  leadership: "Leadership & Activities",
  publications: "Publications",
  research: "Research",
  teaching: "Teaching",
  awards: "Awards",
};

function entryCount(section: SectionKey, content: ResumeContentInput) {
  return entryIdsForSection(section, content).length;
}

function entryLabel(section: SectionKey, content: ResumeContentInput, id: string) {
  switch (section) {
    case "experience": {
      const entry = content.experience.find((item) => item.id === id);
      return [entry?.role, entry?.company].filter(Boolean).join(" — ") || "Experience entry";
    }
    case "education": {
      const entry = content.education.find((item) => item.id === id);
      return [entry?.degree, entry?.school].filter(Boolean).join(" — ") || "Education entry";
    }
    case "projects": {
      const entry = content.projects.find((item) => item.id === id);
      return entry?.name || "Project";
    }
    case "certifications": {
      const entry = content.certifications.find((item) => item.id === id);
      return entry?.name || "Certification";
    }
    case "leadership": {
      const entry = content.leadership.find((item) => item.id === id);
      return [entry?.role, entry?.organization].filter(Boolean).join(" — ") || "Leadership entry";
    }
    case "publications": {
      const entry = content.publications.find((item) => item.id === id);
      return entry?.title || "Publication";
    }
    case "research": {
      const entry = content.research.find((item) => item.id === id);
      return entry?.title || "Research entry";
    }
    case "teaching": {
      const entry = content.teaching.find((item) => item.id === id);
      return [entry?.course, entry?.institution].filter(Boolean).join(" — ") || "Teaching entry";
    }
    case "awards": {
      const entry = content.awards.find((item) => item.id === id);
      return entry?.title || "Award";
    }
    default:
      return "";
  }
}

export function ResumeCreator() {
  const router = useRouter();
  const [title, setTitle] = useState("My resume");
  const [profile, setProfile] = useState<ResumeContentInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<Set<SectionKey>>(new Set());
  const [excluded, setExcluded] = useState<Partial<Record<SectionKey, string[]>>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      const response = await fetch("/api/profile");
      if (!isCurrent) return;
      if (!response.ok) {
        setIsLoading(false);
        return;
      }
      const data = (await response.json()) as { profile: ResumeContentInput | null };
      if (!isCurrent) return;
      const content = data.profile ?? emptyResumeContent();
      setProfile(content);
      const withContent = SECTION_KEYS.filter((section) => entryCount(section, content) > 0 || section === "summary" || section === "skills");
      setSections(new Set(withContent));
      setIsLoading(false);
    }

    void loadProfile();
    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedSections = useMemo(
    () => SECTION_KEYS.filter((section) => sections.has(section)),
    [sections],
  );

  function toggleSection(section: SectionKey) {
    setSections((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function toggleEntry(section: SectionKey, id: string) {
    setExcluded((current) => {
      const removed = current[section] ?? [];
      const next = removed.includes(id) ? removed.filter((value) => value !== id) : [...removed, id];
      return { ...current, [section]: next };
    });
  }

  function buildSelection(): ResumeSelectionInput {
    const entries: Record<string, string[]> = {};
    for (const section of selectedSections) {
      const allIds = profile ? entryIdsForSection(section, profile) : [];
      const removed = excluded[section] ?? [];
      const chosen = allIds.filter((id) => !removed.includes(id));
      if (chosen.length) entries[section] = chosen;
    }
    return { sections: selectedSections, entries };
  }

  async function createResume() {
    setIsCreating(true);
    setErrorMessage("");
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, templateId: "ats", selection: buildSelection() }),
    });
    const data = (await response.json()) as { resume?: { id: string }; error?: string };

    if (!response.ok || !data.resume) {
      setIsCreating(false);
      setErrorMessage(data.error ?? "Your resume could not be created.");
      return;
    }

    router.push(`/resumes/${data.resume.id}`);
  }

  if (isLoading) {
    return <main className="profile-loading">Loading your profile...</main>;
  }

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">EGD</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">resume / builder</span>
        </Link>
        <Link className="auth-back" href="/dashboard">← Dashboard</Link>
      </header>
      <section className="creator-layout">
        <div>
          <p className="eyebrow"><span className="text-[var(--signal)]">new resume</span> Pick your sections</p>
          <h1 className="display-text mt-7 max-w-xl text-5xl leading-[0.95] tracking-[-0.065em] sm:text-7xl">Tailor it before you style it.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--ink-muted)]">Choose the sections and entries you want on this resume. You can pick the layout later in the editor.</p>
          {!profile ? (
            <p className="auth-message auth-notice mt-8 max-w-sm">No reusable profile yet. You can start with an empty resume and add everything in the editor, or set up your profile first.</p>
          ) : null}
        </div>
        <section className="creator-card">
          <label className="profile-field profile-field-wide">
            <span>Resume name</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product designer — 2026" />
          </label>

          <div className="creator-block">
            <p className="editor-label">Sections</p>
            <div className="creator-section-grid">
              {SECTION_KEYS.map((section) => {
                const count = profile ? entryCount(section, profile) : 0;
                const hasSimple = section === "summary" || section === "skills";
                return (
                  <label className={`creator-check ${sections.has(section) ? "selected" : ""}`} key={section}>
                    <input type="checkbox" checked={sections.has(section)} onChange={() => toggleSection(section)} />
                    <span>
                      <strong>{sectionLabels[section]}</strong>
                      <small>{count ? `${count} saved` : hasSimple ? "free text" : "empty profile"}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedSections.filter((section) => profile && entryCount(section, profile) > 0).length ? (
            <div className="creator-block">
              <p className="editor-label">Choose the entries to include</p>
              {selectedSections.filter((section) => profile && entryCount(section, profile) > 0).map((section) => (
                <div className="creator-entries" key={section}>
                  <p className="creator-entry-heading">{sectionLabels[section]}</p>
                  {entryIdsForSection(section, profile as ResumeContentInput).map((id) => {
                    const removed = excluded[section] ?? [];
                    const checked = !removed.includes(id);
                    return (
                      <label className={`creator-entry-check ${checked ? "selected" : ""}`} key={id}>
                        <input type="checkbox" checked={checked} onChange={() => toggleEntry(section, id)} />
                        <span>{entryLabel(section, profile as ResumeContentInput, id)}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : null}

          {errorMessage ? <p className="auth-message auth-error mt-5" role="alert">{errorMessage}</p> : null}
          <button className="button-primary creator-submit" type="button" onClick={createResume} disabled={isCreating}>{isCreating ? "Creating..." : "Create resume"} <span aria-hidden="true">↗</span></button>
        </section>
      </section>
    </main>
  );
}