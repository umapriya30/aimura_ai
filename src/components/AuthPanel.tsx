"use client";

import { useState } from "react";
import { type AuthResponse, type AuthUser } from "@/lib/student-os-types";

type AuthPanelProps = {
  sessionUser: AuthUser | null;
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onLogout: () => void;
};

type AuthMode = "signup" | "login";

export function AuthPanel({ sessionUser, onAuthSuccess, onLogout }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("Create a local Aimura AI account to save generated roadmaps.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(mode === "signup" ? "Creating your local account..." : "Signing you in...");

    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? form : { email: form.email, password: form.password }),
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok || !data.success || !data.user || !data.token) {
        throw new Error(data.message || "Authentication failed.");
      }
      onAuthSuccess(data.user, data.token);
      setMessage(`Welcome, ${data.user.name}. Your reports will be stored in the local Aimura AI database.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sessionUser) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12" id="account">
        <div className="aimura-card flex flex-col justify-between gap-5 rounded-[2rem] p-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">Local account</p>
            <h2 className="mt-2 text-2xl font-semibold text-aimura-white">Signed in as {sessionUser.name}</h2>
            <p className="mt-2 text-sm leading-6 text-aimura-muted">
              Generated roadmaps are saved to the local JSON database so the demo works after a GitHub download without paid services.
            </p>
          </div>
          <button
            className="aimura-focus-ring rounded-control border border-aimura-moss/50 px-5 py-3 text-sm font-semibold text-aimura-white transition hover:border-aimura-green"
            onClick={onLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12" id="account">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="aimura-card rounded-[2rem] p-6">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">Login / signup</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-aimura-white">Save every student pathway locally.</h2>
          <p className="mt-4 text-sm leading-7 text-aimura-muted">
            This account layer uses local JSON database storage now. The API structure leaves room for Supabase, Postgres, Firebase, or another hosted database later.
          </p>
        </div>

        <form className="aimura-card rounded-[2rem] p-6" onSubmit={submit}>
          <div className="mb-5 flex rounded-control border border-aimura-moss/35 bg-aimura-panel-2 p-1">
            <button
              className={`flex-1 rounded-control px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-aimura-green text-white" : "text-aimura-muted"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign up
            </button>
            <button
              className={`flex-1 rounded-control px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-aimura-green text-white" : "text-aimura-muted"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Log in
            </button>
          </div>

          {mode === "signup" ? (
            <label className="mb-4 block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Name</span>
              <input
                className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter your name"
                required
                value={form.name}
              />
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Email</span>
              <input
                className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Password</span>
              <input
                className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none"
                minLength={8}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
                required
                type="password"
                value={form.password}
              />
            </label>
          </div>

          <button
            className="aimura-focus-ring aimura-green-glow mt-5 w-full rounded-control bg-aimura-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-aimura-mint disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Please wait..." : mode === "signup" ? "Create local account" : "Log in"}
          </button>
          <p className="mt-4 text-sm leading-6 text-aimura-muted">{message}</p>
        </form>
      </div>
    </section>
  );
}
