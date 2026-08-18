import type { Metadata } from "next";

import { ResumeCreator } from "@/components/dashboard/resume-creator";

export const metadata: Metadata = {
  title: "New resume | Resume Builder",
};

export default function NewResumePage() {
  return <ResumeCreator />;
}
