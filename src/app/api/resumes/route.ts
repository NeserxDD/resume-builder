import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  attachSelection,
  emptyResumeContent,
  filterContentBySelection,
  normalizeContent,
  resumeRequestSchema,
  splitSelection,
} from "@/lib/resume/schema";
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

  let selection = result.data.selection;

  let content: ResumeContentInput = emptyResumeContent();

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (profile) {
    content = normalizeContent({
      ...emptyResumeContent(),
      personalInfo: profile.personalInfo,
      summary: profile.summary ?? "",
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      skillGroups: profile.skillGroups ?? [],
      projects: profile.projects,
      certifications: profile.certifications,
    } as ResumeContentInput);
  }

  if (result.data.sourceId) {
    const source = await prisma.resume.findFirst({
      where: { id: result.data.sourceId, userId: user.id },
      select: { content: true },
    });

    if (!source) return NextResponse.json({ error: "Source resume not found." }, { status: 404 });
    const split = splitSelection(source.content);
    content = split.content;
    if (!selection) selection = split.selection;
  }

  if (selection) content = filterContentBySelection(content, selection);

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: result.data.title,
      templateId: result.data.templateId,
      content: attachSelection(content, selection),
    },
    select: { id: true, title: true, templateId: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}