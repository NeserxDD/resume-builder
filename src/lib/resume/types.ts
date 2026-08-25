export const SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "leadership",
  "publications",
  "research",
  "teaching",
  "awards",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  leadership: "Leadership & Activities",
  publications: "Publications",
  research: "Research",
  teaching: "Teaching",
  awards: "Awards",
};

export type PersonalInfo = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  website: string;
  linkedin: string;
  photoUrl: string;
};

export type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type StudyAbroad = {
  program: string;
  location: string;
  details: string;
  startDate: string;
  endDate: string;
};

export type HighSchool = {
  name: string;
  location: string;
  details: string;
  graduationDate: string;
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  field: string;
  cgpa: string;
  location: string;
  startDate: string;
  endDate: string;
  thesis: string;
  coursework: string;
  studyAbroad?: StudyAbroad;
  highSchool?: HighSchool;
};

export type ProjectEntry = {
  id: string;
  name: string;
  description: string;
  url: string;
  liveUrl: string;
  technologies: string[];
};

export type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

export type LeadershipEntry = {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type PublicationEntry = {
  id: string;
  title: string;
  venue: string;
  year: string;
  url: string;
  authors: string;
};

export type ResearchEntry = {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type TeachingEntry = {
  id: string;
  course: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type AwardEntry = {
  id: string;
  title: string;
  issuer: string;
  year: string;
  url: string;
  description: string;
};

export type SkillGroup = {
  id: string;
  name: string;
  skills: string[];
};

export type ResumeContent = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  skillGroups: SkillGroup[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  leadership: LeadershipEntry[];
  publications: PublicationEntry[];
  research: ResearchEntry[];
  teaching: TeachingEntry[];
  awards: AwardEntry[];
};

export type HighlightStyle =
  | "template-default"
  | "bullet"
  | "circle"
  | "square"
  | "triangle"
  | "dash"
  | "diamond"
  | "none";

export type ResumeSelection = {
  sections: SectionKey[];
  entries: Partial<Record<SectionKey, string[]>>;
  highlightStyle?: HighlightStyle;
};

export type TemplateFieldKey =
  | "headline"
  | "address"
  | "website"
  | "linkedin"
  | "thesis"
  | "coursework"
  | "studyAbroad"
  | "highSchool"
  | "flatSkills"
  | "groupedSkills";

export type TemplateFields = Record<TemplateFieldKey, boolean>;

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  supportsPhoto: boolean;
  sections: SectionKey[];
  atsSafe: boolean;
  fields: TemplateFields;
};