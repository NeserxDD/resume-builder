import type { ResumeContentInput } from "@/lib/resume/schema";
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
      return content.skills.some(Boolean);
    case "projects":
      return content.projects.some((entry) => entry.name || entry.description);
    case "certifications":
      return content.certifications.some((entry) => entry.name || entry.issuer);
    case "publications":
    case "awards":
      return false;
  }
}

export function getVisibleSections(meta: TemplateMeta, content: ResumeContentInput) {
  return meta.sections.filter((section) => hasSectionContent(section, content));
}
