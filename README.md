# Aimura AI

**Plan your study path. Build your career path.**

Aimura AI is a career-connected student success OS. It turns a student's
profile — background, dream role, skills, budget, and country preferences —
into an explainable education-to-career roadmap with career intelligence,
an honest skill score, university signals, a week-by-week timetable, and a
live AI mentor.

## Premium Career OS interface

The Next.js app has been redesigned into a premium dark SaaS-style Career
Operating System rather than a repeated-card report page:

- Central theme tokens in `src/app/globals.css` plus a category accent map in
  `src/lib/category-theme.ts`.
- Category identities across the product: My Plan, Career Fit, Learn, Build
  Proof, Study Options, Weekly Plan, and Mentor each has its own accent,
  icon treatment, header tone, CTA language, hover state, and status styling.
- Authenticated workspace shell with a compact top nav, activity status, and
  responsive layout.
- Upgraded 7-step intake with accent-aware progress, completed-section
  tracking, helper copy, validation, loading/success/error states, and demo
  profile loading without replacing real dynamic user input.
- Generated report preview with metric cards for Skill Score, Target Role,
  Timeline, Top Gaps, and Next Action.
- Premium module navigator with sticky desktop behavior, mobile tabs/dropdown,
  status indicators, progress rails, active glow, and category-colored icons.
- My Plan dashboard now combines a cleaner career journey chart, insight
  cards, and one clear action path: Continue Weekly Plan or Ask AI Mentor.
- Weekly Plan is a timeline/stepper with phase details, skills, evidence,
  Start Phase, Mark Done, Add to Calendar, and Ask Mentor actions.
- AI Decision Logic replaces the old reasoning block with expandable numbered
  reasoning steps covering input signals, scoring, market intelligence,
  recommendation, and safety.
- Export actions include guarded loading states, duplicate-click prevention,
  toast feedback, local session save, print-to-PDF, and email share draft.

> **Agents League @ AISF 2026 — Track: 🧠 Reasoning Agents**
> **Microsoft IQ integration: Foundry IQ (Azure AI Foundry)** powers the
> mentor and the career-intelligence reasoning, with a resilient fallback
> chain and a deterministic offline engine.

---

## Why this is a reasoning agent

Aimura runs a multi-step reasoning pipeline over each student's structured
intake, not a single prompt:

```text
27-question structured intake (7 sections)
  -> 1. Normalize the goal into a career domain, target roles, required skills
  -> 2. Gather live public signals (Wikipedia, OpenAlex, GitHub) + registries
  -> 3. Score the profile honestly (coverage + evidence) and surface gaps
  -> 4. Reason with Foundry IQ to produce career intelligence:
        job-market status, salary outlook, risk strategy, fallback options,
        and a 12-week timetable grounded in the student's real profile
  -> 5. Build a staged roadmap, portfolio plan, and university matches
  -> 6. Answer follow-ups in a live mentor chat grounded in the report
```

Each step feeds the next, and every output is traceable back to the
student's answers.

## Microsoft Foundry IQ integration

The reasoning layer is provider-abstracted in
[`src/lib/ai-provider.ts`](src/lib/ai-provider.ts). The chain is:

1. **Microsoft Foundry IQ (Azure AI Foundry)** — primary reasoning for the
   mentor (`src/app/api/mentor/route.ts`) and career intelligence
   (`src/lib/intelligence.ts`).
2. Fallback reasoning providers (used only if Foundry is unavailable).
3. **Deterministic offline engine** — grounded, profile-specific output so
   the product never breaks during a demo.

When Foundry IQ is active, the UI shows it live: the mentor displays
"Powered by Microsoft Foundry IQ" and the Career Intelligence tab shows
"Grounded with Microsoft Foundry IQ".

## Agents League submission checklist

- **Track selected:** Reasoning Agents.
- **Required Microsoft IQ layer:** Foundry IQ via Azure AI Foundry.
- **Where judges can see it:** login landing, generated report overview,
  Career Intelligence tab, and AI Mentor status label.
- **Public-repo readiness:** `.env` and `data/app-database.json` are
  gitignored; use only neutral or synthetic student profiles in demos.
- **Safety posture:** no admission, visa, scholarship, salary, or job
  guarantees; every report asks students to verify official sources.
- **Demo flow:** create a local account, complete the guided intake, generate
  the Student OS, show the Microsoft IQ proof card, ask the AI Mentor "What
  should I do this week?", and demonstrate the external-link confirmation.
- **Deadline from the brief:** submit before June 14, 2026.

Full technical and submission notes live in
[`docs/aimura-ai-full-documentation.md`](docs/aimura-ai-full-documentation.md).

