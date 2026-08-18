import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create an account | Resume Builder",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
