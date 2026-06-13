"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  ExternalLink,
  GraduationCap,
  Gauge,
  Layers3,
  LifeBuoy,
  MessageSquare,
  Route,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { ExportActions } from "@/components/ExportActions";
import { LiveLearningHub } from "@/components/LiveLearningHub";
import { MentorChat } from "@/components/MentorChat";
import { ModuleSidebar, type ModuleNavItem } from "@/components/ModuleSidebar";
import { PortfolioBuilder } from "@/components/PortfolioBuilder";
import {
  ActionButtonGroup,
  EmptyState,
  GradientCard,
  InsightCard,
  MetricCard,
  SectionHeader,
  Toast,
  type ToastState,
} from "@/components/PremiumUI";
import { ReasoningPanel } from "@/components/ReasoningPanel";
import { SafeLink } from "@/components/LinkGuard";
import { JourneyChart, roadmapToJourney } from "@/components/JourneyChart";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { categoryStyle, categoryThemes, type CategoryId } from "@/lib/category-theme";
import {
  type AimuraStudentReport,
  type CareerIntelligence as CareerIntelligenceData,
  type RiskItem,
} from "@/lib/student-os-types";

type ReportDashboardProps = {
  isGenerated: boolean;
  report: AimuraStudentReport | null;
  onActivity?: (message: string) => void;
};

type GeneratedSectionId = "overview" | "career" | "learning" | "portfolio" | "universities" | "roadmap" | "mentor";

const generatedSections: Array<{
  id: GeneratedSectionId;
  label: string;
  description: string;
  category: CategoryId;
  icon: typeof Route;
}> = [
  { id: "overview", label: "My Plan", description: "Direction, first moves, score, and proof to build.", category: "my-plan", icon: Route },
  { id: "career", label: "Career Fit", description: "Market reality, risks, and backup routes for your goal.", category: "career-fit", icon: BriefcaseBusiness },
  { id: "learning", label: "Learn", description: "Courses, references, and practice links for your field.", category: "learn", icon: BrainCircuit },
  { id: "portfolio", label: "Build Proof", description: "Portfolio work, profile story, resume, and interview prep.", category: "build-proof", icon: Layers3 },
  { id: "universities", label: "Study Options", description: "Country-aware universities and official-site next steps.", category: "study-options", icon: GraduationCap },
  { id: "roadmap", label: "Weekly Plan", description: "A staged plan plus a detailed week-by-week timetable.", category: "weekly-plan", icon: CalendarClock },
  { id: "mentor", label: "Mentor", description: "Ask follow-up questions about your generated student plan.", category: "mentor", icon: MessageSquare },
];

const emptyStateModules = [
  { title: "My Plan", description: "A student-facing summary of your direction, score, skills to strengthen, and first moves." },
  { title: "Career Fit", description: "Job-market demand, risks, mitigations, and backup routes for your specific goal." },
  { title: "Learn", description: "Field-specific learning links from public sources, course platforms, and research references." },
  { title: "Build Proof", description: "Portfolio, clinical, creative, research, or technical proof based on your stream." },
  { title: "Study Options", description: "Country-aware university matches with confirmation before external links open." },
  { title: "Mentor", description: "A live mentor chat that answers using your generated plan, not a generic script." },
];

// Map the student's stated focus to the most relevant section, so the answer
// they gave in the intake actually changes what they see first.
function focusToSection(focus: string): GeneratedSectionId {
  const map: Record<string, GeneratedSectionId> = {
    "University Recommendations": "universities",
    "Admission Strategy": "universities",
    "Course Suggestions": "learning",
    "Skill Gap Analysis": "career",
    "Study Roadmap": "roadmap",
    "Complete Career Plan": "overview",
  };
  return map[focus] || "overview";
}

function getRoadmapTotalWeeks(report: AimuraStudentReport) {
  return report.roadmap.reduce((sum, step) => {
    const nums = (step.timeframe.match(/\d+/g) || []).map(Number);
    if (nums.length >= 2) return sum + Math.max(1, nums[1] - nums[0] + 1);
    if (nums.length === 1) return sum + 1;
    return sum + 4;
  }, 0);
}

