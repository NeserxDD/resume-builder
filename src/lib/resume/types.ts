export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "publications"
  | "awards";

export type PersonalInfo = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
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

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  field: string;
  cgpa: string;
  location: string;
  startDate: string;
  endDate: string;
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

export type ResumeContent = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
};

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  supportsPhoto: boolean;
  sections: SectionKey[];
  atsSafe: boolean;
};
