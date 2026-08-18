"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ResumePreview } from "@/components/templates/resume-preview";
import { templates } from "@/lib/templates/registry";
import { resumeContentSchema } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";

const emptyContent: ResumeContentInput = {
  personalInfo: { fullName: "", headline: "", email: "", phone: "", location: "", website: "", linkedin: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

function EditorField({
  label,
  name,
  register,
  type = "text",
  placeholder,
  textarea = false,
  rows = 3,
}: {
  label: string;
  name: FieldPath<ResumeContentInput>;
  register: ReturnType<typeof useForm<ResumeContentInput>>["register"];
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      {textarea ? <textarea rows={rows} placeholder={placeholder} {...register(name)} /> : <input type={type} placeholder={placeholder} {...register(name)} />}
    </label>
  );
}

export function ResumeEditor({ id }: { id: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("ats");
  const [skillsText, setSkillsText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { control, register, reset, watch, getValues, handleSubmit } = useForm<ResumeContentInput>({
    defaultValues: emptyContent,
    resolver: zodResolver(resumeContentSchema),
    mode: "onBlur",
  });
  const experience = useFieldArray({ control, name: "experience", keyName: "fieldKey" });
  const education = useFieldArray({ control, name: "education", keyName: "fieldKey" });
  const projects = useFieldArray({ control, name: "projects", keyName: "fieldKey" });
  const certifications = useFieldArray({ control, name: "certifications", keyName: "fieldKey" });
  const content = watch();

  useEffect(() => {
    let isCurrent = true;

    async function loadResume() {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) {
        if (isCurrent) {
          setErrorMessage("We could not load this resume.");
          setIsLoading(false);
        }
        return;
      }

      const data = (await response.json()) as { resume: { title: string; templateId: string; content: ResumeContentInput } };
      if (!isCurrent) return;
      setTitle(data.resume.title);
      setTemplateId(data.resume.templateId);
      reset(data.resume.content);
      setSkillsText(data.resume.content.skills.join(", "));
      setIsLoading(false);
    }

    void loadResume();
    return () => {
      isCurrent = false;
    };
  }, [id, reset]);

  async function saveResume(values: ResumeContentInput) {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");
    const result = resumeContentSchema.safeParse({
      ...values,
      skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
    });

    if (!result.success) {
      setIsSaving(false);
      setErrorMessage("Some resume content is not valid yet.");
      return;
    }

    const response = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, templateId, content: result.data }),
    });

    setIsSaving(false);
    if (!response.ok) {
      setErrorMessage("Your changes could not be saved.");
      return;
    }
    setMessage("Saved just now.");
    router.refresh();
  }

  if (isLoading) return <main className="profile-loading">Loading your resume...</main>;

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <Link className="auth-back" href="/dashboard">← Dashboard</Link>
        <div className="editor-title-wrap"><span className="status-dot" aria-hidden="true" /><span className="font-mono text-[10px] uppercase tracking-[0.13em]">{message || "Editing"}</span></div>
        <div className="editor-header-actions"><a className="button-quiet editor-pdf-link" href={`/api/resumes/${id}/pdf`}>Download PDF <span aria-hidden="true">↓</span></a><button className="button-primary editor-save-top" type="button" onClick={handleSubmit(saveResume)} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button></div>
      </header>
      <div className="editor-layout">
        <section className="editor-form-panel">
          <div className="editor-form-head"><p className="eyebrow"><span className="text-[var(--signal)]">editor</span> Your content</p><input className="editor-title-input" value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Resume title" /></div>
          <div className="editor-section-block">
            <p className="editor-label">Layout</p>
            <div className="editor-template-picker">
              {templates.map((template) => <button className={`editor-template-choice ${template.id === templateId ? "selected" : ""}`} type="button" key={template.id} onClick={() => setTemplateId(template.id)}><span className={`creator-mini creator-mini-${template.id}`} aria-hidden="true"><span /></span><span>{template.name}</span></button>)}
            </div>
          </div>
          <form className="editor-form" onSubmit={handleSubmit(saveResume)}>
            <div className="editor-section-block"><p className="editor-label">Header</p><div className="profile-fields"><label className="profile-field"><span>Name</span><input {...register("personalInfo.fullName")} /></label><label className="profile-field"><span>Headline</span><input {...register("personalInfo.headline")} /></label><label className="profile-field"><span>Email</span><input type="email" {...register("personalInfo.email")} /></label><label className="profile-field"><span>Location</span><input {...register("personalInfo.location")} /></label></div></div>
            <div className="editor-section-block"><p className="editor-label">Summary</p><label className="profile-field"><span>What you do best</span><textarea rows={6} {...register("summary")} /></label></div>
            <div className="editor-section-block"><div className="flex items-center justify-between"><p className="editor-label">Experience</p><button className="outline-action" type="button" onClick={() => experience.append({ id: `experience-${experience.fields.length + 1}`, company: "", role: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] })}>+ Add role</button></div>{experience.fields.length ? <div className="editor-entry-list">{experience.fields.map((field, index) => <div className="editor-entry" key={field.fieldKey}><div className="flex items-center justify-between"><span className="editor-entry-number">Role {index + 1}</span>{experience.fields.length > 1 ? <button type="button" onClick={() => experience.remove(index)}>Remove</button> : null}</div><div className="profile-fields"><label className="profile-field"><span>Role</span><input {...register(`experience.${index}.role`)} /></label><label className="profile-field"><span>Company</span><input {...register(`experience.${index}.company`)} /></label><label className="profile-field"><span>Dates</span><input {...register(`experience.${index}.startDate`)} placeholder="2022 — Present" /></label><label className="profile-field profile-field-wide"><span>Highlights</span><textarea rows={4} {...register(`experience.${index}.bullets.0`)} /></label></div></div>)}</div> : <p className="profile-help">Add your first role to see it appear in the preview.</p>}</div>
            <div className="editor-section-block"><p className="editor-label">Education</p>{education.fields.length ? <div className="editor-entry-list">{education.fields.map((field, index) => <div className="editor-entry" key={field.fieldKey}><div className="flex items-center justify-between"><span className="editor-entry-number">School {index + 1}</span>{education.fields.length > 1 ? <button type="button" onClick={() => education.remove(index)}>Remove</button> : null}</div><div className="profile-fields"><EditorField label="School" name={`education.${index}.school`} register={register} /><EditorField label="Degree" name={`education.${index}.degree`} register={register} /><EditorField label="Field of study (optional)" name={`education.${index}.field`} register={register} /><EditorField label="CGPA (optional)" name={`education.${index}.cgpa`} register={register} /><EditorField label="Location" name={`education.${index}.location`} register={register} /><EditorField label="Start" name={`education.${index}.startDate`} register={register} /><EditorField label="End" name={`education.${index}.endDate`} register={register} /></div></div>)}</div> : <p className="profile-help">Add a school to show education on the resume.</p>}<div className="mt-3"><button className="outline-action" type="button" onClick={() => education.append({ id: `education-${education.fields.length + 1}`, school: "", degree: "", field: "", cgpa: "", location: "", startDate: "", endDate: "" })}>+ Add school</button></div></div>
            <div className="editor-section-block"><p className="editor-label">Projects</p>{projects.fields.length ? <div className="editor-entry-list">{projects.fields.map((field, index) => <div className="editor-entry" key={field.fieldKey}><div className="flex items-center justify-between"><span className="editor-entry-number">Project {index + 1}</span><button type="button" onClick={() => projects.remove(index)}>Remove</button></div><div className="profile-fields"><EditorField label="Name" name={`projects.${index}.name`} register={register} /><EditorField label="GitHub link" name={`projects.${index}.url`} register={register} placeholder="github.com/your-name/project" /><EditorField label="Live link" name={`projects.${index}.liveUrl`} register={register} placeholder="https://project.dev" /><EditorField label="Description" name={`projects.${index}.description`} register={register} textarea /><label className="profile-field"><span>Technologies, comma separated</span><input defaultValue={field.technologies.join(", ")} placeholder="Figma, React, Notion" onChange={(event) => { const technologies = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); const current = getValues(`projects.${index}`); projects.update(index, { ...current, technologies }); }} /></label></div></div>)}</div> : <p className="profile-help">Add a project to show it on the resume.</p>}<div className="mt-3"><button className="outline-action" type="button" onClick={() => projects.append({ id: `project-${projects.fields.length + 1}`, name: "", description: "", url: "", liveUrl: "", technologies: [] })}>+ Add project</button></div></div>
            <div className="editor-section-block"><p className="editor-label">Certifications</p>{certifications.fields.length ? <div className="editor-entry-list">{certifications.fields.map((field, index) => <div className="editor-entry" key={field.fieldKey}><div className="flex items-center justify-between"><span className="editor-entry-number">Certification {index + 1}</span><button type="button" onClick={() => certifications.remove(index)}>Remove</button></div><div className="profile-fields"><EditorField label="Name" name={`certifications.${index}.name`} register={register} /><EditorField label="Issuer" name={`certifications.${index}.issuer`} register={register} /><EditorField label="Date" name={`certifications.${index}.date`} register={register} /><EditorField label="Link" name={`certifications.${index}.url`} register={register} placeholder="https://..." /></div></div>)}</div> : <p className="profile-help">Add a certification to show it on the resume.</p>}<div className="mt-3"><button className="outline-action" type="button" onClick={() => certifications.append({ id: `certification-${certifications.fields.length + 1}`, name: "", issuer: "", date: "", url: "" })}>+ Add certification</button></div></div>
            <div className="editor-section-block"><p className="editor-label">Skills</p><label className="profile-field"><span>Comma separated</span><textarea rows={4} value={skillsText} onChange={(event) => setSkillsText(event.target.value)} /></label></div>
            {errorMessage ? <p className="auth-message auth-error" role="alert">{errorMessage}</p> : null}
            <button className="button-primary editor-save-bottom" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"} <span aria-hidden="true">↗</span></button>
          </form>
        </section>
        <aside className="editor-preview-panel"><div className="editor-preview-label"><span className="eyebrow"><span className="text-[var(--signal)]">preview</span> Live document</span><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">A4 / 100%</span></div><ResumePreview content={{ ...content, skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean) }} templateId={templateId} /></aside>
      </div>
    </main>
  );
}