function compactList(values: string[], fallback: string) {
  return values.length ? values.slice(0, 3).join(", ") : fallback;
}

export function ReportDashboard({ isGenerated, report, onActivity }: ReportDashboardProps) {
  const [activeGeneratedSection, setActiveGeneratedSection] = useState<GeneratedSectionId>("overview");
  const [toast, setToast] = useState<ToastState | null>(null);
  const activeGeneratedNavItem = generatedSections.find((item) => item.id === activeGeneratedSection);
  const activeTheme = categoryThemes[activeGeneratedNavItem?.category || "my-plan"];

  function showToast(tone: ToastState["tone"], title: string, message?: string) {
    setToast({ id: Date.now(), tone, title, message });
    onActivity?.(message || title);
  }

  // When a new report arrives, open the section matching the student's focus.
  const reportId = report?.id;
  const focus = report?.answers.helpFocus;
  useEffect(() => {
    if (reportId && focus) setActiveGeneratedSection(focusToSection(focus));
  }, [reportId, focus]);

  if (report) {
    const totalWeeks = getRoadmapTotalWeeks(report);
    const targetRole = report.domainProfile.targetRoles[0] || report.answers.dreamRole || "Target role";
    const nextAction = report.roadmap[0]?.actions[0] || report.intelligence.detailedTimetable[0]?.tasks[0] || "Ask the mentor for your first move.";
    const topGaps = compactList(report.domainProfile.missingSkills, "No major gaps found");
    const moduleItems: Array<ModuleNavItem<GeneratedSectionId>> = generatedSections.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      icon: item.icon,
      theme: categoryThemes[item.category],
      status: activeGeneratedSection === item.id ? "active" : item.id === "overview" ? "done" : "ready",
      completion:
        item.id === "overview"
          ? 100
          : item.id === "roadmap"
            ? Math.min(100, report.roadmap.length * 18)
            : item.id === "learning"
              ? Math.min(100, report.learningResources.length * 16)
              : item.id === "universities"
                ? Math.min(100, report.universityMatches.length * 20)
                : 72,
    }));

    return (
      <section className="mx-auto max-w-7xl scroll-mt-8 px-5 py-12 sm:px-8 lg:px-12" id="report">
        <GradientCard className="mb-6 p-5 sm:p-6" theme={categoryThemes["my-plan"]}>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">
                <Sparkles className="size-4" aria-hidden />
                Success state
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-aimura-white sm:text-5xl">
                {report.studentName}, your roadmap is live.
              </h2>
              <p className="mt-5 text-base leading-7 text-aimura-muted">{report.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-aimura-muted">
                <span className="rounded-control border border-aimura-moss/30 px-3 py-1.5">
                  Saved locally / {new Date(report.generatedAt).toLocaleString()}
                </span>
                <span className="rounded-control border border-aimura-green/30 bg-aimura-green/10 px-3 py-1.5 text-aimura-green">
                  {report.intelligence.source === "foundry" ? "Foundry IQ active" : "Resilient reasoning active"}
                </span>
              </div>
            </div>
            <ExportActions
              activeSectionLabel={activeGeneratedNavItem?.label}
              isGenerated={isGenerated}
              onActivity={onActivity}
              reportTitle={`${report.studentName}'s Aimura AI pathway report`}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              detail={`${report.domainProfile.normalizedField} readiness`}
              icon={Gauge}
              label="Skill Score"
              theme={categoryThemes["my-plan"]}
              value={`${report.skillScore}/100`}
            />
            <MetricCard
              detail={report.domainProfile.parentDomain}
              icon={Target}
              label="Target Role"
              theme={categoryThemes["career-fit"]}
              value={targetRole}
            />
            <MetricCard
              detail={`${report.roadmap.length} roadmap phases`}
              icon={CalendarClock}
              label="Timeline"
              theme={categoryThemes["weekly-plan"]}
              value={`${totalWeeks} weeks`}
            />
            <MetricCard
              detail={topGaps}
              icon={ShieldAlert}
              label="Top Gaps"
              theme={categoryThemes["learn"]}
              value={`${report.domainProfile.missingSkills.length || 0}`}
            />
            <MetricCard
              detail={nextAction}
              icon={BadgeCheck}
              label="Next Action"
              theme={categoryThemes["build-proof"]}
              value="Ready"
            />
          </div>
        </GradientCard>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_1fr]">
          <ModuleSidebar
            activeId={activeGeneratedSection}
            items={moduleItems}
            onChange={(id) => {
              setActiveGeneratedSection(id);
              onActivity?.(`Opened ${generatedSections.find((item) => item.id === id)?.label || "module"}.`);
            }}
          />

          <GradientCard className="aimura-no-left-line min-w-0 p-5 sm:p-6" style={{ borderLeftColor: "transparent" }} theme={activeTheme}>
            <SectionHeader
              description={activeGeneratedNavItem?.description}
              icon={activeGeneratedNavItem?.icon}
              meta={
                <span className="rounded-control border px-4 py-2 text-sm font-semibold" style={{ borderColor: activeTheme.border, color: activeTheme.accent }}>
                  Skill score {report.skillScore}/100
                </span>
              }
              theme={activeTheme}
              title={activeGeneratedNavItem?.label || "My Plan"}
            />

            <div className="mt-6">
              {activeGeneratedSection === "overview" ? (
                <GeneratedOverview
                  onAskMentor={() => setActiveGeneratedSection("mentor")}
                  onContinueWeeklyPlan={() => setActiveGeneratedSection("roadmap")}
                  report={report}
                />
              ) : null}
              {activeGeneratedSection === "career" ? <CareerIntelligence report={report} /> : null}
              {activeGeneratedSection === "learning" ? <LiveLearningHub resources={report.learningResources} /> : null}
              {activeGeneratedSection === "portfolio" ? <PortfolioBuilder portfolio={report.portfolioPlan} /> : null}
              {activeGeneratedSection === "universities" ? <UniversityMatches report={report} /> : null}
              {activeGeneratedSection === "roadmap" ? (
                <RoadmapTimeline
                  onAskMentor={() => setActiveGeneratedSection("mentor")}
                  onToast={(nextToast) => showToast(nextToast.tone, nextToast.title, nextToast.message)}
                  report={report}
                />
              ) : null}
              {activeGeneratedSection === "mentor" ? <MentorChat report={report} /> : null}
            </div>

            <div className="aimura-role-body mt-6 rounded-[1.15rem] border bg-aimura-panel/45 p-4 text-sm leading-6" style={{ ...categoryStyle(activeTheme), borderColor: activeTheme.border }}>
              <span className="aimura-role-title font-semibold">Safety note: </span>
              {report.safetyNote}
            </div>
          </GradientCard>
        </div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl scroll-mt-8 px-5 py-12 sm:px-8 lg:px-12" id="report">
      <GradientCard className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <EmptyState
            description="Complete the guided intake and Aimura AI will generate a saved report from your real answers, including career intelligence with risk and fallback strategy."
            icon={Sparkles}
            title="No report generated yet."
          />
          <div className="shrink-0">
            <span className="mb-4 inline-flex rounded-control border border-aimura-moss/35 bg-aimura-panel px-4 py-2 text-sm text-aimura-muted">
              Waiting for intake
            </span>
            <ExportActions activeSectionLabel="Not generated yet" isGenerated={isGenerated} onActivity={onActivity} />
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader
            description="A premium preview of the modules that unlock after generation."
            icon={Route}
            meta={
              <span className="rounded-control bg-aimura-green/10 px-4 py-2 text-sm font-medium text-aimura-green">
                {emptyStateModules.length} modules
              </span>
            }
            theme={categoryThemes["my-plan"]}
            title="What appears after generation"
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {emptyStateModules.map((module, index) => {
            const section = generatedSections[index] || generatedSections[0];
            const theme = categoryThemes[section.category];
            return (
              <InsightCard
                body={module.description}
                icon={section.icon}
                key={module.title}
                label={theme.iconTone}
                theme={theme}
                title={module.title}
              />
            );
          })}
        </div>

        <div className="aimura-role-body mt-6 rounded-[1.15rem] border border-aimura-moss/25 bg-aimura-panel/45 p-4 text-sm leading-6">
          <span className="aimura-role-title font-semibold">Safety note: </span>
          Aimura AI provides educational and career guidance, not guarantees. Verify admissions, visa,
          scholarship, cost, university, and employment details with official providers.
        </div>
      </GradientCard>
    </section>
  );
}

