"use client";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import type { ResumeContentInput } from "@/lib/resume/schema";

type BulletsPath =
  | `experience.${number}.bullets`
  | `leadership.${number}.bullets`
  | `research.${number}.bullets`;

export function HighlightsField({
  label,
  path,
  rows = 4,
  placeholder,
  watch,
  setValue,
}: {
  label: string;
  path: BulletsPath;
  rows?: number;
  placeholder?: string;
  watch: UseFormWatch<ResumeContentInput>;
  setValue: UseFormSetValue<ResumeContentInput>;
}) {
  const bullets = (watch(path) as string[] | undefined) ?? [];

  return (
    <label className="profile-field profile-field-wide">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={bullets.join("\n")}
        placeholder={placeholder ?? "One highlight per line..."}
        onChange={(event) => {
          const lines = event.target.value.split("\n");
          setValue(path, lines as ResumeContentInput["experience"][number]["bullets"], {
            shouldDirty: true,
          });
        }}
      />
    </label>
  );
}
