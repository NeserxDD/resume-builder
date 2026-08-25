"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ResumePreview } from "@/components/templates/resume-preview";
import { HighlightsField } from "@/components/resumes/highlights-field";
import { PhotoField } from "@/components/resumes/photo-field";
import { getTemplateMeta, templates } from "@/lib/templates/registry";
import { emptyResumeContent, resumeContentSchema } from "@/lib/resume/schema";
import type { ResumeContentInput, ResumeSelectionInput } from "@/lib/resume/schema";
import { HIGHLIGHT_STYLES, HIGHLIGHT_STYLE_LABELS } from "@/lib/resume/highlights";
import { SECTION_LABELS } from "@/lib/resume/types";
import type { HighlightStyle, SectionKey } from "@/lib/resume/types";

const emptyContent = emptyResumeContent();

const emptyExperience = { id: "", company: "", role: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] };
const emptyEducation = { id: "", school: "", degree: "", field: "", cgpa: "", location: "", startDate: "", endDate: "", thesis: "", coursework: "", studyAbroad: { program: "", location: "", details: "", startDate: "", endDate: "" }, highSchool: { name: "", location: "", details: "", graduationDate: "" } };
const emptyProject = { id: "", name: "", description: "", url: "", liveUrl: "", technologies: [] };
const emptyCertification = { id: "", name: "", issuer: "", date: "", url: "" };
const emptyLeadership = { id: "", role: "", organization: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] };
const emptyPublication = { id: "", title: "", venue: "", year: "", url: "", authors: "" };
const emptyResearch = { id: "", title: "", organization: "", location: "", startDate: "", endDate: "", bullets: [""] };
const emptyTeaching = { id: "", course: "", institution: "", location: "", startDate: "", endDate: "", description: "" };
const emptyAward = { id: "", title: "", issuer: "", year: "", url: "", description: "" };
const emptySkillGroup = { id: "", name: "", skills: [] };

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

function RepeatList({
  items,
  onAdd,
  addLabel,
  emptyHint,
  children,
}: {
  items: { fieldKey: string }[];
  onAdd: () => void;
  addLabel: string;
  emptyHint: string;
  children: (index: number, fieldKey: string) => ReactNode;
}) {
  return (
    <div>
      {items.length ? <div className="editor-entry-list">{items.map((field, index) => children(index, field.fieldKey))}</div> : <p className="profile-help">{emptyHint}</p>}
      <div className="mt-3"><button className="outline-action" type="button" onClick={onAdd}>+ {addLabel}</button></div>
    </div>
  );
}

function EntryShell({ index, onRemove, removable, title, children }: { index: number; onRemove: () => void; removable: boolean; title: string; children: ReactNode }) {
  return (
    <div className="editor-entry">
      <div className="flex items-center justify-between"><span className="editor-entry-number">{title} {index + 1}</span>{removable ? <button type="button" onClick={onRemove}>Remove</button> : null}</div>
      <div className="profile-fields">{children}</div>
    </div>
  );
}

function BlockLabel({ children }: { children: ReactNode }) {
  return <p className="editor-label">{children}</p>;
}

