"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useRouter } from "next/navigation";

import { resumeContentSchema, emptyResumeContent } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";
import { HighlightsField } from "@/components/resumes/highlights-field";
import { TagListField } from "@/components/resumes/tag-list-field";

const emptyContent = emptyResumeContent();

const emptyExperience = {
  id: "experience-1",
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: [""],
};

const emptyEducation = {
  id: "education-1",
  school: "",
  degree: "",
  field: "",
  cgpa: "",
  location: "",
  startDate: "",
  endDate: "",
};

const emptyProject = {
  id: "project-1",
  name: "",
  description: "",
  url: "",
  liveUrl: "",
  technologies: [],
};

const emptyCertification = {
  id: "certification-1",
  name: "",
  issuer: "",
  date: "",
  url: "",
};

const stepNames = [
  "Personal details",
  "Your summary",
  "Experience",
  "Education",
  "Skills",
  "Optional details",
];

const stepFields: FieldPath<ResumeContentInput>[][] = [
  [
    "personalInfo.fullName",
    "personalInfo.headline",
    "personalInfo.email",
    "personalInfo.phone",
    "personalInfo.address",
    "personalInfo.location",
    "personalInfo.website",
    "personalInfo.linkedin",
  ],
  ["summary"],
  ["experience"],
  ["education"],
  ["skills"],
  ["projects", "certifications"],
];

function Field({
  label,
  name,
  register,
  type = "text",
  placeholder,
  error,
  textarea = false,
  rows = 3,
}: {
  label: string;
  name: FieldPath<ResumeContentInput>;
  register: ReturnType<typeof useForm<ResumeContentInput>>["register"];
  type?: string;
  placeholder?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={rows} placeholder={placeholder} aria-invalid={Boolean(error)} {...register(name)} />
      ) : (
        <input type={type} placeholder={placeholder} aria-invalid={Boolean(error)} {...register(name)} />
      )}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

