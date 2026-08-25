import type { ReactNode } from "react";

import { getTemplateMeta } from "@/lib/templates/registry";
import { getVisibleSections, selectedEntryIds } from "@/lib/templates/sections";
import { normalizeExternalUrl } from "@/lib/resume/schema";
import { resolveHighlightStyle } from "@/lib/resume/highlights";
import type { ResumeContentInput, ResumeSelectionInput } from "@/lib/resume/schema";
import { SECTION_LABELS } from "@/lib/resume/types";
import type { HighlightStyle, SectionKey, TemplateMeta } from "@/lib/resume/types";

type PreviewProps = {
  content: ResumeContentInput;
  templateId: string;
  selection?: ResumeSelectionInput;
  photoUrl?: string;
};

function ContactLine({ content, variant }: { content: ResumeContentInput; variant: string }) {
  const { personalInfo } = content;
  const values =
    variant === "harvard"
      ? [personalInfo.address, personalInfo.location, personalInfo.email, personalInfo.phone].filter(Boolean).join("  •  ")
      : variant === "classic-tech"
        ? [personalInfo.website, personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join("  |  ")
        : [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean).join("  /  ");

  return values ? <p className={`resume-contact resume-contact-${variant}`}>{values}</p> : null;
}

function SectionHeading({ children, variant }: { children: ReactNode; variant: string }) {
  return <h2 className={`resume-section-heading resume-section-heading-${variant}`}>{children}</h2>;
}

function SectionLabel({ section, variant }: { section: SectionKey; variant: string }) {
  if (variant === "harvard" && section === "skills") return "Skills & Interests";
  return SECTION_LABELS[section];
}

function Dates({ start, end, current }: { start: string; end: string; current?: boolean }) {
  const label = [start, current ? "Present" : end].filter(Boolean).join(" — ");
  return label ? <span>{label}</span> : null;
}

function BulletList({ bullets, variant, marker }: { bullets: string[]; variant: string; marker: HighlightStyle }) {
  const visible = bullets.filter(Boolean);
  if (!visible.length) return null;
  return <ul className={`resume-bullets resume-bullets-${variant} resume-bullets-marker-${marker}`}>{visible.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>;
}

function ExperienceSection({ content, variant, selection }: { content: ResumeContentInput; variant: string; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("experience", selection, content.experience.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.experience.filter((entry) => allowed.has(entry.id) && (entry.company || entry.role || entry.bullets.some(Boolean)));
  const marker = resolveHighlightStyle(variant, selection);
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading">
            <div><h3>{entry.role || "Role"}</h3><p>{entry.company}{entry.location ? `, ${entry.location}` : ""}</p></div>
            <Dates start={entry.startDate} end={entry.endDate} current={entry.current} />
          </div>
          <BulletList bullets={entry.bullets} variant={variant} marker={marker} />
        </article>
      ))}
    </div>
  );
}

function HarvardRow({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="resume-harvard-row">
      <span className="resume-harvard-left">{left}</span>
      {right ? <span className="resume-harvard-right">{right}</span> : null}
    </div>
  );
}

function HarvardEducationEntry({ entry }: { entry: ResumeContentInput["education"][number] }) {
  const study = entry.studyAbroad;
  const hs = entry.highSchool;
  const degreeLine = [entry.degree, entry.field].filter(Boolean).join(", ");
  return (
    <article className="resume-entry">
      <HarvardRow left={<h3>{entry.school || "School"}</h3>} right={entry.location} />
      <HarvardRow
        left={<span className="resume-harvard-degree">{degreeLine || "Degree"}{entry.cgpa ? `, CGPA ${entry.cgpa}` : ""}</span>}
        right={entry.endDate || entry.startDate}
      />
      {entry.thesis ? <p className="resume-entry-note"><em>Thesis:</em> {entry.thesis}</p> : null}
      {entry.coursework ? <p className="resume-entry-note"><em>Relevant Coursework:</em> {entry.coursework}</p> : null}
      {study && (study.program || study.location || study.details || study.startDate || study.endDate) ? (
        <div className="resume-harvard-subblock">
          <HarvardRow left={<em>Study Abroad</em>} right={study.location} />
          <HarvardRow left={<span>{[study.program, study.details].filter(Boolean).join(" — ")}</span>} right={[study.startDate, study.endDate].filter(Boolean).join(" – ")} />
        </div>
      ) : null}
      {hs && (hs.name || hs.location || hs.details || hs.graduationDate) ? (
        <div className="resume-harvard-subblock">
          <HarvardRow left={<strong>{hs.name}</strong>} right={hs.location} />
          <HarvardRow left={<span>{hs.details}</span>} right={hs.graduationDate ? `Graduation: ${hs.graduationDate}` : ""} />
        </div>
      ) : null}
    </article>
  );
}

