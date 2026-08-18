import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { normalizeContent, resumeContentSchema } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function GET() {
  const user = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: normalizeContent({
      personalInfo: profile.personalInfo,
      summary: profile.summary ?? "",
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
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

  const content = result.data;

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id },
    update: {},
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...content,
    },
    update: {
      ...content,
    },
  });

  return NextResponse.json({ profile }, { status: 200 });
}
