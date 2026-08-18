import type { Metadata } from "next";
import { ResumeEditor } from "@/components/resumes/resume-editor";

export const metadata: Metadata = {
  title: "Edit resume | Resume Builder",
};

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResumeEditor id={id} />;
}