Official references:

- [Agents League Hack @ AI Skills Fest - Microsoft Reactor](https://developer.microsoft.com/en-us/reactor/series/s-1658/)
- [Microsoft IQ requirement example - Microsoft 365 Developer Blog](https://devblogs.microsoft.com/microsoft365dev/agents-league-hackathon-2026-enterprise-agents/)

### Configure Foundry IQ

1. In the [Azure AI Foundry portal](https://ai.azure.com), create a project
   and deploy a chat model (e.g. `gpt-4o-mini`).
2. Copy `.env.example` to `.env` and fill in:

   ```bash
   AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
   AZURE_OPENAI_KEY=YOUR_KEY
   AZURE_DEPLOYMENT_NAME=gpt-4o-mini
   AZURE_OPENAI_API_VERSION=2024-10-21
   ```

3. Restart the app. The mentor and career intelligence now reason on
   Foundry IQ.

## Reliability & safety

- **Resilient provider chain** — Foundry IQ → fallback providers → offline.
  A missing key, rate limit, or exhausted credit is skipped automatically;
  the app keeps working.
- **External-link confirmation** — every outbound link (universities,
  courses, repositories) opens a confirmation dialog showing the exact
  destination before the user leaves the app
  ([`src/components/LinkGuard.tsx`](src/components/LinkGuard.tsx)).
- **Honest framing** — Aimura provides guidance, not guarantees, and every
  report carries a safety note to verify admissions, visa, scholarship,
  cost, and employment details with official providers.
- **No secrets in the repo** — `.env` is gitignored; only `.env.example`
  placeholders are committed.

## Run it — one command, any device

### macOS
Double-click `open_aimura_ai.command` (or run `./open_aimura_ai.command`).

### Windows / PC
Double-click `open_aimura_windows.bat`.

Both launchers install dependencies on first run, start the app, open the
browser, and **print a phone URL** so a mobile device on the same Wi-Fi can
open it too:

```text
On this computer : http://localhost:3000
On your phone    : http://<your-LAN-IP>:3000
```

### Manual launch

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
# open http://localhost:3000
```

## Share it so friends can test in their browser

Two ways to let anyone, anywhere, open Aimura AI in their browser:

**1. Instant public link (no account, no deploy).** Double-click
`share_aimura.command` (macOS) or `share_aimura_windows.bat` (Windows). It starts
the app and prints a temporary `https://…` link — send that to friends and they
can use it on any device. Keep the window open while they test; press `Ctrl+C` to
stop sharing.

**2. Always-on link (free hosting).** The app is deploy-safe: if the host's
filesystem is read-only it keeps running in memory, so the full flow (intake →
report → mentor) works without login. Push this repo to GitHub and import it on
[Vercel](https://vercel.com/new) (framework auto-detected as Next.js) to get a
permanent public URL.

## Project structure

```text
src/
|-- app/
|   |-- api/
|   |   |-- auth/            # local signup/login
|   |   |-- insights/       # builds the report + Foundry IQ enrichment
|   |   `-- mentor/          # streaming mentor (Foundry IQ -> fallback -> offline)
|   |-- layout.tsx          # wraps the app in the external-link guard
|   `-- page.tsx            # gated login -> authenticated workspace
|-- components/             # login landing, 27-question intake, dashboard, mentor
|   |-- PremiumUI.tsx       # AppShell, cards, metrics, toast, progress, actions
|   |-- ModuleSidebar.tsx   # responsive accent-coded report navigator
|   |-- RoadmapTimeline.tsx # weekly plan timeline/stepper
|   |-- ReasoningPanel.tsx  # expandable AI decision logic trace
|   `-- ExportActions.tsx   # PDF/save/email states and toasts
`-- lib/
    |-- category-theme.ts   # central category accent mapping
    |-- ai-provider.ts      # Foundry IQ + fallback reasoning chain
    |-- intelligence.ts     # career intelligence (Foundry IQ + offline)
    |-- student-os-engine.ts# deterministic domain/skill/roadmap engine
    `-- app-data-store.ts   # local JSON account + report storage
```

## Data storage

Accounts and saved reports use local JSON storage at
`data/app-database.json` (gitignored). This keeps a GitHub-download demo
portable without a database server. Upgrade paths: SQLite, Supabase
Postgres, Firebase, or Neon.

## Verification

```bash
npx tsc --noEmit
npm run build
```

## Safety limits

Aimura AI provides educational and career guidance. It does not guarantee
university admission, visa approval, scholarships, salaries, or job offers.
Students must verify official requirements directly with universities, visa
authorities, scholarship providers, and employers.
