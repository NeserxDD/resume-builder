import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { ResumePdfDocument } from "@/components/templates/resume-pdf";
import { prisma } from "@/lib/db/prisma";
import { splitSelection } from "@/lib/resume/schema";
import { getTemplateMeta } from "@/lib/templates/registry";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_PHOTO_CHARS = 5_000_000;

async function renderResume(id: string, userId: string, photoDataUrl?: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId } });
  if (!resume) return null;

  const { content, selection } = splitSelection(resume.content);
  const supportsPhoto = getTemplateMeta(resume.templateId).supportsPhoto;
  const photoUrl = supportsPhoto && photoDataUrl ? photoDataUrl : undefined;

  const pdf = await renderToBuffer(
    <ResumePdfDocument content={content} templateId={resume.templateId} selection={selection} photoUrl={photoUrl} />,
  );
  return { pdf, title: resume.title };
}

function pdfResponse(pdf: Buffer, title: string) {
  const safeName = (title || "resume").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await renderResume(id, data.user.id);
  if (!result) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  return pdfResponse(Buffer.from(result.pdf), result.title);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let photoDataUrl: string | undefined;
  try {
    const text = await request.text();
    if (text) {
      const parsed = JSON.parse(text) as { photoDataUrl?: unknown };
      if (
        typeof parsed.photoDataUrl === "string" &&
        parsed.photoDataUrl.startsWith("data:image/") &&
        parsed.photoDataUrl.length <= MAX_PHOTO_CHARS
      ) {
        photoDataUrl = parsed.photoDataUrl;
      }
    }
  } catch {
    photoDataUrl = undefined;
  }

  const { id } = await params;
  const result = await renderResume(id, data.user.id, photoDataUrl);
  if (!result) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  return pdfResponse(Buffer.from(result.pdf), result.title);
}
