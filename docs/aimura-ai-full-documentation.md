# Aimura AI

Agents League Hackathon 2026 project documentation and technical blueprint.

## 1. Hackathon Positioning

Aimura AI is submitted for the Agents League @ AI Skills Fest 2026 hackathon.

- Track: Reasoning Agents
- Required Microsoft IQ layer: Foundry IQ through Azure AI Foundry
- Product category: career-connected student success agent
- Primary demo story: a student turns their background, dream role, skills, budget, and preferred study countries into an explainable education-to-career plan
- Submission readiness date: June 13, 2026
- Submission deadline in the brief: June 14, 2026

Current official Microsoft materials describe Agents League as a developer challenge with Creative Apps, Reasoning Agents, and Enterprise Agents tracks. Microsoft Reactor describes the Reasoning Agents battle as focused on multi-step reasoning with Microsoft Foundry, and Microsoft's hackathon guidance says submissions must integrate at least one Microsoft IQ intelligence layer.

Official references:

- Microsoft Reactor series: https://developer.microsoft.com/en-us/reactor/series/s-1658/
- Microsoft hackathon IQ requirement example: https://devblogs.microsoft.com/microsoft365dev/agents-league-hackathon-2026-enterprise-agents/

Project choice: Aimura AI uses Foundry IQ, exposed through Azure AI Foundry compatible chat-completions endpoints.

## 2. Product Overview

Aimura AI is a career-connected student success OS. It answers one difficult question:

> What should I study, where should I study, and how do I become employable afterwards?

The product combines:

- a 27-question structured student intake
- career-domain normalization
- skill readiness scoring
- live public learning and university signals
- career intelligence with risk and fallback strategy
- a 24-week roadmap and 12-week tactical timetable
- a portfolio builder
- a live mentor chat grounded in the generated report

Aimura is not a generic university finder. It links education choices to career outcomes, portfolio proof, skill gaps, and practical constraints such as budget, English-test status, scholarship need, and country preference.

## 3. Why This Is a Reasoning Agent

Aimura does not send one prompt and render one generic answer. It runs a staged reasoning pipeline:

1. Normalize the student's free-text goal into a career domain and target roles.
2. Infer required skills for that domain.
3. Compare required skills against current evidence from the student's answers.
4. Retrieve live public signals from free APIs and registries.
5. Calculate an honest skill score.
6. Generate career intelligence with job-market status, salary outlook, risks, mitigations, and fallback options.
7. Build university, resource, portfolio, and roadmap sections.
8. Ground mentor chat responses in the generated report.
9. Add safety disclaimers and external-link confirmation.
10. Fall back to deterministic reasoning when live providers are unavailable.

This creates a traceable chain from student input to recommendation.

## 4. Microsoft IQ Integration

Aimura AI integrates the required Microsoft IQ layer through Foundry IQ / Azure AI Foundry.

### 4.1 Runtime Provider Chain

The provider abstraction lives in `src/lib/ai-provider.ts`.

The chain is:

1. Microsoft Foundry IQ through Azure AI Foundry
2. Optional live fallback providers
3. Deterministic offline engine

Foundry IQ is primary for:

- career-intelligence enrichment in `src/lib/intelligence.ts`
- live mentor chat in `src/app/api/mentor/route.ts`

The app remains demoable without secrets because the deterministic engine produces profile-specific guidance when Azure keys are missing, rate-limited, or unavailable.

### 4.2 Required Environment Variables

Copy `.env.example` to `.env` and set:

```bash
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
AZURE_OPENAI_KEY=YOUR_KEY
AZURE_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-10-21
```

Optional fallback providers are documented in `.env.example`, but they are not required for the hackathon requirement.

### 4.3 Judge-Facing Proof

The app makes the IQ integration visible in the UI:

