import { z } from "zod";

const nonEmptyId = z.string().min(1);

const personalInfoSchema = z.object({
  fullName: z.string().max(120),
  headline: z.string().max(160),
  email: z.string().email().or(z.literal("")),
  phone: z.string().max(40),
  location: z.string().max(120),
  website: z.string().max(300),
  linkedin: z.string().max(300),
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

const educationSchema = z.object({
  id: nonEmptyId,
  school: z.string().max(160),
  degree: z.string().max(160),
  field: z.string().max(160),
  cgpa: z.string().max(30),
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
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

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().max(2000),
  experience: z.array(experienceSchema).max(20),
  education: z.array(educationSchema).max(20),
  skills: z.array(z.string().max(80)).max(50),
  projects: z.array(projectSchema).max(20),
  certifications: z.array(certificationSchema).max(20),
});

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateId: z.enum(["ats", "modern", "minimalist"]),
  content: resumeContentSchema,
});

export const resumeDetailsSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateId: z.enum(["ats", "modern", "minimalist"]),
});

export const resumeRequestSchema = resumeDetailsSchema.extend({
  sourceId: nonEmptyId.optional(),
});

export const resumeUpdateSchema = resumeCreateSchema.partial().extend({
  id: nonEmptyId,
});

export const resumePatchSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  templateId: z.enum(["ats", "modern", "minimalist"]).optional(),
  content: resumeContentSchema.optional(),
});

export function normalizeContent(content: ResumeContentInput): ResumeContentInput {
  return {
    ...content,
    education: content.education.map((entry) => ({ ...entry, cgpa: entry.cgpa ?? (entry as { gpa?: string }).gpa ?? "" })),
    projects: content.projects.map((entry) => ({ ...entry, liveUrl: entry.liveUrl ?? "" })),
  };
}

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export type ResumeContentInput = z.infer<typeof resumeContentSchema>;
export type ResumeCreateInput = z.infer<typeof resumeCreateSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;
