"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Compass,
  FolderGit2,
  Gauge,
  GraduationCap,
  MessageSquare,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JourneyChart, DEMO_JOURNEY } from "@/components/JourneyChart";
import { type AuthResponse, type AuthUser } from "@/lib/student-os-types";

type LoginLandingProps = {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  initialMode?: AuthMode;
};

type AuthMode = "signup" | "login" | "forgot";

const capabilities = [
  {
    icon: MessageSquare,
    title: "Live AI Mentor",
    description: "Chat with a mentor that reasons over your real profile — what to learn first, how to plan your week, and how to close your gaps.",
  },
  {
    icon: Compass,
    title: "Career Intelligence",
    description: "Your free-text goal is normalized into a career domain, target roles, and the exact skills employers expect.",
  },
  {
    icon: Route,
    title: "24-Week Roadmap",
    description: "A staged, month-by-month plan from foundations to portfolio evidence to interview readiness.",
  },
  {
    icon: FolderGit2,
    title: "Proof Builder",
    description: "Portfolio, clinical, creative, research, or technical proof tailored to your target role.",
  },
  {
    icon: GraduationCap,
    title: "University Signals",
    description: "Country-aware program matches with official-site links so you can verify fees, requirements, and deadlines.",
  },
  {
    icon: Gauge,
    title: "Skill Score & Gaps",
    description: "An honest score out of 100 that highlights the missing skills holding your profile back.",
  },
];

const firstMoves = [
  {
    title: "Complete the 2-minute intake",
    description: "Share your background, dream role, skills, budget, and preferred countries in four short steps.",
  },
  {
    title: "Generate your Student OS",
    description: "Aimura builds your career map, skill score, learning hub, roadmap, and portfolio plan instantly.",
  },
  {
    title: "Chat with your AI mentor",
    description: "Ask for your best next move this week and let the mentor reason over your real profile.",
  },
  {
    title: "Follow the weekly roadmap",
    description: "Create one field-relevant proof item, document progress, and watch your skill score climb.",
  },
];