function EducationSection({ content, variant, selection }: { content: ResumeContentInput; variant: string; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("education", selection, content.education.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.education.filter((entry) => allowed.has(entry.id) && (entry.school || entry.degree || entry.field || entry.cgpa));
  return (
    <div className="resume-section-content">
      {entries.map((entry) =>
        variant === "harvard" ? (
          <HarvardEducationEntry entry={entry} key={entry.id} />
        ) : (
          <article className="resume-entry" key={entry.id}>
            <div className="resume-entry-heading"><div><h3>{entry.school || "School"}</h3><p>{[entry.degree, entry.field].filter(Boolean).join(", ")}{entry.location ? `, ${entry.location}` : ""}{entry.cgpa ? ` · CGPA ${entry.cgpa}` : ""}</p></div><span>{entry.endDate || entry.startDate}</span></div>
            {entry.thesis ? <p className="resume-entry-note"><em>Thesis:</em> {entry.thesis}</p> : null}
            {entry.coursework ? <p className="resume-entry-note"><em>Relevant Coursework:</em> {entry.coursework}</p> : null}
          </article>
        ),
      )}
    </div>
  );
}

function LeadershipSection({ content, variant, selection }: { content: ResumeContentInput; variant: string; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("leadership", selection, content.leadership.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.leadership.filter((entry) => allowed.has(entry.id) && (entry.role || entry.organization || entry.bullets.some(Boolean)));
  const marker = resolveHighlightStyle(variant, selection);
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading">
            <div><h3>{entry.organization || "Organization"}</h3><p>{entry.role}{entry.location ? `, ${entry.location}` : ""}</p></div>
            <Dates start={entry.startDate} end={entry.endDate} current={entry.current} />
          </div>
          <BulletList bullets={entry.bullets} variant={variant} marker={marker} />
        </article>
      ))}
    </div>
  );
}

function PublicationsSection({ content, selection }: { content: ResumeContentInput; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("publications", selection, content.publications.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.publications.filter((entry) => allowed.has(entry.id) && (entry.title || entry.venue));
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading"><div><h3>{entry.url ? <a href={normalizeExternalUrl(entry.url)} target="_blank" rel="noopener noreferrer">{entry.title}</a> : entry.title}</h3><p>{entry.venue || ""}{entry.authors ? `${entry.venue ? " · " : ""}${entry.authors}` : ""}</p></div><span>{entry.year}</span></div>
        </article>
      ))}
    </div>
  );
}

function ResearchSection({ content, variant, selection }: { content: ResumeContentInput; variant: string; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("research", selection, content.research.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.research.filter((entry) => allowed.has(entry.id) && (entry.title || entry.organization || entry.bullets.some(Boolean)));
  const marker = resolveHighlightStyle(variant, selection);
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading"><div><h3>{entry.title || "Research"}</h3><p>{entry.organization}{entry.location ? `, ${entry.location}` : ""}</p></div><Dates start={entry.startDate} end={entry.endDate} /></div>
          <BulletList bullets={entry.bullets} variant={variant} marker={marker} />
        </article>
      ))}
    </div>
  );
}