export function ProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skillsText, setSkillsText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { control, register, reset, trigger, handleSubmit, watch, setValue, formState: { errors } } = useForm<ResumeContentInput>({
    defaultValues: emptyContent,
    resolver: zodResolver(resumeContentSchema),
    mode: "onBlur",
  });
  const experience = useFieldArray({ control, name: "experience", keyName: "fieldKey" });
  const education = useFieldArray({ control, name: "education", keyName: "fieldKey" });
  const projects = useFieldArray({ control, name: "projects", keyName: "fieldKey" });
  const certifications = useFieldArray({ control, name: "certifications", keyName: "fieldKey" });

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (isCurrent) {
          setErrorMessage("We could not load your profile.");
          setIsLoading(false);
        }
        return;
      }

      const data = (await response.json()) as { profile: ResumeContentInput | null };
      if (!isCurrent) return;

      if (data.profile) {
        reset(data.profile);
        setSkillsText(data.profile.skills.join(", "));
      }
      setIsLoading(false);
    }

    void loadProfile();
    return () => {
      isCurrent = false;
    };
  }, [reset]);

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) {
      setErrorMessage("");
      setStep((current) => Math.min(current + 1, stepNames.length - 1));
    } else {
      setErrorMessage("Check the highlighted fields before continuing.");
    }
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function saveProfile(values: ResumeContentInput) {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");
    const content = {
      ...values,
      skills: skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
    const result = resumeContentSchema.safeParse(content);

    if (!result.success) {
      setIsSaving(false);
      setErrorMessage("Add the missing details before saving your profile.");
      return;
    }

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    setIsSaving(false);
    if (!response.ok) {
      setErrorMessage("Your profile could not be saved. Try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (isLoading) {
    return <main className="profile-loading">Loading your profile...</main>;
  }

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">EGD</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">resume / builder</span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">Profile setup</span>
      </header>

      <section className="profile-layout">
        <aside className="profile-aside">
          <p className="eyebrow"><span className="text-[var(--signal)]">setup</span> Your foundation</p>
          <h1 className="display-text mt-7 text-5xl leading-[0.95] tracking-[-0.065em] sm:text-6xl">Fill this in once. Use it everywhere.</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-[var(--ink-muted)]">You can skip anything that does not apply. We will never show an empty section on your resume.</p>
          <div className="profile-progress-copy">
            <span>{String(step + 1).padStart(2, "0")} / {String(stepNames.length).padStart(2, "0")}</span>
            <span>{stepNames[step]}</span>
          </div>
        </aside>

        <section className="profile-card">
          <div className="profile-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / stepNames.length) * 100}%` }} /></div>
          <form onSubmit={handleSubmit((values) => { if (step === stepNames.length - 1) void saveProfile(values); })}>
            <div className="profile-card-head">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">Step {step + 1}</p>
              <h2 className="display-text mt-3 text-3xl tracking-[-0.045em]">{stepNames[step]}</h2>
            </div>

            {step === 0 ? (
              <div className="profile-fields">
                <Field label="Full name" name="personalInfo.fullName" register={register} placeholder="Alex Morgan" error={errors.personalInfo?.fullName?.message} />
                <Field label="Professional headline" name="personalInfo.headline" register={register} placeholder="Product designer" error={errors.personalInfo?.headline?.message} />
                <Field label="Email" name="personalInfo.email" register={register} type="email" placeholder="alex@example.com" error={errors.personalInfo?.email?.message} />
                <Field label="Phone" name="personalInfo.phone" register={register} placeholder="+1 555 000 0000" error={errors.personalInfo?.phone?.message} />
                <Field label="Street address (optional)" name="personalInfo.address" register={register} placeholder="24 Garden Street" error={errors.personalInfo?.address?.message} />
                <Field label="Location" name="personalInfo.location" register={register} placeholder="New York, NY" error={errors.personalInfo?.location?.message} />
                <Field label="Website" name="personalInfo.website" register={register} placeholder="alexmorgan.com" error={errors.personalInfo?.website?.message} />
                <Field label="LinkedIn" name="personalInfo.linkedin" register={register} placeholder="linkedin.com/in/alex" error={errors.personalInfo?.linkedin?.message} />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="profile-fields">
                <label className="profile-field profile-field-wide">
                  <span>Short professional summary</span>
                  <textarea rows={9} placeholder="A few sentences about what you do best..." {...register("summary")} />
                </label>
                <p className="profile-help">Aim for two to four sentences. You can tailor this for a specific resume later.</p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="profile-stack">
                {experience.fields.map((field, index) => (
                  <fieldset className="profile-repeat-card" key={field.fieldKey}>
                    <div className="profile-repeat-head"><span>Role {index + 1}</span>{experience.fields.length > 1 ? <button type="button" onClick={() => experience.remove(index)}>Remove</button> : null}</div>
                    <div className="profile-fields">
                      <Field label="Job title" name={`experience.${index}.role`} register={register} placeholder="Senior designer" />
                      <Field label="Company" name={`experience.${index}.company`} register={register} placeholder="Acme Studio" />
                      <Field label="Location" name={`experience.${index}.location`} register={register} placeholder="Remote" />
                      <Field label="Start" name={`experience.${index}.startDate`} register={register} placeholder="Jan 2022" />
                      <Field label="End" name={`experience.${index}.endDate`} register={register} placeholder="Present" />
                      <label className="profile-check"><input type="checkbox" {...register(`experience.${index}.current`)} /><span>I work here now</span></label>
                      <HighlightsField label="Highlights, one per line" path={`experience.${index}.bullets`} watch={watch} setValue={setValue} placeholder={"Improved...\nLed..."} />
                    </div>
                  </fieldset>
                ))}
                <button className="outline-action" type="button" onClick={() => experience.append({ ...emptyExperience, id: `experience-${experience.fields.length + 1}` })}>+ Add another role</button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="profile-stack">
                {education.fields.map((field, index) => (
                  <fieldset className="profile-repeat-card" key={field.fieldKey}>
                    <div className="profile-repeat-head"><span>Education {index + 1}</span>{education.fields.length > 1 ? <button type="button" onClick={() => education.remove(index)}>Remove</button> : null}</div>
                    <div className="profile-fields">
                      <Field label="School" name={`education.${index}.school`} register={register} placeholder="University of Design" />
                      <Field label="Degree" name={`education.${index}.degree`} register={register} placeholder="Bachelor of Arts" />
                      <Field label="Field of study (optional)" name={`education.${index}.field`} register={register} placeholder="Communication Design" />
                      <Field label="CGPA (optional)" name={`education.${index}.cgpa`} register={register} placeholder="8.9 / 10" />
                      <Field label="Location" name={`education.${index}.location`} register={register} placeholder="Boston, MA" />
                      <Field label="Start" name={`education.${index}.startDate`} register={register} placeholder="2015" />
                      <Field label="End" name={`education.${index}.endDate`} register={register} placeholder="2019" />
                    </div>
                  </fieldset>
                ))}
                <button className="outline-action" type="button" onClick={() => education.append({ ...emptyEducation, id: `education-${education.fields.length + 1}` })}>+ Add another school</button>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="profile-fields">
                <label className="profile-field profile-field-wide">
                  <span>Skills, separated by commas</span>
                  <textarea rows={7} value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="Figma, research, prototyping, facilitation..." />
                </label>
                <p className="profile-help">Use skills you would feel comfortable discussing in an interview.</p>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="profile-stack">
                {projects.fields.map((field, index) => (
                  <fieldset className="profile-repeat-card" key={field.fieldKey}>
                    <div className="profile-repeat-head"><span>Project {index + 1}</span><button type="button" onClick={() => projects.remove(index)}>Remove</button></div>
                    <div className="profile-fields">
                      <Field label="Project name" name={`projects.${index}.name`} register={register} placeholder="A better onboarding flow" />
                      <Field label="GitHub link" name={`projects.${index}.url`} register={register} placeholder="github.com/your-name/project" />
                      <Field label="Live link" name={`projects.${index}.liveUrl`} register={register} placeholder="https://project.dev" />
                      <label className="profile-field profile-field-wide"><span>Description</span><textarea rows={3} {...register(`projects.${index}.description`)} /></label>
                      <TagListField label="Technologies, comma separated" value={watch(`projects.${index}.technologies`) ?? []} placeholder="Figma, React, Notion" onCommit={(technologies) => setValue(`projects.${index}.technologies`, technologies, { shouldDirty: true })} />
                    </div>
                  </fieldset>
                ))}
                {certifications.fields.map((field, index) => (
                  <fieldset className="profile-repeat-card" key={field.fieldKey}>
                    <div className="profile-repeat-head"><span>Certification {index + 1}</span><button type="button" onClick={() => certifications.remove(index)}>Remove</button></div>
                    <div className="profile-fields">
                      <Field label="Name" name={`certifications.${index}.name`} register={register} placeholder="Google UX Design" />
                      <Field label="Issuer" name={`certifications.${index}.issuer`} register={register} placeholder="Google" />
                      <Field label="Date" name={`certifications.${index}.date`} register={register} placeholder="2024" />
                      <Field label="Link" name={`certifications.${index}.url`} register={register} placeholder="https://..." />
                    </div>
                  </fieldset>
                ))}
                <div className="flex flex-wrap gap-3"><button className="outline-action" type="button" onClick={() => projects.append({ ...emptyProject, id: `project-${projects.fields.length + 1}` })}>+ Add project</button><button className="outline-action" type="button" onClick={() => certifications.append({ ...emptyCertification, id: `certification-${certifications.fields.length + 1}` })}>+ Add certification</button></div>
                {!projects.fields.length && !certifications.fields.length ? <p className="profile-help">Optional means optional. You can save now and add these later.</p> : null}
              </div>
            ) : null}

            {message ? <p className="auth-message auth-notice mt-6" role="status">{message}</p> : null}
            {errorMessage ? <p className="auth-message auth-error mt-6" role="alert">{errorMessage}</p> : null}
            <div className="profile-actions">
              {step > 0 ? <button key="back" className="button-quiet" type="button" onClick={goBack}>← Back</button> : <Link className="button-quiet" href="/dashboard">Save later</Link>}
              {step < stepNames.length - 1 ? (
                <button key="continue" className="button-primary" type="button" onClick={goNext}>Continue <span aria-hidden="true">→</span></button>
              ) : (
                <button key="save" className="button-primary" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save profile"} <span aria-hidden="true">↗</span></button>
              )}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
