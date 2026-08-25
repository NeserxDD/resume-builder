import { z } from "zod";

import { HIGHLIGHT_STYLES } from "@/lib/resume/highlights";
import { SECTION_KEYS } from "@/lib/resume/types";
import type { SectionKey } from "@/lib/resume/types";

const nonEmptyId = z.string().min(1);

const personalInfoSchema = z.object({
  fullName: z.string().max(120),
  headline: z.string().max(160),
  email: z.string().email().or(z.literal("")),
  phone: z.string().max(40),
  address: z.string().max(120),
  location: z.string().max(120),
  website: z.string().max(300),
  linkedin: z.string().max(300),
  photoUrl: z.string().max(300).optional(),
});

const experienceSchema = z.object({
  id: nonEmptyId,
  company: z.string().max(160),
  role: z.string().max(160),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  current: z.boolean(),
  bullets: z.array(z.string().max(500)).max(12),
});

const studyAbroadSchema = z.object({
  program: z.string().max(300),
  location: z.string().max(120),
  details: z.string().max(1000),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
});

const highSchoolSchema = z.object({
  name: z.string().max(300),
  location: z.string().max(120),
  details: z.string().max(1000),
  graduationDate: z.string().max(30),
});

const educationSchema = z.object({
  id: nonEmptyId,
  school: z.string().max(160),
  degree: z.string().max(160),
  field: z.string().max(160),
  cgpa: z.string().max(30),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  thesis: z.string().max(500).optional(),
  coursework: z.string().max(1000).optional(),
  studyAbroad: studyAbroadSchema.optional(),
  highSchool: highSchoolSchema.optional(),
});

const projectSchema = z.object({
  id: nonEmptyId,
  name: z.string().max(160),
  description: z.string().max(500),
  url: z.string().max(300),
  liveUrl: z.string().max(300),
  technologies: z.array(z.string().max(80)).max(20),
});

const certificationSchema = z.object({
  id: nonEmptyId,
  name: z.string().max(160),
  issuer: z.string().max(160),
  date: z.string().max(30),
  url: z.string().max(300),
});

const leadershipSchema = z.object({
  id: nonEmptyId,
  role: z.string().max(160),
  organization: z.string().max(160),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  current: z.boolean(),
  bullets: z.array(z.string().max(500)).max(12),
});

const publicationSchema = z.object({
  id: nonEmptyId,
  title: z.string().max(300),
  venue: z.string().max(160),
  year: z.string().max(30),
  url: z.string().max(300),
  authors: z.string().max(500),
});

const researchSchema = z.object({
  id: nonEmptyId,
  title: z.string().max(300),
  organization: z.string().max(160),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  bullets: z.array(z.string().max(500)).max(12),
});

const teachingSchema = z.object({
  id: nonEmptyId,
  course: z.string().max(200),
  institution: z.string().max(160),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  description: z.string().max(500),
});

const awardSchema = z.object({
  id: nonEmptyId,
  title: z.string().max(200),
  issuer: z.string().max(160),
  year: z.string().max(30),
  url: z.string().max(300),
  description: z.string().max(500),
});

const skillGroupSchema = z.object({
  id: nonEmptyId,
  name: z.string().max(80),
  skills: z.array(z.string().max(80)).max(30),
});

export const resumeSelectionSchema = z.object({
  sections: z.array(z.enum(SECTION_KEYS)).default([]),
  entries: z.record(z.string(), z.array(z.string())).default({}),
  highlightStyle: z.enum(HIGHLIGHT_STYLES).optional(),
});

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().max(2000),
  experience: z.array(experienceSchema).max(20),
  education: z.array(educationSchema).max(20),
  skills: z.array(z.string().max(80)).max(50),
  skillGroups: z.array(skillGroupSchema).max(12),
  projects: z.array(projectSchema).max(20),
  certifications: z.array(certificationSchema).max(20),
  leadership: z.array(leadershipSchema).max(20),
  publications: z.array(publicationSchema).max(30),
  research: z.array(researchSchema).max(20),
  teaching: z.array(teachingSchema).max(20),
  awards: z.array(awardSchema).max(20),
});

const templateIdSchema = z.enum(["ats", "modern", "minimalist", "harvard", "classic-tech", "awesome-cv", "two-column"]);

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateId: templateIdSchema,
  content: resumeContentSchema,
  selection: resumeSelectionSchema.optional(),
});

export const resumeDetailsSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateId: templateIdSchema,
});

export const resumeRequestSchema = resumeDetailsSchema.extend({
  sourceId: nonEmptyId.optional(),
  selection: resumeSelectionSchema.optional(),
});

export const resumeUpdateSchema = resumeCreateSchema.partial().extend({
  id: nonEmptyId,
});

