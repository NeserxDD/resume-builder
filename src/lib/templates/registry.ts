import type { TemplateMeta } from "@/lib/resume/types";

export const templates = [
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Single column, standard headings, and easy for application systems to parse.",
    thumbnail: "ats",
    supportsPhoto: false,
    sections: ["summary", "experience", "education", "skills", "projects", "certifications"],
    atsSafe: true,
  },
  {
    id: "modern",
    name: "Modern Professional",
    description: "A contemporary single-column layout with more breathing room and hierarchy.",
    thumbnail: "modern",
    supportsPhoto: false,
    sections: ["summary", "experience", "education", "skills", "projects", "certifications"],
    atsSafe: true,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Only the essentials, with the focus kept firmly on your work.",
    thumbnail: "minimalist",
    supportsPhoto: false,
    sections: ["summary", "experience", "education", "skills"],
    atsSafe: true,
  },
] satisfies TemplateMeta[];

export function getTemplateMeta(templateId: string) {
  return templates.find((template) => template.id === templateId) ?? templates[0];
}
