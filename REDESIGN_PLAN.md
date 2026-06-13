# Aimura AI SaaS Interface Redesign Plan

## Design Direction

Redesign Aimura AI from a Streamlit-style single-page form into a professional, interactive B2B SaaS product experience inspired by the Ramotion HackerRank Dribbble reference:

- Dark product canvas with black and charcoal surfaces.
- Bright green conversion accents using `#0BE950` and `#0BFCAB`.
- Muted enterprise text colors using `#A0A0A0` and structural green-gray `#4D5E54`.
- Modern Geist/Inter-style typography with compact, confident SaaS spacing.
- A strong first viewport that explains what Aimura AI does and why it matters within seconds.
- Interactive product UI, not a static marketing-only page.

Local concept reference: `design-reference/aimura-saas-redesign-concept.png`
External reference: https://dribbble.com/shots/26414267-B2B-SaaS-Landing-Page-Design-for-HackerRank

## Product Structure

1. Hero section
   - H1: "Plan your study path. Build your career path."
   - Supporting copy explains personalised education-to-career pathway generation.
   - Primary CTA: "Get Started".
   - Secondary CTA: "Generate Report".
   - Right-side product preview showing wizard/report cards.

2. Multi-step wizard
   - Step 1: Profile.
   - Step 2: Interests & Goals.
   - Step 3: Budget & Preferences.
   - Step 4: Review & Generate Pathway.
   - Include progress indicator, Back button, Next button, and final Generate Report action.
   - Replace the long single-page form with focused step panels.

3. Report dashboard
   - Side navigation or tabs for Student Summary, Top Fields, Countries, Exams, Universities, Dream Role Check, Roadmap, and Action Plan.
   - Use interactive report cards with icon, headline, short description, score/status, and "View details" toggle.
   - Include top actions: Download PDF, Save Session, Share via Email.

4. Responsiveness
   - Desktop: hero plus app preview, wizard and report grid with side nav.
   - Tablet: stacked hero, horizontal section tabs, two-column cards.
   - Mobile: single-column wizard steps, sticky action buttons, horizontally scrollable report nav.

## Development Tasks

1. Set up a Next.js + TailwindCSS app structure alongside the existing Python backend artifacts.
2. Define Tailwind theme tokens for the Dribbble-inspired dark palette, typography, radii, shadows, and card surfaces.
3. Create shared frontend data models and static demo report data matching the existing Aimura AI report sections.
4. Implement `HeroSection` with value proposition, CTA buttons, and product preview.
5. Implement `MultiStepForm` with Profile, Interests & Goals, Budget & Preferences, and Review & Generate Pathway steps.
6. Implement report navigation via `SidebarNav` or responsive tabs.
7. Implement reusable `ReportCard` components with icons, descriptions, status/score metadata, and View details toggles.
8. Implement the report dashboard with Student Summary, Top Fields, Countries, Exams, Universities, Dream Role Check, Roadmap, and Action Plan sections.
9. Add top report actions for Download PDF, Save Session, and Share via Email with consistent button styling and local UI feedback.
10. Wire page-level interactions: Get Started scroll/focus, wizard state, report generation state, report navigation, card details, and action feedback.
11. Update local launcher/docs to run the new Next.js interface while preserving Python verification assets.
12. Verify desktop and mobile responsiveness in browser, compare against the concept reference, and fix visual/interaction issues.