export const resumePatchSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  templateId: templateIdSchema.optional(),
  content: resumeContentSchema.optional(),
  selection: resumeSelectionSchema.optional(),
});

export function emptyResumeContent(): ResumeContentInput {
  return {
    personalInfo: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      website: "",
      linkedin: "",
      photoUrl: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    leadership: [],
    publications: [],
    research: [],
    teaching: [],
    awards: [],
  };
}

function normalizeStudyAbroad(value: unknown) {
  const empty = { program: "", location: "", details: "", startDate: "", endDate: "" };
  if (typeof value === "string") return value.trim() ? { ...empty, program: value } : empty;
  return value && typeof value === "object" ? { ...empty, ...value } : empty;
}

function normalizeHighSchool(value: unknown) {
  const empty = { name: "", location: "", details: "", graduationDate: "" };
  if (typeof value === "string") return value.trim() ? { ...empty, name: value } : empty;
  return value && typeof value === "object" ? { ...empty, ...value } : empty;
}

export function normalizeContent(content: ResumeContentInput): ResumeContentInput {
  return {
    ...content,
    personalInfo: {
      ...content.personalInfo,
      address: content.personalInfo.address ?? "",
      photoUrl: content.personalInfo.photoUrl ?? "",
    },
    education: content.education.map((entry) => ({
      ...entry,
      cgpa: entry.cgpa ?? (entry as { gpa?: string }).gpa ?? "",
      thesis: entry.thesis ?? "",
      coursework: entry.coursework ?? "",
      studyAbroad: normalizeStudyAbroad(entry.studyAbroad),
      highSchool: normalizeHighSchool(entry.highSchool),
    })),
    projects: content.projects.map((entry) => ({ ...entry, liveUrl: entry.liveUrl ?? "" })),
    skillGroups: content.skillGroups ?? [],
    leadership: content.leadership ?? [],
    publications: content.publications ?? [],
    research: content.research ?? [],
    teaching: content.teaching ?? [],
    awards: content.awards ?? [],
  };
}

export function entryIdsForSection(section: SectionKey, content: ResumeContentInput): string[] {
  switch (section) {
    case "experience":
      return content.experience.map((entry) => entry.id);
    case "education":
      return content.education.map((entry) => entry.id);
    case "projects":
      return content.projects.map((entry) => entry.id);
    case "certifications":
      return content.certifications.map((entry) => entry.id);
    case "leadership":
      return content.leadership.map((entry) => entry.id);
    case "publications":
      return content.publications.map((entry) => entry.id);
    case "research":
      return content.research.map((entry) => entry.id);
    case "teaching":
      return content.teaching.map((entry) => entry.id);
    case "awards":
      return content.awards.map((entry) => entry.id);
    default:
      return [];
  }
}

export function filterContentBySelection(content: ResumeContentInput, selection: ResumeSelectionInput): ResumeContentInput {
  const selected = new Set(selection.sections);
  const pick = <T extends { id: string }>(section: SectionKey, entries: T[]): T[] => {
    if (!selected.has(section)) return [];
    const ids = selection.entries[section];
    if (!ids?.length) return entries;
    const allowed = new Set(ids);
    return entries.filter((entry) => allowed.has(entry.id));
  };

  return normalizeContent({
    ...content,
    summary: selected.has("summary") ? content.summary : "",
    experience: pick("experience", content.experience),
    education: pick("education", content.education),
    skills: selected.has("skills") ? content.skills : [],
    skillGroups: selected.has("skills") ? content.skillGroups : [],
    projects: pick("projects", content.projects),
    certifications: pick("certifications", content.certifications),
    leadership: pick("leadership", content.leadership),
    publications: pick("publications", content.publications),
    research: pick("research", content.research),
    teaching: pick("teaching", content.teaching),
    awards: pick("awards", content.awards),
  });
}

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export type StoredResumeContent = ResumeContentInput & { selection?: ResumeSelectionInput };

export function attachSelection(content: ResumeContentInput, selection?: ResumeSelectionInput): StoredResumeContent {
  const stored = normalizeContent(content) as StoredResumeContent;
  if (selection) stored.selection = selection;
  return stored;
}

export function splitSelection(stored: unknown): { content: ResumeContentInput; selection?: ResumeSelectionInput } {
  const raw = (stored ?? {}) as StoredResumeContent;
  const { selection, ...content } = raw;
  return { content: normalizeContent(content as ResumeContentInput), selection };
}

export type ResumeContentInput = z.infer<typeof resumeContentSchema>;
export type ResumeCreateInput = z.infer<typeof resumeCreateSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;
export type ResumeSelectionInput = z.infer<typeof resumeSelectionSchema>;