function GeneratedOverview({
  report,
  onContinueWeeklyPlan,
  onAskMentor,
}: {
  report: AimuraStudentReport;
  onContinueWeeklyPlan: () => void;
  onAskMentor: () => void;
}) {
  const firstRoadmapStep = report.roadmap[0];
  const topProof = report.portfolioPlan.projectIdeas[0];
  const preferredCountries =
    report.answers.studyCountries.length > 0
      ? report.answers.studyCountries.join(", ")
      : report.answers.country || "Not selected yet";

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.35rem] border p-5" style={{ ...categoryStyle(categoryThemes["my-plan"]), background: categoryThemes["my-plan"].soft, borderColor: categoryThemes["my-plan"].border }}>
          <p className="aimura-role-label text-xs uppercase tracking-[0.2em]">Your direction</p>
          <h4 className="aimura-role-title mt-3 text-2xl font-semibold tracking-[-0.03em]">
            {report.domainProfile.targetRoles[0]} through {report.domainProfile.normalizedField}
          </h4>
          <p className="aimura-role-body mt-3 text-sm leading-7">
            This plan is curated around your stated goal, current studies, interests, evidence, budget, and preferred countries.
          </p>
          {report.answers.helpFocus ? (
            <p className="aimura-role-value mt-3 inline-flex rounded-control bg-aimura-green/15 px-3 py-1.5 text-xs font-medium">
              Focus requested: {report.answers.helpFocus}
            </p>
          ) : null}
          <div className="mt-5">
            <ActionButtonGroup
              actions={[
                { label: "Continue Weekly Plan", icon: CalendarClock, onClick: onContinueWeeklyPlan, variant: "primary" },
                { label: "Ask AI Mentor", icon: MessageSquare, onClick: onAskMentor },
              ]}
            />
          </div>
        </div>

        <div className="rounded-[1.35rem] border bg-aimura-panel/45 p-5" style={{ ...categoryStyle(categoryThemes["my-plan"]), borderColor: categoryThemes["my-plan"].border }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]">Career journey chart</p>
            <span className="aimura-role-value rounded-control bg-aimura-green/10 px-3 py-1 text-xs font-medium">
              {report.domainProfile.targetRoles[0]}
            </span>
          </div>
          {(() => {
            const journey = roadmapToJourney(report);
            return (
              <JourneyChart
                segments={journey.segments}
                centerLabel={journey.centerLabel}
                centerSub={journey.centerSub}
                caption={`From today to job-ready: interview readiness reaches 90%, and the final job-ready outcome reaches 100% for ${report.domainProfile.targetRoles[0]}.`}
              />
            );
          })()}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InsightCard
          icon={Route}
          label="Start here"
          theme={categoryThemes["weekly-plan"]}
          title={firstRoadmapStep ? `${firstRoadmapStep.phase} · ${firstRoadmapStep.timeframe}` : "Start with foundations"}
          body={firstRoadmapStep?.focus || "Build a foundation before choosing universities, applications, or portfolio pieces."}
        />
        <InsightCard
          icon={Layers3}
          label="Proof to build"
          theme={categoryThemes["build-proof"]}
          title={topProof?.title || "Field-specific portfolio evidence"}
          body={topProof?.outcome || "Create visible evidence that proves your readiness for the role you want."}
        />
        <InsightCard
          icon={BadgeCheck}
          label="Skills to strengthen"
          theme={categoryThemes["learn"]}
          title={compactList(report.domainProfile.missingSkills, "Maintain your strongest evidence")}
          body={`Your skill score is ${report.skillScore}/100. Focus on these gaps first so your applications and portfolio feel credible.`}
        />
        <InsightCard
          icon={GraduationCap}
          label="Study context"
          theme={categoryThemes["study-options"]}
          title={preferredCountries}
          body={`Budget (GBP): ${report.answers.budgetRange || "not specified"} · Scholarship support: ${report.answers.needScholarship || "not specified"} · English test: ${report.answers.englishTest || "not specified"}${report.answers.englishScore ? ` (${report.answers.englishScore})` : ""}`}
        />
      </div>

      <ReasoningPanel report={report} />
    </div>
  );
}

