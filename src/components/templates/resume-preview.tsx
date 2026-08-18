import type { ReactNode } from "react";

import { getTemplateMeta } from "@/lib/templates/registry";
import { getVisibleSections } from "@/lib/templates/sections";
import { normalizeExternalUrl } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";
import type { SectionKey, TemplateMeta } from "@/lib/resume/types";

type PreviewProps = {
  content: ResumeContentInput;
  templateId: string;
};

function ContactLine({ content, variant }: { content: ResumeContentInput; variant: string }) {
  const { personalInfo } = content;
  const values = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website]
    .filter(Boolean)
    .join("  /  ");

  return values ? <p className={`resume-contact resume-contact-${variant}`}>{values}</p> : null;
}

function SectionHeading({ children, variant }: { children: ReactNode; variant: string }) {
  return <h2 className={`resume-section-heading resume-section-heading-${variant}`}>{children}</h2>;
}

function ExperienceSection({ content, variant }: { content: ResumeContentInput; variant: string }) {
  return (
    <div className="resume-section-content">
      {content.experience.filter((entry) => entry.company || entry.role || entry.bullets.some(Boolean)).map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading">
            <div><h3>{entry.role || "Role"}</h3><p>{entry.company}{entry.location ? `, ${entry.location}` : ""}</p></div>
            <span>{entry.startDate}{entry.endDate ? ` — ${entry.current ? "Present" : entry.endDate}` : ""}</span>
          </div>
          {entry.bullets.filter(Boolean).length ? <ul className={`resume-bullets resume-bullets-${variant}`}>{entry.bullets.filter(Boolean).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
        </article>
      ))}
    </div>
  );
}

function EducationSection({ content }: { content: ResumeContentInput }) {
  return (
    <div className="resume-section-content">
      {content.education.filter((entry) => entry.school || entry.degree || entry.field || entry.cgpa).map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading"><div><h3>{entry.degree || "Education"}{entry.field ? `, ${entry.field}` : ""}</h3><p>{entry.school}{entry.location ? `, ${entry.location}` : ""}{entry.cgpa ? ` · CGPA ${entry.cgpa}` : ""}</p></div><span>{entry.endDate || entry.startDate}</span></div>
        </article>
      ))}
    </div>
  );
}

function SectionContent({ section, content, variant }: { section: SectionKey; content: ResumeContentInput; variant: string }) {
  switch (section) {
    case "summary":
      return <p className="resume-summary">{content.summary}</p>;
    case "experience":
      return <ExperienceSection content={content} variant={variant} />;
    case "education":
      return <EducationSection content={content} />;
    case "skills":
      return <div className="resume-skills">{content.skills.filter(Boolean).map((skill) => <span key={skill}>{skill}</span>)}</div>;
    case "projects":
      return <div className="resume-section-content">{content.projects.filter((entry) => entry.name || entry.description).map((project) => <article className="resume-entry" key={project.id}><div className="resume-entry-heading"><div><h3>{project.url ? <a href={normalizeExternalUrl(project.url)} target="_blank" rel="noopener noreferrer">{project.name}</a> : project.name}</h3><p>{project.technologies.filter(Boolean).join(" · ")}</p></div><span>{project.liveUrl ? <a className="resume-live-link" href={normalizeExternalUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer">Live site ↗</a> : null}</span></div><p className="resume-summary">{project.description}</p></article>)}</div>;
    case "certifications":
      return <div className="resume-section-content">{content.certifications.filter((entry) => entry.name || entry.issuer).map((certification) => <article className="resume-entry" key={certification.id}><div className="resume-entry-heading"><div><h3>{certification.url ? <a href={normalizeExternalUrl(certification.url)} target="_blank" rel="noopener noreferrer">{certification.name}</a> : certification.name}</h3><p>{certification.issuer}</p></div><span>{certification.date}</span></div></article>)}</div>;
    case "publications":
    case "awards":
      return null;
  }
}

function ResumeSections({ content, meta, variant }: { content: ResumeContentInput; meta: TemplateMeta; variant: string }) {
  return (
    <div className={`resume-sections resume-sections-${variant}`}>
      {getVisibleSections(meta, content).map((section) => (
        <section key={section} className="resume-section">
          <SectionHeading variant={variant}>{section}</SectionHeading>
          <SectionContent section={section} content={content} variant={variant} />
        </section>
      ))}
    </div>
  );
}

function AtsTemplate({ content, meta }: { content: ResumeContentInput; meta: TemplateMeta }) {
  return <article className="resume-paper resume-paper-ats"><header className="resume-header resume-header-ats"><h1>{content.personalInfo.fullName || "Your Name"}</h1><p>{content.personalInfo.headline}</p><ContactLine content={content} variant="ats" /></header><ResumeSections content={content} meta={meta} variant="ats" /></article>;
}

function ModernTemplate({ content, meta }: { content: ResumeContentInput; meta: TemplateMeta }) {
  return <article className="resume-paper resume-paper-modern"><header className="resume-header resume-header-modern"><div><p className="resume-kicker">Resume / {new Date().getFullYear()}</p><h1>{content.personalInfo.fullName || "Your Name"}</h1><p>{content.personalInfo.headline}</p></div><ContactLine content={content} variant="modern" /></header><ResumeSections content={content} meta={meta} variant="modern" /></article>;
}

function MinimalistTemplate({ content, meta }: { content: ResumeContentInput; meta: TemplateMeta }) {
  return <article className="resume-paper resume-paper-minimalist"><header className="resume-header resume-header-minimalist"><h1>{content.personalInfo.fullName || "Your Name"}</h1><ContactLine content={content} variant="minimalist" /></header><ResumeSections content={content} meta={meta} variant="minimalist" /></article>;
}

export function ResumePreview({ content, templateId }: PreviewProps) {
  const meta = getTemplateMeta(templateId);
  const Template = meta.id === "modern" ? ModernTemplate : meta.id === "minimalist" ? MinimalistTemplate : AtsTemplate;

  return <div className="resume-preview-frame"><Template content={content} meta={meta} /></div>;
}
