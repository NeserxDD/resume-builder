import type { Metadata } from "next";

import { ProfileWizard } from "@/components/profile/profile-wizard";

export const metadata: Metadata = {
  title: "Your profile | Resume Builder",
};

export default function ProfilePage() {
  return <ProfileWizard />;
}