// The visible multi-step reasoning trace, grounded in this student's report.
function reasoningSteps(report: AimuraStudentReport): string[] {
  const profile = report.domainProfile;
  return [
    `Normalized your goal "${report.answers.dreamRole}" into the ${profile.normalizedField} domain and target roles ${profile.targetRoles.slice(0, 2).join(", ")}.`,
    `Gathered live public signals (${profile.sources.join(", ")}) to ground the required skills.`,
    `Scored your profile honestly at ${report.skillScore}/100 and surfaced gaps: ${profile.missingSkills.slice(0, 3).join(", ")}.`,
    `Reasoned with Foundry IQ to build career intelligence — job market, risk strategy, fallback options, and a 12-week timetable.`,
    `Assembled your staged roadmap, portfolio plan, and ${report.universityMatches.length} university matches for ${report.answers.studyCountries[0] || report.answers.country || "your region"}.`,
    `Stood up a live mentor that answers follow-ups using every field above.`,
  ];
}

function StudentPlanCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="rounded-[1.25rem] border border-aimura-moss/20 bg-aimura-panel-2 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-aimura-moss">{label}</p>
      <p className="mt-3 text-lg font-semibold text-aimura-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-aimura-muted">{body}</p>
    </div>
  );
}

// Calm, non-alarming palette: a higher severity reads as "focus here", not "error".
const severityTone: Record<RiskItem["severity"], string> = {
  Low: "border-aimura-green/40 bg-aimura-green/10 text-aimura-green",
  Medium: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  High: "border-amber-400/40 bg-amber-400/10 text-amber-300",
};

