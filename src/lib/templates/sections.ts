import type { ResumeContentInput, ResumeSelectionInput } from "@/lib/resume/schema";
import type { SectionKey, TemplateMeta } from "@/lib/resume/types";

export function hasSectionContent(section: SectionKey, content: ResumeContentInput) {
  switch (section) {
    case "summary":
      return Boolean(content.summary.trim());
    case "experience":
      return content.experience.some((entry) => entry.company || entry.role || entry.bullets.some(Boolean));
    case "education":
      return content.education.some((entry) => entry.school || entry.degree || entry.field || entry.cgpa);
    case "skills":
      return content.skills.some(Boolean) || content.skillGroups.some((group) => group.skills.some(Boolean));
    case "projects":
      return content.projects.some((entry) => entry.name || entry.description);
    case "certifications":
      return content.certifications.some((entry) => entry.name || entry.issuer);
    case "leadership":
      return content.leadership.some((entry) => entry.role || entry.organization || entry.bullets.some(Boolean));
    case "publications":
      return content.publications.some((entry) => entry.title || entry.venue);
    case "research":
      return content.research.some((entry) => entry.title || entry.organization || entry.bullets.some(Boolean));
    case "teaching":
      return content.teaching.some((entry) => entry.course || entry.institution);
    case "awards":
      return content.awards.some((entry) => entry.title || entry.issuer);
  }
}

export function getVisibleSections(
  meta: TemplateMeta,
  content: ResumeContentInput,
  selection?: ResumeSelectionInput,
) {
  let sections = meta.sections;
  if (selection && selection.sections.length) {
    const wanted = new Set(selection.sections);
    sections = meta.sections.filter((section) => wanted.has(section));
  }
  return sections.filter((section) => hasSectionContent(section, content));
}

export function selectedEntryIds(
  section: SectionKey,
  selection: ResumeSelectionInput | undefined,
  ids: string[],
) {
  if (!selection) return ids;
  const chosen = selection.entries[section];
  if (!chosen?.length) return ids;
  const allowed = new Set(chosen);
  return ids.filter((id) => allowed.has(id));
}