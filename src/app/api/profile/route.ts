import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { emptyResumeContent, normalizeContent, resumeContentSchema } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function coreSections(content: ResumeContentInput) {
  return {
    personalInfo: content.personalInfo,
    summary: content.summary,
    experience: content.experience,
    education: content.education,
    skills: content.skills,
    skillGroups: content.skillGroups,
    projects: content.projects,
    certifications: content.certifications,
  };
}

export async function GET() {
  const user = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: normalizeContent({
      ...emptyResumeContent(),
      personalInfo: profile.personalInfo,
      summary: profile.summary ?? "",
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      skillGroups: profile.skillGroups ?? [],
      projects: profile.projects,
      certifications: profile.certifications,
    } as ResumeContentInput),
  });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = resumeContentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "The profile information is not valid.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const stored = coreSections(result.data);

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id },
    update: {},
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...stored,
    },
    update: {
      ...stored,
    },
  });

  return NextResponse.json({ profile }, { status: 200 });
}