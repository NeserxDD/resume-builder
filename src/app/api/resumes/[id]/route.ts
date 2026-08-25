import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { attachSelection, resumePatchSchema, splitSelection } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const { content, selection } = splitSelection(resume.content);

  return NextResponse.json({
    resume: {
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      content,
      selection,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = resumePatchSchema.safeParse(await request.json());
  if (!result.success || !Object.keys(result.data).length) {
    return NextResponse.json({ error: "Resume details are not valid." }, { status: 400 });
  }

  const existing = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const { content, selection: existingSelection } = splitSelection(existing.content);
  const nextContent = result.data.content ?? content;
  const nextSelection = result.data.selection ?? existingSelection;
  const payload = result.data.content || result.data.selection
    ? attachSelection(nextContent, nextSelection)
    : undefined;

  const resume = await prisma.resume.update({
    where: { id: existing.id },
    data: {
      ...(result.data.title ? { title: result.data.title } : {}),
      ...(result.data.templateId ? { templateId: result.data.templateId } : {}),
      ...(payload ? { content: payload } : {}),
    },
    select: { id: true, title: true, templateId: true, updatedAt: true },
  });

  return NextResponse.json({ resume });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  await prisma.resume.delete({ where: { id: existing.id } });
  return new NextResponse(null, { status: 204 });
}