export function LoginLanding({ onAuthSuccess, initialMode = "signup" }: LoginLandingProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("Create your free account to save every roadmap you generate.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationLink, setActivationLink] = useState("");
  const [resetLink, setResetLink] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setActivationLink("");
    setResetLink("");
    setMessage(mode === "signup" ? "Creating your account..." : mode === "forgot" ? "Preparing reset link..." : "Signing you in...");

    try {
      const endpoint = mode === "forgot" ? "/api/auth/forgot-password" : `/api/auth/${mode}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? form
            : mode === "forgot"
              ? { email: form.email }
              : { email: form.email, password: form.password },
        ),
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (mode === "signup") {
        setActivationLink(data.activationLink || "");
        setMessage(data.message || "Account created. Activate your Aimura profile with the local link before signing in.");
        return;
      }

      if (mode === "forgot") {
        setResetLink(data.resetLink || "");
        setMessage(data.message || "If the email exists, a reset link has been prepared.");
        return;
      }

      if (!data.user || !data.token) {
        throw new Error(data.message || "Authentication failed.");
      }
      onAuthSuccess(data.user, data.token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="aimura-shell min-h-screen text-aimura-white">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between gap-4">
          <span className="text-xl font-semibold tracking-tight text-aimura-white">Aimura AI</span>
          <span className="hidden rounded-control border border-aimura-moss/40 bg-aimura-panel/70 px-4 py-2 text-xs text-aimura-muted sm:inline-flex">
            Plan your study path. Build your career path.
          </span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 pb-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-aimura-green/30 bg-aimura-green/10 px-3 py-2 text-xs font-medium text-aimura-green sm:rounded-control sm:px-4">
              <Sparkles className="size-4" aria-hidden />
              <span className="min-w-0 break-words">Your career-connected student success OS</span>
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-aimura-moss/40 bg-aimura-panel/70 px-3 py-2 text-xs font-medium text-aimura-muted sm:rounded-control sm:px-4">
              Built on Microsoft Foundry IQ
            </div>
          </div>
          <h1 className="mt-6 break-words text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-aimura-white sm:text-6xl sm:leading-[0.96] sm:tracking-[-0.05em]">
            Plan your study path. Build your career path.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-aimura-muted sm:text-lg">
            Aimura turns your background, dream role, skills, budget, and country
            preferences into one explainable roadmap — with a live AI mentor,
            honest skill scoring, and a month-by-month plan. Sign in to get started.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {["Live AI mentor", "Honest skill score", "24-week roadmap", "Works offline"].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 rounded-control border border-aimura-moss/30 bg-aimura-panel/70 px-4 py-2 text-aimura-muted"
              >
                <Check className="size-4 text-aimura-green" aria-hidden />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="aimura-card min-w-0 rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-7">
          <div className="mb-5 flex rounded-control border border-aimura-moss/35 bg-aimura-panel-2 p-1">
            <button
              className={`flex-1 rounded-control px-4 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-aimura-green text-white" : "text-aimura-muted"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Create account
            </button>
            <button
              className={`flex-1 rounded-control px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-aimura-green text-white" : "text-aimura-muted"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Log in
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === "signup" ? (
              <label className="mb-4 block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
                <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Name</span>
                <input
                  className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none placeholder:text-aimura-moss"
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Enter your name"
                  required
                  value={form.name}
                />
              </label>
            ) : null}

            <label className="mb-4 block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Email</span>
              <input
                className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none placeholder:text-aimura-moss"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            {mode !== "forgot" ? (
            <label className="block rounded-2xl border border-aimura-moss/25 bg-aimura-panel-2 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-aimura-muted">Password</span>
              <input
                className="aimura-focus-ring mt-2 w-full border-0 bg-transparent text-sm font-medium text-aimura-white outline-none placeholder:text-aimura-moss"
                minLength={8}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
                required
                type="password"
                value={form.password}
              />
            </label>
            ) : null}

            <button
              className="aimura-focus-ring aimura-green-glow mt-5 inline-flex w-full items-center justify-center gap-2 rounded-control bg-aimura-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-aimura-mint disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in & enter"}
              {!isSubmitting ? <ArrowRight className="size-4" aria-hidden /> : null}
            </button>
            {mode === "login" ? (
              <button
                className="aimura-focus-ring mt-3 w-full rounded-control border border-aimura-moss/40 px-5 py-2.5 text-sm font-semibold text-aimura-muted transition hover:border-aimura-green/50 hover:text-aimura-white"
                onClick={() => {
                  setMode("forgot");
                  setMessage("Enter your email and Aimura will prepare a password reset link.");
                }}
                type="button"
              >
                Forgot password?
              </button>
            ) : null}
            {mode === "forgot" ? (
              <button
                className="aimura-focus-ring mt-3 w-full rounded-control border border-aimura-moss/40 px-5 py-2.5 text-sm font-semibold text-aimura-muted transition hover:border-aimura-green/50 hover:text-aimura-white"
                onClick={() => {
                  setMode("login");
                  setMessage("Log in after activating your profile or resetting your password.");
                }}
                type="button"
              >
                Back to login
              </button>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-aimura-muted">{message}</p>
            {activationLink ? (
              <div className="mt-4 rounded-2xl border border-aimura-green/30 bg-aimura-green/10 p-4 text-sm leading-6 text-aimura-muted">
                <p className="font-semibold text-aimura-white">Activation required before login.</p>
                <p className="mt-1">For this demo, activate your profile directly inside the app. No domain or email provider is needed.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="rounded-control bg-aimura-green px-4 py-2 text-sm font-semibold text-aimura-black" href={activationLink}>
                    Activate profile
                  </a>
                </div>
              </div>
            ) : null}
            {resetLink ? (
              <div className="mt-4 rounded-2xl border border-aimura-blue/30 bg-aimura-blue/10 p-4 text-sm leading-6 text-aimura-muted">
                <p className="font-semibold text-aimura-white">Password reset link prepared.</p>
                <p className="mt-1">Use the local reset link below. No email provider is needed for the demo.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="rounded-control bg-aimura-blue px-4 py-2 text-sm font-semibold text-aimura-black" href={resetLink}>
                    Reset password
                  </a>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-12">
        <div className="aimura-card rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">See your journey before you start</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-aimura-white sm:text-3xl">
                Every plan becomes a clear, visual roadmap.
              </h2>
            </div>
            <span className="rounded-control border border-aimura-green/30 bg-aimura-green/10 px-4 py-2 text-xs font-medium text-aimura-green">
              Live demo
            </span>
          </div>
          <JourneyChart
            segments={DEMO_JOURNEY.segments}
            centerLabel={DEMO_JOURNEY.centerLabel}
            centerSub={DEMO_JOURNEY.centerSub}
            size={250}
            caption="This is a sample. After your intake, Aimura builds this chart from your real roadmap — so you can see exactly how your months map to becoming job-ready."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-aimura-green sm:tracking-[0.28em]">What you can do here</p>
        <h2 className="mt-3 max-w-2xl break-words text-3xl font-semibold tracking-[-0.03em] text-aimura-white sm:text-4xl">
          Everything a student needs to go from goal to offer.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((capability) => (
            <div className="aimura-card rounded-[1.5rem] p-5" key={capability.title}>
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-aimura-green/30 bg-aimura-green/10 text-aimura-green">
                <capability.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-aimura-white">{capability.title}</h3>
              <p className="mt-2 text-sm leading-6 text-aimura-muted">{capability.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12">
        <div className="aimura-card rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-aimura-green sm:tracking-[0.28em]">Your best first moves once you log in</p>
          <h2 className="mt-3 max-w-2xl break-words text-3xl font-semibold tracking-[-0.03em] text-aimura-white sm:text-4xl">
            Four steps to your first roadmap.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {firstMoves.map((move, index) => (
              <div className="rounded-[1.25rem] border border-aimura-moss/25 bg-aimura-panel-2 p-5" key={move.title}>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-aimura-green text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-aimura-white">{move.title}</h3>
                <p className="mt-2 text-sm leading-6 text-aimura-muted">{move.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-aimura-moss/25 bg-aimura-panel-2 p-5 text-sm leading-6 text-aimura-muted sm:flex-row sm:items-center">
          <ShieldCheck className="size-5 shrink-0 text-aimura-green" aria-hidden />
          <span>
            <span className="font-semibold text-aimura-white">Safety note: </span>
            Aimura AI provides educational and career guidance, not guarantees. Verify
            admissions, visa, scholarship, cost, university, and employment details with
            official providers.
          </span>
        </div>
      </footer>
    </main>
  );
}
