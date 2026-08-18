"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { templates } from "@/lib/templates/registry";

export function ResumeCreator() {
  const router = useRouter();
  const [title, setTitle] = useState("My resume");
  const [templateId, setTemplateId] = useState("ats");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function createResume() {
    setIsCreating(true);
    setErrorMessage("");
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, templateId }),
    });
    const data = (await response.json()) as { resume?: { id: string }; error?: string };

    if (!response.ok || !data.resume) {
      setIsCreating(false);
      setErrorMessage(data.error ?? "Your resume could not be created.");
      return;
    }

    router.push(`/resumes/${data.resume.id}`);
  }

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">rb</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">resume / builder</span>
        </Link>
        <Link className="auth-back" href="/dashboard">← Dashboard</Link>
      </header>
      <section className="creator-layout">
        <div>
          <p className="eyebrow"><span className="text-[var(--signal)]">new resume</span> Choose the first impression</p>
          <h1 className="display-text mt-7 max-w-xl text-5xl leading-[0.95] tracking-[-0.065em] sm:text-7xl">Same experience. A sharper fit.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--ink-muted)]">Your profile will be copied into this resume. You can tailor it without changing the original.</p>
        </div>
        <section className="creator-card">
          <label className="profile-field profile-field-wide">
            <span>Resume name</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product designer — 2026" />
          </label>
          <div className="creator-options">
            {templates.map((template) => (
              <button className={`creator-option ${template.id === templateId ? "selected" : ""}`} type="button" key={template.id} onClick={() => setTemplateId(template.id)}>
                <span className={`creator-mini creator-mini-${template.id}`} aria-hidden="true"><span /></span>
                <span className="text-left"><strong>{template.name}</strong><small>{template.description}</small></span>
                <span className="creator-radio" aria-hidden="true" />
              </button>
            ))}
          </div>
          {errorMessage ? <p className="auth-message auth-error mt-5" role="alert">{errorMessage}</p> : null}
          <button className="button-primary creator-submit" type="button" onClick={createResume} disabled={isCreating}>{isCreating ? "Creating..." : "Create resume"} <span aria-hidden="true">↗</span></button>
        </section>
      </section>
    </main>
  );
}
