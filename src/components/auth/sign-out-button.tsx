"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button className="auth-back" type="button" onClick={handleSignOut}>
      Sign out <span aria-hidden="true">↗</span>
    </button>
  );
}
