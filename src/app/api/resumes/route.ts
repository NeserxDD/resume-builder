import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { normalizeContent, resumeRequestSchema } from "@/lib/resume/schema";
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

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      templateId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = resumeRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Resume details are not valid." }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Create your profile before making a resume." }, { status: 400 });
  }

  let content = {
    personalInfo: profile.personalInfo,
    summary: profile.summary ?? "",
    experience: profile.experience,
    education: profile.education,
    skills: profile.skills,
    projects: profile.projects,
    certifications: profile.certifications,
  } as ResumeContentInput;

  if (result.data.sourceId) {
    const source = await prisma.resume.findFirst({
      where: { id: result.data.sourceId, userId: user.id },
      select: { content: true },
    });

    if (!source) return NextResponse.json({ error: "Source resume not found." }, { status: 404 });
    content = normalizeContent(source.content as ResumeContentInput);
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: result.data.title,
      templateId: result.data.templateId,
      content: normalizeContent(content),
    },
    select: { id: true, title: true, templateId: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
