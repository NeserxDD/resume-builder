"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Pick up where you left off.",
    description: "Sign in to keep your profile and resumes in one place.",
    submit: "Sign in",
    switchPrompt: "New here?",
    switchLabel: "Create an account",
    switchHref: "/auth/signup",
  },
  signup: {
    eyebrow: "Start with the good part",
    title: "Make your work easier to see.",
    description: "Create one profile, then shape it for every opportunity.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/auth/login",
  },
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const content = copy[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setIsLoading(true);

    const supabase = createClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

    setIsLoading(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setNotice("Check your email to confirm your account, then come back here.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setNotice("");
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-frame">
        <Link className="auth-back" href="/">
          <span aria-hidden="true">←</span> Resume / Builder
        </Link>
        <div className="auth-layout">
          <section className="auth-intro">
            <p className="eyebrow">
              <span className="text-[var(--signal)]">rb</span>
              {content.eyebrow}
            </p>
            <h1 className="display-text mt-8 text-5xl leading-[0.95] tracking-[-0.065em] sm:text-7xl">
              {content.title}
            </h1>
            <p className="mt-7 max-w-sm text-base leading-7 text-[var(--ink-muted)]">
              {content.description}
            </p>
            <div className="auth-note">
              <span className="status-dot" aria-hidden="true" />
              Your content stays yours.
            </div>
          </section>

          <section className="auth-card" aria-label={mode === "login" ? "Sign in" : "Create an account"}>
            <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
              <span className="google-mark" aria-hidden="true">G</span>
              Continue with Google
            </button>
            <div className="auth-divider">
              <span>or use email</span>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-label" htmlFor="email">
                Email address
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label className="auth-label" htmlFor="password">
                Password
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>
              {errorMessage ? <p className="auth-message auth-error" role="alert">{errorMessage}</p> : null}
              {notice ? <p className="auth-message auth-notice" role="status">{notice}</p> : null}
              <button className="button-primary auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Working..." : content.submit}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
            <p className="auth-switch">
              {content.switchPrompt}{" "}
              <a href={content.switchHref}>{content.switchLabel}</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