- Login landing page: "Built on Microsoft Foundry IQ"
- Generated report overview: "Microsoft IQ layer: Foundry IQ (Azure AI Foundry)"
- Generated report overview: current reasoning source
- Career Intelligence tab: "Grounded with Microsoft Foundry IQ" when Foundry generated the output
- Mentor tab: "Powered by Microsoft Foundry IQ" when Foundry streams the answer

When running without Azure keys, the app labels the response as a Foundry IQ-ready offline fallback rather than pretending Foundry was used.

## 5. Current Architecture

Aimura has two layers:

- Current product UI: Next.js, React, Tailwind CSS, local JSON account/report storage
- Legacy verification pipeline: Python modules and tests for scoring, knowledge loading, prompt building, and Azure Foundry client behavior

### 5.1 Frontend and API

```text
src/
|-- app/
|   |-- api/
|   |   |-- auth/            local signup/login
|   |   |-- insights/        builds the report and enriches it with Foundry IQ
|   |   `-- mentor/          streaming mentor: Foundry IQ -> fallback -> offline
|   |-- layout.tsx           wraps the app in the external-link guard
|   `-- page.tsx             authenticated workspace
|-- components/
|   |-- LoginLanding.tsx     account gate and product overview
|   |-- MultiStepForm.tsx    27-question intake
|   |-- ReportDashboard.tsx  generated Student OS report
|   |-- MentorChat.tsx       profile-grounded chat
|   |-- LiveLearningHub.tsx  live learning resources
|   |-- PortfolioBuilder.tsx portfolio guidance
|   `-- LinkGuard.tsx        external-link confirmation
`-- lib/
    |-- ai-provider.ts       Foundry IQ and fallback provider chain
    |-- intelligence.ts      career intelligence JSON enrichment
    |-- student-os-engine.ts deterministic reasoning and data retrieval
    |-- student-os-types.ts  shared report types
    `-- app-data-store.ts    local JSON persistence
