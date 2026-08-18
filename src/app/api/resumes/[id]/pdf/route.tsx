import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { ResumePdfDocument } from "@/components/templates/resume-pdf";
import { prisma } from "@/lib/db/prisma";
import { normalizeContent } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import type { ResumeContentInput } from "@/lib/resume/schema";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await prisma.resume.findFirst({ where: { id, userId: data.user.id } });
  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const pdf = await renderToBuffer(<ResumePdfDocument content={normalizeContent(resume.content as ResumeContentInput)} templateId={resume.templateId} />);
  const safeName = (resume.title || "resume").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
