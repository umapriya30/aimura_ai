"use client";

import { BrainCircuit, ChevronDown, DatabaseZap, Gauge, Network, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/PremiumUI";
import { categoryStyle, categoryThemes } from "@/lib/category-theme";
import { type AimuraStudentReport } from "@/lib/student-os-types";

type ReasoningPanelProps = {
  report: AimuraStudentReport;
};

export function ReasoningPanel({ report }: ReasoningPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const theme = categoryThemes["career-fit"];
  const sourceLabel =
    report.intelligence.source === "foundry"
      ? "Microsoft Foundry IQ"
      : report.intelligence.source === "ai"
        ? "AI fallback reasoning"
        : "Deterministic offline reasoning";

  const steps = [
    {
      icon: Search,
      title: "Input signals",
      body: `Read ${report.studentName}'s goal, field, skills, study intent, preferred countries, budget currency, weekly hours, and support needs.`,
      meta: `${formatFocus(report.answers.helpFocus)} focus`,
    },
    {
      icon: Network,
      title: "Goal normalization",
      body: `Mapped "${report.answers.dreamRole}" into ${report.domainProfile.normalizedField} with target roles ${report.domainProfile.targetRoles.slice(0, 2).join(", ")}.`,
      meta: `${Math.round(report.domainProfile.confidence * 100)}% confidence`,
    },
    {
      icon: DatabaseZap,
      title: "Market intelligence",
      body: `Grounded the plan with public signals and source families: ${report.domainProfile.sources.slice(0, 4).join(", ")}.`,
      meta: report.intelligence.jobMarket.demandLevel,
    },
    {
      icon: Gauge,
      title: "Scoring logic",
      body: `Compared current proof against required skills, then scored the profile at ${report.skillScore}/100 and surfaced top gaps: ${report.domainProfile.missingSkills.slice(0, 3).join(", ")}.`,
      meta: `${report.domainProfile.missingSkills.length} gaps`,
    },
    {
      icon: BrainCircuit,
      title: "Recommendation",
      body: `Generated a staged roadmap, portfolio evidence plan, university matches, and a week-by-week timetable tied to ${report.answers.weeklyHours || "available"} weekly hours.`,
      meta: sourceLabel,
    },
    {
      icon: ShieldCheck,
      title: "Safety and verification",
      body: "Kept guidance educational, added risk/fallback strategy, and routes external links through a confirmation step.",
      meta: "Explainable",
    },
  ];

  return (
    <div className="space-y-4" style={categoryStyle(theme)}>
      <SectionHeader
        description="A compact reasoning trace showing how Aimura transformed profile inputs into the roadmap, score, risks, and next actions."
        icon={BrainCircuit}
        meta={
          <button
            className="aimura-focus-ring inline-flex items-center gap-2 rounded-control border px-4 py-2 text-sm font-semibold text-aimura-white transition hover:bg-white/10"
            onClick={() => setExpanded((current) => !current)}
            style={{ borderColor: theme.border }}
            type="button"
          >
            {expanded ? "Collapse" : "Expand"}
            <ChevronDown className={`size-4 transition ${expanded ? "rotate-180" : ""}`} aria-hidden />
          </button>
        }
        theme={theme}
        title="AI Decision Logic"
      />

      {expanded ? (
        <div className="grid gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                className="aimura-rise rounded-[1.1rem] border bg-aimura-panel/45 p-4"
                key={step.title}
                style={{ animationDelay: `${index * 45}ms`, borderColor: index % 2 === 0 ? theme.border : "rgb(255 255 255 / 0.12)" }}
              >
                <div className="flex gap-4">
                  <span className="aimura-category-icon flex size-10 shrink-0 items-center justify-center rounded-2xl" style={categoryStyle(theme)}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="aimura-role-value inline-flex size-6 items-center justify-center rounded-full border text-xs font-bold" style={{ background: theme.soft, borderColor: theme.border }}>
                        {index + 1}
                      </span>
                      <h4 className="aimura-role-title text-base font-semibold">{step.title}</h4>
                      <span className="aimura-role-meta ml-auto rounded-control border px-3 py-1 text-xs" style={{ borderColor: theme.border }}>
                        {step.meta}
                      </span>
                    </div>
                    <p className="aimura-role-body mt-2 text-sm leading-6">{step.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="aimura-role-body rounded-[1.1rem] border bg-aimura-panel/45 p-4 text-sm leading-6" style={{ borderColor: theme.border }}>
          <Sparkles className="mr-2 inline size-4" style={{ color: theme.accent }} aria-hidden />
          Trace collapsed. Expand it to show the numbered reasoning chain during a demo.
        </div>
      )}
    </div>
  );
}

function formatFocus(focus: string[] | unknown) {
  if (Array.isArray(focus)) return focus.length ? focus.join(", ") : "Complete Career Plan";
  if (typeof focus === "string" && focus.trim()) return focus;
  return "Complete Career Plan";
}