function CareerIntelligence({ report }: { report: AimuraStudentReport }) {
  const intel: CareerIntelligenceData = report.intelligence;
  const theme = categoryThemes["career-fit"];
  return (
    <div className="space-y-5" style={categoryStyle(theme)}>
      <div className="rounded-[1.25rem] border p-5" style={{ background: theme.soft, borderColor: theme.border }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]">{intel.headline}</p>
          <span className="aimura-role-value rounded-control border px-3 py-1 text-xs" style={{ borderColor: theme.border }}>
            {intel.source === "foundry"
              ? "Grounded with Microsoft Foundry IQ"
              : intel.source === "ai"
                ? "AI-enhanced"
                : "Foundry IQ-ready offline guidance"}
          </span>
        </div>
        <p className="aimura-role-body mt-3 text-sm leading-7">{intel.fitSummary}</p>
      </div>

      <div className="rounded-[1.25rem] border bg-aimura-panel/45 p-5" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4" style={{ color: theme.accent }} aria-hidden />
          <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]">Job market status</p>
          <span className="aimura-role-value ml-auto rounded-control px-3 py-1 text-xs font-medium" style={{ background: theme.soft }}>
            Demand: {intel.jobMarket.demandLevel}
          </span>
        </div>
        <p className="aimura-role-body mt-3 text-sm leading-7">{intel.jobMarket.outlook}</p>
        <p className="aimura-role-body mt-3 text-sm leading-7">
          <span className="aimura-role-title font-semibold">Salary outlook: </span>
          {intel.jobMarket.salaryOutlook}
        </p>
        {intel.jobMarket.signals.length ? (
          <ul className="aimura-role-body mt-3 space-y-2 text-sm leading-6">
            {intel.jobMarket.signals.map((signal) => (
              <li key={signal}>- {signal}</li>
            ))}
          </ul>
        ) : null}
        {intel.jobMarket.exampleTitles.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {intel.jobMarket.exampleTitles.map((title) => (
              <span key={title} className="aimura-role-meta rounded-control border px-3 py-1 text-xs" style={{ borderColor: theme.border }}>
                {title}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.25rem] border bg-aimura-panel/45 p-5" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4" style={{ color: theme.accent }} aria-hidden />
          <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]">Risk strategy</p>
        </div>
        <div className="mt-4 space-y-3">
          {intel.riskStrategy.map((item) => (
            <div className="rounded-2xl border border-aimura-moss/20 bg-aimura-panel/60 p-4" key={item.risk}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="aimura-role-title text-sm font-semibold">{item.risk}</p>
                <span className={`rounded-control border px-3 py-1 text-xs font-medium ${severityTone[item.severity]}`}>
                  {item.severity}
                </span>
              </div>
              <p className="aimura-role-body mt-2 text-sm leading-6">
                <span className="aimura-role-meta font-semibold">Mitigation: </span>
                {item.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.25rem] border bg-aimura-panel/45 p-5" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <LifeBuoy className="size-4" style={{ color: theme.accent }} aria-hidden />
          <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]">Fallback options</p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {intel.fallbackOptions.map((option) => (
            <div className="rounded-2xl border border-aimura-moss/20 bg-aimura-panel/60 p-4" key={option.option}>
              <p className="aimura-role-title text-sm font-semibold">{option.option}</p>
              <p className="aimura-role-label mt-2 text-xs uppercase tracking-[0.16em]">{option.whenToUse}</p>
              <p className="aimura-role-body mt-2 text-sm leading-6">{option.firstStep}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListBlock title="Required skills" values={report.domainProfile.requiredSkills} />
        <ListBlock title="Evidence sources" values={report.domainProfile.sources} />
      </div>
    </div>
  );
}

function UniversityMatches({ report }: { report: AimuraStudentReport }) {
  const theme = categoryThemes["study-options"];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {report.universityMatches.map((match) => (
        <SafeLink
          className="block w-full rounded-[1.25rem] border bg-aimura-panel/45 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.05]"
          description={match.fitReason}
          href={match.url}
          key={`${match.name}-${match.country}-${match.url}`}
          label={`${match.name} · ${match.country}`}
          style={{ ...categoryStyle(theme), borderColor: theme.border }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="aimura-role-title text-sm font-semibold">{match.name}</p>
            <span className="aimura-role-value rounded-control px-3 py-1 text-xs" style={{ background: theme.soft }}>{match.tier}</span>
          </div>
          <p className="aimura-role-label mt-2 text-xs uppercase tracking-[0.18em]">{match.country}</p>
          <p className="aimura-role-body mt-3 text-sm leading-6">{match.fitReason}</p>
          <p className="aimura-role-value mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            <ExternalLink className="size-3.5" aria-hidden />
            Opens official site after you confirm
          </p>
        </SafeLink>
      ))}
    </div>
  );
}

function RoadmapView({ report }: { report: AimuraStudentReport }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {report.roadmap.map((step) => (
          <div className="rounded-[1.25rem] border border-aimura-moss/20 bg-aimura-panel-2 p-4" key={`${step.phase}-${step.timeframe}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-aimura-moss">{step.timeframe}</p>
            <h4 className="mt-2 text-lg font-semibold text-aimura-white">{step.phase}</h4>
            <p className="mt-2 text-sm leading-6 text-aimura-muted">{step.focus}</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-aimura-muted">
              {step.actions.map((action) => (
                <li key={`${step.phase}-${action}`}>- {action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-aimura-green" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aimura-green">
            Detailed week-by-week timetable
          </p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {report.intelligence.detailedTimetable.map((week) => (
            <div className="rounded-[1.25rem] border border-aimura-moss/20 bg-aimura-panel-2 p-4" key={week.label}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-aimura-white">{week.label}</p>
                {week.hoursFocus ? (
                  <span className="rounded-control bg-aimura-green/10 px-3 py-1 text-[0.65rem] font-medium text-aimura-green">
                    {week.hoursFocus}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-aimura-green">{week.theme}</p>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-aimura-muted">
                {week.tasks.map((task) => (
                  <li key={task}>- {task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  const theme = categoryThemes["career-fit"];
  return (
    <div className="rounded-[1.25rem] border bg-aimura-panel/45 p-4" style={{ borderColor: theme.border }}>
      <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]" style={categoryStyle(theme)}>{title}</p>
      <ul className="aimura-role-body mt-3 space-y-2 text-sm leading-6" style={categoryStyle(theme)}>
        {values.map((value) => (
          <li key={`${title}-${value}`}>- {value}</li>
        ))}
      </ul>
    </div>
  );
}
