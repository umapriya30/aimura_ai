# Aimura AI Development Tasks

## Requirements Summary

Aimura AI is a career-connected education pathway reasoning agent. It should help students decide what to study, where to study, and how to become employable afterward by combining academic history, subject interests, career ambitions, budget constraints, country preferences, and dream-company goals into one personalised pathway report.

The core problem is that existing guidance is usually generic: rankings are not personalised, career outcomes are disconnected from degree choice, budget and visa constraints are often ignored, and students discover skill or employability gaps too late. Aimura AI solves this with student-specific fit scores, country trade-off analysis, realistic career ladders, and an honest risk section explaining why a path may not fit.

The current architecture has four product layers: a Next.js guided intake, a deterministic Student OS engine with CSV/live-public-signal grounding, a Foundry IQ reasoning layer using Azure AI Foundry-compatible deployments, and a polished report dashboard with mentor chat. The legacy Python pipeline remains in the repo as a tested verification and prompt-contract layer.

Key features include a 27-question student intake flow, five curated CSV knowledge base files, live public signals, relevance filtering before prompt injection, skill-readiness scoring, country-aware university matches, portfolio guidance, a 24-week roadmap, a 12-week detailed timetable, a live AI mentor, external-link confirmation, and a mandatory safety disclaimer on every report.

Microsoft IQ integration is implemented through Foundry IQ / Azure AI Foundry. Aimura AI calls a configured chat deployment with `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, and `AZURE_DEPLOYMENT_NAME`, uses Foundry IQ as the primary provider for career intelligence and mentor chat, and falls back to deterministic guidance so the demo remains reliable without exposing secrets.

Why it matters: Aimura AI is not just a university finder. It explains why a path is suitable, what risks exist, and how a student can become job-ready during university, while clearly stating that it cannot guarantee admissions, visas, scholarships, salaries, or jobs and that users must verify official requirements.

## Task List

1. ✅ Recover the project documentation into `docs/aimura-ai-full-documentation.md` and capture the implementation summary in this task file.
2. ✅ Set up the original Streamlit/Python project skeleton, dependencies, environment template, and ignored local files.
3. ✅ Create the five placeholder CSV knowledge base files described in the documentation.
4. ✅ Implement weighted field-fit scoring logic with focused tests.
5. ✅ Implement knowledge base loading and relevance filtering with focused tests.
6. ✅ Build the Foundry IQ prompt builder with the 10-step reasoning chain, JSON contract, safety notices, and month-by-month roadmap instructions.
7. ✅ Implement the Azure AI Foundry agent client with structured JSON parsing and a deterministic offline fallback.
8. ✅ Build the original Streamlit student profile intake form across academic, interests, career, and practical constraints.
9. ✅ Build the original Streamlit pathway report dashboard with fit bars, country comparison, university tiers, roadmap expanders, and safety notices.
10. ✅ Wire the full local pipeline from intake to scoring, retrieval, prompt construction, agent response, and report rendering.
11. ✅ Add demo student profiles and lightweight local verification fixtures.
12. ✅ Write the README with setup, Microsoft IQ integration, safety limitations, and hackathon demo guidance.
13. ✅ Run final verification and update this checklist so every completed task is marked.

## Agents League Submission Readiness

1. ✅ Track and positioning documented as Reasoning Agents.
2. ✅ Microsoft IQ requirement documented as Foundry IQ via Azure AI Foundry.
3. ✅ Generated report now shows a Microsoft IQ proof card and current reasoning source.
4. ✅ README includes the hackathon submission checklist and no-confidential-data warning.
5. ✅ `docs/aimura-ai-full-documentation.md` updated from the older Streamlit blueprint to the current Next.js architecture.
6. ✅ `.env` and `data/app-database.json` confirmed ignored.
7. ✅ Verification passed: `npx tsc --noEmit`, `npm run build`, and `python -m pytest`.

## SaaS Interface Redesign Tasks

1. ✅ Produce the high-level design plan and save the Dribbble-inspired concept reference.
2. ✅ Set up a Next.js + TailwindCSS app structure alongside the existing Python backend artifacts.
3. ✅ Define Tailwind theme tokens for the dark B2B SaaS palette and typography.
4. ✅ Create shared frontend data models and static demo report data.
5. ✅ Implement `HeroSection` with value proposition, CTA buttons, and product preview.
6. ✅ Implement `MultiStepForm` with four steps, progress indicator, Back/Next controls, and Generate Report action.
7. ✅ Implement responsive report navigation for Student Summary, Top Fields, Countries, Exams, Universities, Dream Role Check, Roadmap, and Action Plan.
8. ✅ Implement reusable interactive `ReportCard` components with icons and View details toggles.
9. ✅ Build the full report dashboard using interactive cards and section navigation.
10. ✅ Add Download PDF, Save Session, and Share via Email action buttons with local UI feedback.
11. ✅ Wire page-level interactions and responsive behavior.
12. ✅ Update launcher/docs to run the new Next.js interface.
13. ✅ Verify desktop/mobile UI against the concept reference and commit final fixes.