```

### 5.2 Legacy Python Verification Assets

The Python files remain valuable for tests and for documenting the original Foundry prompt contract:

- `agent.py`: Azure AI Foundry client plus offline fallback
- `pipeline.py`: scoring, retrieval, prompt, agent, and report assembly
- `prompt_builder.py`: 10-step reasoning prompt contract
- `knowledge_loader.py`: CSV loading and relevance filtering
- `scorer.py`: weighted field-fit scoring
- `tests/`: regression tests for the Python pipeline

## 6. User Journey

1. Student creates a local account or logs in.
2. Student completes seven guided intake sections:
   - Basic Profile
   - Career Goals
   - Interests and Preferences
   - Skills and Experience
   - Study Abroad Preferences
   - Learning Preferences
   - Mentorship and Goal
3. `/api/insights` normalizes the answers and builds a report.
4. The deterministic engine creates a complete baseline Student OS.
5. Foundry IQ attempts to enrich the career-intelligence block.
6. The report is saved locally and shown in the dashboard.
7. The student opens:
   - Student OS overview
   - Career Intelligence
   - Learning Hub
   - Portfolio Builder
   - Universities
   - Roadmap
   - AI Mentor
8. External resource and university links open only after a confirmation dialog.

## 7. Data and Grounding

Aimura uses a mix of structured intake, curated data, and live public signals.

Curated CSV files:

- `data/fields.csv`
- `data/countries.csv`
- `data/exams.csv`
- `data/universities_sample.csv`
- `data/career_roles.csv`

Live public signals used by the Next.js engine:

- Wikipedia search API
- GitHub repository search
- OpenAlex works API
- Hipolabs university registry
- YouTube, Coursera, and Udemy search links

The app treats live links as starting points. It explicitly tells students to verify admissions, visa, scholarship, fee, and employment details with official providers.

## 8. Output Report Structure

The generated report includes:

- Student OS overview
- normalized career domain and parent domain
- target roles
- required skills
- missing skills
- skill score
- career-intelligence headline and fit summary
- job-market demand and salary outlook
- risk strategy with severity and mitigation
- fallback options
- live learning resources
- university matches
- portfolio project ideas
- GitHub checklist
- LinkedIn headline
- resume bullets
- interview topics
- 24-week staged roadmap
- 12-week detailed timetable
- AI mentor prompts
- safety note

## 9. Safety, Reliability, and Confidentiality

Safety controls:

- No guarantee of admission, visa approval, scholarships, salaries, or job offers.
- Every report includes a safety note.
- Mentor system prompt refuses guarantees and legal immigration advice.
- External-link confirmation shows the exact URL before leaving the app.
- `.env` and `data/app-database.json` are gitignored.
- Demo profiles should be neutral or synthetic.
- No confidential student, university, employer, or proprietary data should be uploaded to the public repo or demo video.

Reliability controls:

- Foundry IQ is tried first.
- Failed provider handshakes fall through cleanly.
- Offline deterministic output keeps the demo working.
- TypeScript build and Python tests can run locally without cloud keys.

## 10. Hackathon Rubric Mapping

| Rubric area | Weight | Aimura evidence |
| --- | ---: | --- |
| Accuracy and relevance | 20% | Directly targets Reasoning Agents and the Microsoft IQ requirement through Foundry IQ. |
| Reasoning and multi-step thinking | 20% | Intake -> domain normalization -> skill scoring -> live signals -> career intelligence -> roadmap -> mentor. |
| Creativity and originality | 15% | Connects university planning, employability, portfolio proof, and mentoring in one student OS. |
| User experience and presentation | 15% | Polished Next.js interface, guided intake, report tabs, link guard, saved local reports. |
| Reliability and safety | 20% | Provider fallback chain, deterministic demo path, disclaimers, external-link confirmation, ignored secrets. |
| Community vote | 10% | Demo story is easy to explain and share: "not just where to study, but how to get job-ready." |

## 11. Demo Script

Use a neutral student profile.

1. Open the app and show the landing page with "Built on Microsoft Foundry IQ".
2. Create a local account.
3. Fill the required fields:
   - name
   - dream job role
4. Add enough details to make the report rich:
   - country
   - education level
   - field of study
   - current skills
   - preferred countries
   - budget
   - weekly study hours
5. Generate the Student OS.
6. Show the report overview, especially:
   - Microsoft IQ layer
   - current reasoning source
   - skill score
   - missing skills
7. Open Career Intelligence.
8. Show risks, fallback options, and the detailed timetable.
9. Open Universities or Learning Hub and demonstrate the external-link confirmation dialog.
10. Open AI Mentor and ask: "What should I do this week?"
11. End with the safety note and the project tagline.

Tagline:

> Aimura AI does not just tell students where to study. It explains why a path fits, what risks exist, and how to become job-ready.

## 12. Submission Checklist

- Register for the hackathon profile.
- Select the Reasoning Agents track.
- Keep the repository public.
- Include this README and docs folder.
- Do not commit `.env`, local account data, private datasets, or confidential information.
- Configure Foundry IQ credentials for the live demo environment if available.
- Record a short demo video with synthetic or neutral student data.
- Mention Foundry IQ / Azure AI Foundry in the demo and README.
- Show reliability: live Foundry path if configured, honest offline fallback otherwise.
- Review the disclaimer, code of conduct, and security policy before submitting.
- Submit before June 14, 2026.
- Share the project in the Agents League Discord for community voting.

## 13. Verification Commands

```bash
npx tsc --noEmit
npm run build
python -m pytest
```

Latest local verification on June 13, 2026:

- TypeScript check: passed
- Next.js production build: passed
- Python tests: 19 passed

## 14. Future Enhancements

- Add a hosted demo URL.
- Add screenshots for the README.
- Add exportable PDF report.
- Add real authentication and cloud database storage.
- Add Microsoft Entra identity if the project evolves toward an enterprise deployment.
- Add Web IQ or Fabric IQ as secondary Microsoft IQ layers if future tracks require broader grounding.
