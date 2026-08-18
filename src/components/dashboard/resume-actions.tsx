"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ResumeActions({
  id,
  title,
  templateId,
}: {
  id: string;
  title: string;
  templateId: string;
}) {
  const router = useRouter();

  async function rename() {
    const nextTitle = window.prompt("Rename this resume", title)?.trim();
    if (!nextTitle || nextTitle === title) return;

    await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle, templateId }),
    });
    router.refresh();
  }

  async function duplicate() {
    await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId: id,
        title: `Copy of ${title}`,
        templateId,
      }),
    });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="resume-actions">
      <Link className="resume-open" href={`/resumes/${id}`}>Open <span aria-hidden="true">↗</span></Link>
      <button type="button" onClick={rename}>Rename</button>
      <button type="button" onClick={duplicate}>Duplicate</button>
      <button type="button" onClick={remove}>Delete</button>
    </div>
  );
}
