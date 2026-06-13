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
};

type AuthMode = "signup" | "login";

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

export function LoginLanding({ onAuthSuccess }: LoginLandingProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("Create your free account to save every roadmap you generate.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(mode === "signup" ? "Creating your account..." : "Signing you in...");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? form : { email: form.email, password: form.password },
        ),
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok || !data.success || !data.user || !data.token) {
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

      <section className="mx-auto grid max-w-7xl items-start gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-control border border-aimura-green/30 bg-aimura-green/10 px-4 py-2 text-xs font-medium text-aimura-green">
              <Sparkles className="size-4" aria-hidden />
              Your career-connected student success OS
            </div>
            <div className="inline-flex items-center gap-2 rounded-control border border-aimura-moss/40 bg-aimura-panel/70 px-4 py-2 text-xs font-medium text-aimura-muted">
              Built on Microsoft Foundry IQ
            </div>
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-aimura-white sm:text-6xl">
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

        <div className="aimura-card rounded-[2rem] p-6 sm:p-7">
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

            <button
              className="aimura-focus-ring aimura-green-glow mt-5 inline-flex w-full items-center justify-center gap-2 rounded-control bg-aimura-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-aimura-mint disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account & enter" : "Log in & enter"}
              {!isSubmitting ? <ArrowRight className="size-4" aria-hidden /> : null}
            </button>
            <p className="mt-4 text-sm leading-6 text-aimura-muted">{message}</p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <div className="aimura-card rounded-[2rem] p-6 sm:p-8">
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

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">What you can do here</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-aimura-white sm:text-4xl">
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

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="aimura-card rounded-[2rem] p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">Your best first moves once you log in</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-aimura-white sm:text-4xl">
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