export function ResumeEditor({ id }: { id: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("ats");
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>("template-default");
  const [skillsText, setSkillsText] = useState("");
  const [photo, setPhoto] = useState<{ file: File; url: string } | undefined>(undefined);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [sections, setSections] = useState<SectionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { control, register, reset, watch, setValue, handleSubmit } = useForm<ResumeContentInput>({
    defaultValues: emptyContent,
    resolver: zodResolver(resumeContentSchema),
    mode: "onBlur",
  });
  const experience = useFieldArray({ control, name: "experience", keyName: "fieldKey" });
  const education = useFieldArray({ control, name: "education", keyName: "fieldKey" });
  const projects = useFieldArray({ control, name: "projects", keyName: "fieldKey" });
  const certifications = useFieldArray({ control, name: "certifications", keyName: "fieldKey" });
  const leadership = useFieldArray({ control, name: "leadership", keyName: "fieldKey" });
  const publications = useFieldArray({ control, name: "publications", keyName: "fieldKey" });
  const research = useFieldArray({ control, name: "research", keyName: "fieldKey" });
  const teaching = useFieldArray({ control, name: "teaching", keyName: "fieldKey" });
  const awards = useFieldArray({ control, name: "awards", keyName: "fieldKey" });
  const skillGroups = useFieldArray({ control, name: "skillGroups", keyName: "fieldKey" });
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

      const data = (await response.json()) as { resume: { title: string; templateId: string; content: ResumeContentInput; selection?: ResumeSelectionInput } };
      if (!isCurrent) return;
      const meta = getTemplateMeta(data.resume.templateId);
      setTitle(data.resume.title);
      setTemplateId(data.resume.templateId);
      reset(data.resume.content);
      setSkillsText(data.resume.content.skills.join(", "));
      setSections(data.resume.selection?.sections?.length ? data.resume.selection.sections : meta.sections);
      setHighlightStyle(data.resume.selection?.highlightStyle ?? "template-default");
      setIsLoading(false);
    }

    void loadResume();
    return () => {
      isCurrent = false;
    };
  }, [id, reset]);

  function toggleSection(section: SectionKey) {
    setSections((current) => (current.includes(section) ? current.filter((value) => value !== section) : [...current, section]));
  }

  async function saveResume(values: ResumeContentInput): Promise<boolean> {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");
    const result = resumeContentSchema.safeParse({ ...values, skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean) });

    if (!result.success) {
      setIsSaving(false);
      setErrorMessage("Some resume content is not valid yet.");
      return false;
    }

    const selection: ResumeSelectionInput = { sections, entries: {}, highlightStyle };
    const response = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, templateId, content: result.data, selection }),
    });

    setIsSaving(false);
    if (!response.ok) {
      setErrorMessage("Your changes could not be saved.");
      return false;
    }
    setMessage("Saved just now.");
    router.refresh();
    return true;
  }

  function selectPhoto(file: File) {
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return { file, url: URL.createObjectURL(file) };
    });
  }

  function clearPhoto() {
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return undefined;
    });
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function downloadPdf() {
    setIsDownloadingPdf(true);
    setErrorMessage("");
    try {
      const saved = await saveResume(watch());
      if (!saved) throw new Error("save failed");
      let body: string | undefined;
      if (photo && getTemplateMeta(templateId).supportsPhoto) {
        const dataUrl = await fileToDataUrl(photo.file);
        body = JSON.stringify({ photoDataUrl: dataUrl });
      }
      const response = await fetch(`/api/resumes/${id}/pdf`, {
        method: "POST",
        ...(body ? { headers: { "Content-Type": "application/json" }, body } : {}),
      });
      if (!response.ok) throw new Error("pdf failed");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      setErrorMessage("The PDF could not be generated. Try again in a moment.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (isLoading) return <main className="profile-loading">Loading your resume...</main>;

  const meta = getTemplateMeta(templateId);
  const enabledSections = meta.sections.filter((section) => sections.includes(section));
  const selection: ResumeSelectionInput = { sections, entries: {}, highlightStyle };
  const previewContent = { ...content, skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean) };

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <Link className="auth-back" href="/dashboard">← Dashboard</Link>
        <div className="editor-title-wrap"><span className="status-dot" aria-hidden="true" /><span className="font-mono text-[10px] uppercase tracking-[0.13em]">{message || "Editing"}</span></div>
        <div className="editor-header-actions"><button className="button-quiet editor-pdf-link" type="button" onClick={downloadPdf} disabled={isDownloadingPdf}>{isDownloadingPdf ? "Building PDF..." : "Download PDF"} <span aria-hidden="true">↓</span></button><button className="button-primary editor-save-top" type="button" onClick={handleSubmit(saveResume)} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button></div>
      </header>
      <div className="editor-layout">
        <section className="editor-form-panel">
          <div className="editor-form-head"><p className="eyebrow"><span className="text-[var(--signal)]">editor</span> Your content</p><input className="editor-title-input" value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Resume title" /></div>
          <div className="editor-section-block">
            <BlockLabel>Layout</BlockLabel>
            <div className="editor-template-picker">
              {templates.map((option) => (
                <button className={`editor-template-choice ${option.id === templateId ? "selected" : ""}`} type="button" key={option.id} onClick={() => setTemplateId(option.id)}><span className={`creator-mini creator-mini-${option.id}`} aria-hidden="true"><span /></span><span>{option.name}</span></button>
              ))}
            </div>
            <label className="profile-field">
              <span>Highlight style</span>
              <select value={highlightStyle} onChange={(event) => setHighlightStyle(event.target.value as HighlightStyle)}>
                {HIGHLIGHT_STYLES.map((style) => <option key={style} value={style}>{HIGHLIGHT_STYLE_LABELS[style]}</option>)}
              </select>
            </label>
          </div>
          <div className="editor-section-block">
            <BlockLabel>Sections on this resume</BlockLabel>
            <div className="creator-section-grid">
              {meta.sections.map((section) => (
                <label className={`creator-check ${sections.includes(section) ? "selected" : ""}`} key={section}>
                  <input type="checkbox" checked={sections.includes(section)} onChange={() => toggleSection(section)} />
                  <span><strong>{SECTION_LABELS[section]}</strong></span>
                </label>
              ))}
            </div>
          </div>
          <form className="editor-form" onSubmit={handleSubmit(saveResume)}>
            <div className="editor-section-block"><BlockLabel>Header</BlockLabel><div className="profile-fields">{meta.supportsPhoto ? <PhotoField photoUrl={photo?.url} onSelect={selectPhoto} onClear={clearPhoto} /> : null}<label className="profile-field"><span>Name</span><input {...register("personalInfo.fullName")} /></label>{meta.fields.headline ? <label className="profile-field"><span>Headline</span><input {...register("personalInfo.headline")} /></label> : null}<label className="profile-field"><span>Email</span><input type="email" {...register("personalInfo.email")} /></label><label className="profile-field"><span>Phone</span><input {...register("personalInfo.phone")} /></label>{meta.fields.address ? <label className="profile-field"><span>Street address (optional)</span><input {...register("personalInfo.address")} placeholder="24 Garden Street" /></label> : null}<label className="profile-field"><span>Location</span><input {...register("personalInfo.location")} /></label>{meta.fields.website ? <label className="profile-field"><span>Website</span><input {...register("personalInfo.website")} placeholder="alexmorgan.com" /></label> : null}{meta.fields.linkedin ? <label className="profile-field"><span>LinkedIn</span><input {...register("personalInfo.linkedin")} placeholder="linkedin.com/in/alex" /></label> : null}</div></div>
            {enabledSections.includes("summary") ? <div className="editor-section-block"><BlockLabel>Summary</BlockLabel><label className="profile-field"><span>What you do best</span><textarea rows={6} {...register("summary")} /></label></div> : null}
            {enabledSections.includes("experience") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Experience</BlockLabel></div><RepeatList items={experience.fields} onAdd={() => experience.append({ ...emptyExperience, id: `experience-${Date.now()}` })} addLabel="Add role" emptyHint="Add your first role to see it appear in the preview.">{(index) => <EntryShell index={index} onRemove={() => experience.remove(index)} removable={experience.fields.length > 1} title="Role"><EditorField label="Role" name={`experience.${index}.role`} register={register} /><EditorField label="Company" name={`experience.${index}.company`} register={register} /><EditorField label="Location" name={`experience.${index}.location`} register={register} /><EditorField label="Start" name={`experience.${index}.startDate`} register={register} placeholder="Jan 2022" /><EditorField label="End" name={`experience.${index}.endDate`} register={register} placeholder="Present" /><label className="profile-check"><input type="checkbox" {...register(`experience.${index}.current`)} /><span>I work here now</span></label><HighlightsField label="Highlights, one per line" path={`experience.${index}.bullets`} watch={watch} setValue={setValue} /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("education") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Education</BlockLabel></div><RepeatList items={education.fields} onAdd={() => education.append({ ...emptyEducation, id: `education-${Date.now()}` })} addLabel="Add school" emptyHint="Add a school to show education on the resume.">{(index) => <EntryShell index={index} onRemove={() => education.remove(index)} removable={education.fields.length > 1} title="School"><EditorField label="School" name={`education.${index}.school`} register={register} /><EditorField label="Degree" name={`education.${index}.degree`} register={register} /><EditorField label="Field of study (optional)" name={`education.${index}.field`} register={register} /><EditorField label="CGPA (optional)" name={`education.${index}.cgpa`} register={register} /><EditorField label="Location" name={`education.${index}.location`} register={register} /><EditorField label="Start" name={`education.${index}.startDate`} register={register} /><EditorField label="End" name={`education.${index}.endDate`} register={register} />{meta.fields.thesis ? <EditorField label="Thesis (optional)" name={`education.${index}.thesis`} register={register} textarea rows={2} /> : null}{meta.fields.coursework ? <EditorField label="Relevant coursework (optional)" name={`education.${index}.coursework`} register={register} textarea rows={2} /> : null}{meta.fields.studyAbroad ? <div className="editor-sub-block"><p className="editor-sub-label">Study abroad (optional)</p><EditorField label="Program / institution" name={`education.${index}.studyAbroad.program`} register={register} placeholder="London School of Economics" /><EditorField label="City, Country" name={`education.${index}.studyAbroad.location`} register={register} placeholder="London, UK" /><EditorField label="Details / coursework" name={`education.${index}.studyAbroad.details`} register={register} textarea rows={2} /><EditorField label="Start" name={`education.${index}.studyAbroad.startDate`} register={register} /><EditorField label="End" name={`education.${index}.studyAbroad.endDate`} register={register} /></div> : null}{meta.fields.highSchool ? <div className="editor-sub-block"><p className="editor-sub-label">High school (optional)</p><EditorField label="School name" name={`education.${index}.highSchool.name`} register={register} placeholder="Westfield High" /><EditorField label="City, State" name={`education.${index}.highSchool.location`} register={register} placeholder="Westfield, NJ" /><EditorField label="Details / honors" name={`education.${index}.highSchool.details`} register={register} textarea rows={2} /><EditorField label="Graduation date" name={`education.${index}.highSchool.graduationDate`} register={register} /></div> : null}</EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("projects") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Projects</BlockLabel></div><RepeatList items={projects.fields} onAdd={() => projects.append({ ...emptyProject, id: `project-${Date.now()}` })} addLabel="Add project" emptyHint="Add a project to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => projects.remove(index)} removable title="Project"><EditorField label="Name" name={`projects.${index}.name`} register={register} /><EditorField label="GitHub link" name={`projects.${index}.url`} register={register} placeholder="github.com/your-name/project" /><EditorField label="Live link" name={`projects.${index}.liveUrl`} register={register} placeholder="https://project.dev" /><EditorField label="Description" name={`projects.${index}.description`} register={register} textarea /><label className="profile-field"><span>Technologies, comma separated</span><input value={(watch(`projects.${index}.technologies`) ?? []).join(", ")} placeholder="Figma, React, Notion" onChange={(event) => { const technologies = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); setValue(`projects.${index}.technologies`, technologies, { shouldDirty: true }); }} /></label></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("certifications") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Certifications</BlockLabel></div><RepeatList items={certifications.fields} onAdd={() => certifications.append({ ...emptyCertification, id: `certification-${Date.now()}` })} addLabel="Add certification" emptyHint="Add a certification to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => certifications.remove(index)} removable title="Certification"><EditorField label="Name" name={`certifications.${index}.name`} register={register} /><EditorField label="Issuer" name={`certifications.${index}.issuer`} register={register} /><EditorField label="Date" name={`certifications.${index}.date`} register={register} /><EditorField label="Link" name={`certifications.${index}.url`} register={register} placeholder="https://..." /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("leadership") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Leadership & Activities</BlockLabel></div><RepeatList items={leadership.fields} onAdd={() => leadership.append({ ...emptyLeadership, id: `leadership-${Date.now()}` })} addLabel="Add activity" emptyHint="Add a leadership role or activity to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => leadership.remove(index)} removable title="Activity"><EditorField label="Organization" name={`leadership.${index}.organization`} register={register} /><EditorField label="Role" name={`leadership.${index}.role`} register={register} /><EditorField label="Location" name={`leadership.${index}.location`} register={register} /><EditorField label="Start" name={`leadership.${index}.startDate`} register={register} /><EditorField label="End" name={`leadership.${index}.endDate`} register={register} /><HighlightsField label="Highlights, one per line" path={`leadership.${index}.bullets`} watch={watch} setValue={setValue} /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("publications") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Publications</BlockLabel></div><RepeatList items={publications.fields} onAdd={() => publications.append({ ...emptyPublication, id: `publication-${Date.now()}` })} addLabel="Add publication" emptyHint="Add a publication to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => publications.remove(index)} removable title="Publication"><EditorField label="Title" name={`publications.${index}.title`} register={register} /><EditorField label="Venue" name={`publications.${index}.venue`} register={register} /><EditorField label="Year" name={`publications.${index}.year`} register={register} /><EditorField label="Authors" name={`publications.${index}.authors`} register={register} /><EditorField label="Link" name={`publications.${index}.url`} register={register} placeholder="https://..." /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("research") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Research</BlockLabel></div><RepeatList items={research.fields} onAdd={() => research.append({ ...emptyResearch, id: `research-${Date.now()}` })} addLabel="Add research" emptyHint="Add research experience to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => research.remove(index)} removable title="Research"><EditorField label="Title" name={`research.${index}.title`} register={register} /><EditorField label="Organization" name={`research.${index}.organization`} register={register} /><EditorField label="Location" name={`research.${index}.location`} register={register} /><EditorField label="Start" name={`research.${index}.startDate`} register={register} /><EditorField label="End" name={`research.${index}.endDate`} register={register} /><HighlightsField label="Highlights, one per line" path={`research.${index}.bullets`} watch={watch} setValue={setValue} /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("teaching") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Teaching</BlockLabel></div><RepeatList items={teaching.fields} onAdd={() => teaching.append({ ...emptyTeaching, id: `teaching-${Date.now()}` })} addLabel="Add teaching" emptyHint="Add teaching experience to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => teaching.remove(index)} removable title="Teaching"><EditorField label="Course" name={`teaching.${index}.course`} register={register} /><EditorField label="Institution" name={`teaching.${index}.institution`} register={register} /><EditorField label="Location" name={`teaching.${index}.location`} register={register} /><EditorField label="Start" name={`teaching.${index}.startDate`} register={register} /><EditorField label="End" name={`teaching.${index}.endDate`} register={register} /><EditorField label="Description" name={`teaching.${index}.description`} register={register} textarea rows={3} /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("awards") ? <div className="editor-section-block"><div className="flex items-center justify-between"><BlockLabel>Awards</BlockLabel></div><RepeatList items={awards.fields} onAdd={() => awards.append({ ...emptyAward, id: `award-${Date.now()}` })} addLabel="Add award" emptyHint="Add an award or honor to show it on the resume.">{(index) => <EntryShell index={index} onRemove={() => awards.remove(index)} removable title="Award"><EditorField label="Title" name={`awards.${index}.title`} register={register} /><EditorField label="Issuer" name={`awards.${index}.issuer`} register={register} /><EditorField label="Year" name={`awards.${index}.year`} register={register} /><EditorField label="Link" name={`awards.${index}.url`} register={register} placeholder="https://..." /><EditorField label="Description" name={`awards.${index}.description`} register={register} textarea rows={2} /></EntryShell>}</RepeatList></div> : null}
            {enabledSections.includes("skills") ? <div className="editor-section-block"><BlockLabel>Skills</BlockLabel>{meta.fields.flatSkills ? <label className="profile-field"><span>Skills, comma separated</span><textarea rows={4} value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="Figma, research, prototyping..." /></label> : null}{meta.fields.groupedSkills ? <><BlockLabel>Grouped skills (optional)</BlockLabel><RepeatList items={skillGroups.fields} onAdd={() => skillGroups.append({ ...emptySkillGroup, id: `skillgroup-${Date.now()}` })} addLabel="Add group" emptyHint="Add skill groups like Technical, Languages, Laboratory, Interests for traditional layouts.">{(index) => <EntryShell index={index} onRemove={() => skillGroups.remove(index)} removable title="Group"><EditorField label="Group name" name={`skillGroups.${index}.name`} register={register} placeholder="Technical" /><label className="profile-field"><span>Skills, comma separated</span><input value={(watch(`skillGroups.${index}.skills`) ?? []).join(", ")} placeholder="Python, LaTeX, R" onChange={(event) => { const skills = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); setValue(`skillGroups.${index}.skills`, skills, { shouldDirty: true }); }} /></label></EntryShell>}</RepeatList></> : null}</div> : null}
            {errorMessage ? <p className="auth-message auth-error" role="alert">{errorMessage}</p> : null}
            <button className="button-primary editor-save-bottom" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"} <span aria-hidden="true">↗</span></button>
          </form>
        </section>
        <aside className="editor-preview-panel"><div className="editor-preview-label"><span className="eyebrow"><span className="text-[var(--signal)]">preview</span> Live document</span><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">A4 / 100%</span></div><ResumePreview content={previewContent} templateId={templateId} selection={selection} photoUrl={photo?.url} /></aside>
      </div>
    </main>
  );
}