function TeachingSection({ content, selection }: { content: ResumeContentInput; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("teaching", selection, content.teaching.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.teaching.filter((entry) => allowed.has(entry.id) && (entry.course || entry.institution));
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading"><div><h3>{entry.course || "Course"}</h3><p>{entry.institution}{entry.location ? `, ${entry.location}` : ""}</p></div><Dates start={entry.startDate} end={entry.endDate} /></div>
          {entry.description ? <p className="resume-summary">{entry.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function AwardsSection({ content, selection }: { content: ResumeContentInput; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("awards", selection, content.awards.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.awards.filter((entry) => allowed.has(entry.id) && (entry.title || entry.issuer));
  return (
    <div className="resume-section-content">
      {entries.map((entry) => (
        <article className="resume-entry" key={entry.id}>
          <div className="resume-entry-heading"><div><h3>{entry.url ? <a href={normalizeExternalUrl(entry.url)} target="_blank" rel="noopener noreferrer">{entry.title}</a> : entry.title}</h3><p>{entry.issuer}</p></div><span>{entry.year}</span></div>
          {entry.description ? <p className="resume-summary">{entry.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function SkillsContent({ content, variant }: { content: ResumeContentInput; variant: string }) {
  const hasGroups = content.skillGroups.some((group) => group.skills.some(Boolean));
  if (variant === "harvard" && hasGroups) {
    return (
      <div className="resume-skills resume-skills-groups">
        {content.skillGroups.filter((group) => group.skills.some(Boolean)).map((group) => (
          <p key={group.id}><strong>{group.name}:</strong> {group.skills.filter(Boolean).join(", ")}</p>
        ))}
      </div>
    );
  }
  return <div className="resume-skills">{content.skills.filter(Boolean).map((skill) => <span key={skill}>{skill}</span>)}</div>;
}

function ProjectsSection({ content, selection }: { content: ResumeContentInput; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("projects", selection, content.projects.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.projects.filter((entry) => allowed.has(entry.id) && (entry.name || entry.description));
  return (
    <div className="resume-section-content">
      {entries.map((project) => (
        <article className="resume-entry" key={project.id}>
          <div className="resume-entry-heading"><div><h3>{project.url ? <a href={normalizeExternalUrl(project.url)} target="_blank" rel="noopener noreferrer">{project.name}</a> : project.name}</h3><p>{project.technologies.filter(Boolean).join(" · ")}</p></div><span>{project.liveUrl ? <a className="resume-live-link" href={normalizeExternalUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer">Live site ↗</a> : null}</span></div>
          <p className="resume-summary">{project.description}</p>
        </article>
      ))}
    </div>
  );
}

function CertificationsSection({ content, selection }: { content: ResumeContentInput; selection?: ResumeSelectionInput }) {
  const ids = selectedEntryIds("certifications", selection, content.certifications.map((entry) => entry.id));
  const allowed = new Set(ids);
  const entries = content.certifications.filter((entry) => allowed.has(entry.id) && (entry.name || entry.issuer));
  return (
    <div className="resume-section-content">
      {entries.map((certification) => (
        <article className="resume-entry" key={certification.id}>
          <div className="resume-entry-heading"><div><h3>{certification.url ? <a href={normalizeExternalUrl(certification.url)} target="_blank" rel="noopener noreferrer">{certification.name}</a> : certification.name}</h3><p>{certification.issuer}</p></div><span>{certification.date}</span></div>
        </article>
      ))}
    </div>
  );
}

function SectionContent({ section, content, variant, selection }: { section: SectionKey; content: ResumeContentInput; variant: string; selection?: ResumeSelectionInput }) {
  switch (section) {
    case "summary":
      return <p className="resume-summary">{content.summary}</p>;
    case "experience":
      return <ExperienceSection content={content} variant={variant} selection={selection} />;
    case "education":
      return <EducationSection content={content} variant={variant} selection={selection} />;
    case "skills":
      return <SkillsContent content={content} variant={variant} />;
    case "projects":
      return <ProjectsSection content={content} selection={selection} />;
    case "certifications":
      return <CertificationsSection content={content} selection={selection} />;
    case "leadership":
      return <LeadershipSection content={content} variant={variant} selection={selection} />;
    case "publications":
      return <PublicationsSection content={content} selection={selection} />;
    case "research":
      return <ResearchSection content={content} variant={variant} selection={selection} />;
    case "teaching":
      return <TeachingSection content={content} selection={selection} />;
    case "awards":
      return <AwardsSection content={content} selection={selection} />;
  }
}

function ResumeSections({ content, meta, variant, selection }: { content: ResumeContentInput; meta: TemplateMeta; variant: string; selection?: ResumeSelectionInput }) {
  return (
    <div className={`resume-sections resume-sections-${variant}`}>
      {getVisibleSections(meta, content, selection).map((section) => (
        <section key={section} className="resume-section">
          <SectionHeading variant={variant}><SectionLabel section={section} variant={variant} /></SectionHeading>
          <SectionContent section={section} content={content} variant={variant} selection={selection} />
        </section>
      ))}
    </div>
  );
}

type TemplateProps = {
  content: ResumeContentInput;
  meta: TemplateMeta;
  selection?: ResumeSelectionInput;
  photoUrl?: string;
};

function AtsTemplate({ content, meta, selection }: TemplateProps) {
  return <article className="resume-paper resume-paper-ats"><header className="resume-header resume-header-ats"><h1>{content.personalInfo.fullName || "Your Name"}</h1><p>{content.personalInfo.headline}</p><ContactLine content={content} variant="ats" /></header><ResumeSections content={content} meta={meta} variant="ats" selection={selection} /></article>;
}

function ModernTemplate({ content, meta, selection }: TemplateProps) {
  return <article className="resume-paper resume-paper-modern"><header className="resume-header resume-header-modern"><div><p className="resume-kicker">Resume / {new Date().getFullYear()}</p><h1>{content.personalInfo.fullName || "Your Name"}</h1><p>{content.personalInfo.headline}</p></div><ContactLine content={content} variant="modern" /></header><ResumeSections content={content} meta={meta} variant="modern" selection={selection} /></article>;
}

function MinimalistTemplate({ content, meta, selection }: TemplateProps) {
  return <article className="resume-paper resume-paper-minimalist"><header className="resume-header resume-header-minimalist"><h1>{content.personalInfo.fullName || "Your Name"}</h1><ContactLine content={content} variant="minimalist" /></header><ResumeSections content={content} meta={meta} variant="minimalist" selection={selection} /></article>;
}

function HarvardTemplate({ content, meta, selection }: TemplateProps) {
  return (
    <article className="resume-paper resume-paper-harvard">
      <header className="resume-header resume-header-harvard">
        <h1>{content.personalInfo.fullName || "Your Name"}</h1>
        <div className="resume-harvard-rule" aria-hidden="true" />
        <ContactLine content={content} variant="harvard" />
      </header>
      <ResumeSections content={content} meta={meta} variant="harvard" selection={selection} />
    </article>
  );
}

function ClassicTechTemplate({ content, meta, selection }: TemplateProps) {
  return (
    <article className="resume-paper resume-paper-classic-tech">
      <header className="resume-header resume-header-classic-tech">
        <h1>{content.personalInfo.fullName || "Your Name"}</h1>
        <ContactLine content={content} variant="classic-tech" />
      </header>
      <ResumeSections content={content} meta={meta} variant="classic-tech" selection={selection} />
    </article>
  );
}

function AwesomeCvTemplate({ content, meta, selection, photoUrl }: TemplateProps) {
  return (
    <article className="resume-paper resume-paper-awesome-cv">
      <header className="resume-header resume-header-awesome-cv">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="resume-photo resume-photo-awesome-cv" src={photoUrl} alt="" />
        ) : null}
        <div>
          <h1>{content.personalInfo.fullName || "Your Name"}</h1>
          <p className="resume-headline-accent">{content.personalInfo.headline}</p>
          <ContactLine content={content} variant="awesome-cv" />
        </div>
      </header>
      <ResumeSections content={content} meta={meta} variant="awesome-cv" selection={selection} />
    </article>
  );
}

function TwoColumnSidebar({ content, visibleSections, photoUrl }: { content: ResumeContentInput; visibleSections: SectionKey[]; photoUrl?: string }) {
  const { personalInfo } = content;
  const contacts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const links = [personalInfo.website, personalInfo.linkedin].filter(Boolean);
  const showSkills = visibleSections.includes("skills");
  return (
    <aside className="resume-two-col-sidebar">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="resume-photo resume-photo-circle" src={photoUrl} alt="" />
      ) : null}
      <h2 className="resume-two-col-side-heading">Contact</h2>
      {contacts.map((value) => <p key={value}>{value}</p>)}
      {links.length ? (
        <>
          <h2 className="resume-two-col-side-heading">Links</h2>
          {links.map((value) => <p key={value}>{value}</p>)}
        </>
      ) : null}
      {showSkills ? (
        <>
          <h2 className="resume-two-col-side-heading">Skills</h2>
          <div className="resume-skills">{content.skills.filter(Boolean).map((skill) => <span key={skill}>{skill}</span>)}</div>
        </>
      ) : null}
    </aside>
  );
}

function TwoColumnTemplate({ content, meta, selection, photoUrl }: TemplateProps) {
  const visible = getVisibleSections(meta, content, selection);
  const mainSections = visible.filter((section) => section !== "skills");
  const hasContact = Boolean(content.personalInfo.email || content.personalInfo.phone || content.personalInfo.location || personalInfoHasLinks(content) || photoUrl);
  if (!mainSections.length && !hasContact) {
    return (
      <article className="resume-paper resume-paper-two-column">
        <p className="resume-summary">Add experience, education, or skills to see your resume appear here.</p>
      </article>
    );
  }
  return (
    <article className="resume-paper resume-paper-two-column">
      <div className="resume-two-col-grid">
        <div className="resume-two-col-main">
          <header className="resume-two-col-heading-block">
            <h1>{content.personalInfo.fullName || "Your Name"}</h1>
            <p className="resume-headline-accent">{content.personalInfo.headline}</p>
          </header>
          <ResumeSections content={content} meta={{ ...meta, sections: mainSections }} variant="two-column" selection={selection} />
        </div>
        <TwoColumnSidebar content={content} visibleSections={visible} photoUrl={photoUrl} />
      </div>
    </article>
  );
}

function personalInfoHasLinks(content: ResumeContentInput) {
  return Boolean(content.personalInfo.website || content.personalInfo.linkedin);
}

export function ResumePreview({ content, templateId, selection, photoUrl }: PreviewProps) {
  const meta = getTemplateMeta(templateId);
  const Template =
    meta.id === "modern" ? ModernTemplate
    : meta.id === "minimalist" ? MinimalistTemplate
    : meta.id === "harvard" ? HarvardTemplate
    : meta.id === "classic-tech" ? ClassicTechTemplate
    : meta.id === "awesome-cv" ? AwesomeCvTemplate
    : meta.id === "two-column" ? TwoColumnTemplate
    : AtsTemplate;

  return <div className="resume-preview-frame"><Template content={content} meta={meta} selection={selection} photoUrl={photoUrl} /></div>;
}