"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarPlus, CheckCircle2, ClipboardList, MessageSquare, Play, Target, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButtonGroup, SectionHeader, type ToastState } from "@/components/PremiumUI";
import { categoryStyle, categoryThemes } from "@/lib/category-theme";
import { type AimuraStudentReport } from "@/lib/student-os-types";

type RoadmapTimelineProps = {
  report: AimuraStudentReport;
  onAskMentor: () => void;
  onToast?: (toast: Omit<ToastState, "id">) => void;
};

type TimelineTab = "details" | "skills" | "evidence";

function weekRangeLabel(timeframe: string) {
  const nums = (timeframe.match(/\d+/g) || []).map(Number);
  if (nums.length >= 2) return `Weeks ${nums[0]}-${nums[1]}`;
  if (nums.length === 1) return `Week ${nums[0]}`;
  return timeframe;
}

export function RoadmapTimeline({ report, onAskMentor, onToast }: RoadmapTimelineProps) {
  const theme = categoryThemes["weekly-plan"];
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TimelineTab>("details");
  const [donePhases, setDonePhases] = useState<string[]>([]);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const phases = useMemo(
    () =>
      report.roadmap.map((step, index) => {
        const timetable = report.intelligence.detailedTimetable[index];
        const project = report.portfolioPlan.projectIdeas[index % Math.max(1, report.portfolioPlan.projectIdeas.length)];
        const skillStart = Math.min(index * 2, Math.max(0, report.domainProfile.requiredSkills.length - 2));
        const skills = report.domainProfile.requiredSkills.slice(skillStart, skillStart + 3);
        return {
          ...step,
          weekRange: weekRangeLabel(step.timeframe),
          deliverables: timetable?.tasks.slice(0, 3) || step.actions.slice(0, 3),
          skills: skills.length ? skills : report.domainProfile.requiredSkills.slice(0, 3),
          evidence: [
            project?.title || "Field-specific proof item",
            project?.outcome || "Document one visible artifact that proves your readiness.",
            `Update profile evidence for ${report.domainProfile.targetRoles[0] || report.answers.dreamRole}.`,
          ],
          cta: index === 0 ? "Start Phase" : index === report.roadmap.length - 1 ? "Finish Strong" : "Continue Phase",
        };
      }),
    [report],
  );

  const activePhase = phases[activePhaseIndex] || phases[0];
  const isDone = activePhase ? donePhases.includes(activePhase.phase) : false;

  function showToast(tone: ToastState["tone"], title: string, message: string) {
    onToast?.({ tone, title, message });
  }

  function runPhaseAction(key: string, task: () => void) {
    if (runningAction) return;
    setRunningAction(key);
    task();
    window.setTimeout(() => setRunningAction(null), 550);
  }

  if (!activePhase) return null;

  return (
    <div className="space-y-5" style={categoryStyle(theme)}>
      <SectionHeader
        description="A staged execution timeline with one active phase at a time. Each phase connects weeks, objective, deliverables, skills, evidence, and mentor support."
        icon={ClipboardList}
        meta={
          <span className="inline-flex max-w-full break-words rounded-2xl border px-4 py-2 text-sm font-semibold leading-5 sm:rounded-control" style={{ borderColor: theme.border, color: theme.accent }}>
            {donePhases.length}/{phases.length} complete
          </span>
        }
        theme={theme}
        title="Weekly Plan Timeline"
      />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="relative min-w-0 space-y-3">
          {phases.map((phase, index) => {
            const active = index === activePhaseIndex;
            const done = donePhases.includes(phase.phase);
            return (
              <button
                className={`aimura-focus-ring relative flex w-full min-w-0 gap-3 overflow-hidden rounded-[1.15rem] border p-4 text-left transition ${
                  active ? "bg-white/[0.075] text-aimura-white" : "bg-white/[0.028] text-aimura-muted hover:bg-white/[0.05] hover:text-aimura-white"
                }`}
                key={`${phase.phase}-${phase.timeframe}`}
                onClick={() => {
                  setActivePhaseIndex(index);
                  setActiveTab("details");
                }}
                style={{ borderColor: active ? theme.border : "rgb(255 255 255 / 0.1)", boxShadow: active ? theme.shadow : undefined }}
                type="button"
              >
                <span
                  className="z-[1] flex size-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold"
                  style={{
                    background: done ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : theme.soft,
                    borderColor: theme.border,
                    color: done ? "#020817" : theme.accent,
                  }}
                >
                  {done ? <CheckCircle2 className="size-4" aria-hidden /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] ${active ? "aimura-role-label" : "aimura-role-subtle"}`}>
                    {phase.weekRange}
                  </span>
                  <span className="aimura-role-title mt-1 block break-words text-base font-semibold">{phase.phase}</span>
                  <span className="aimura-role-body mt-1 line-clamp-2 block text-sm leading-6">{phase.focus}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="aimura-gradient-card min-w-0 max-w-full overflow-hidden rounded-[1.35rem] p-4 sm:p-5"
          style={{
            "--accent": theme.accent,
            "--accent-2": theme.accent2,
            "--accent-soft": theme.soft,
            "--accent-border": theme.border,
          } as CSSProperties}
        >
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.2em]">
                {activePhase.weekRange}
              </p>
              <h4 className="aimura-role-title mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{activePhase.phase}</h4>
              <p className="aimura-role-body mt-2 text-sm leading-6">{activePhase.focus}</p>
            </div>
            <span className="aimura-role-value inline-flex max-w-full items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold leading-5 sm:rounded-control" style={{ borderColor: theme.border }}>
              <Target className="size-3.5" aria-hidden />
              {isDone ? "Marked done" : activePhase.cta}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(["details", "skills", "evidence"] as TimelineTab[]).map((tab) => (
              <button
                className={`aimura-focus-ring min-w-0 whitespace-normal rounded-control px-4 py-2 text-sm font-semibold capitalize transition ${
                  activeTab === tab ? "text-aimura-black" : "border border-aimura-moss/30 text-aimura-muted hover:text-aimura-white"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` } : undefined}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5 min-w-0 rounded-[1.1rem] border border-white/10 bg-aimura-black/30 p-4">
            {activeTab === "details" ? (
              <TimelineList
                icon={ClipboardList}
                title="Deliverables"
                values={activePhase.deliverables}
              />
            ) : null}
            {activeTab === "skills" ? (
              <TimelineList
                icon={Target}
                title="Skills to practice"
                values={activePhase.skills}
              />
            ) : null}
            {activeTab === "evidence" ? (
              <TimelineList
                icon={Trophy}
                title="Evidence to create"
                values={activePhase.evidence}
              />
            ) : null}
          </div>

          <div className="mt-5">
            <ActionButtonGroup
              actions={[
                {
                  label: isDone ? "Phase Started" : "Start Phase",
                  icon: Play,
                  variant: "primary",
                  loading: runningAction === "start",
                  onClick: () =>
                    runPhaseAction("start", () =>
                      showToast("success", "Phase started", `${activePhase.phase} is now your active weekly focus.`),
                    ),
                },
                {
                  label: isDone ? "Done" : "Mark Done",
                  icon: CheckCircle2,
                  disabled: isDone,
                  loading: runningAction === "done",
                  onClick: () =>
                    runPhaseAction("done", () => {
                      setDonePhases((current) => (current.includes(activePhase.phase) ? current : [...current, activePhase.phase]));
                      showToast("success", "Phase completed", `${activePhase.phase} was marked done for this session.`);
                    }),
                },
                {
                  label: "Add to Calendar",
                  icon: CalendarPlus,
                  loading: runningAction === "calendar",
                  onClick: () =>
                    runPhaseAction("calendar", () =>
                      showToast("info", "Calendar reminder staged", `${activePhase.weekRange}: ${activePhase.phase} is ready to add to your calendar.`),
                    ),
                },
                {
                  label: "Ask Mentor",
                  icon: MessageSquare,
                  loading: runningAction === "mentor",
                  onClick: () =>
                    runPhaseAction("mentor", () => {
                      showToast("info", "Mentor opened", "Ask the AI Mentor to adapt this phase to your week.");
                      onAskMentor();
                    }),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-[1.35rem] border p-4 sm:p-5" style={{ background: theme.headerGradient, borderColor: theme.border }}>
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.2em]">After week 24</p>
            <h4 className="aimura-role-title mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
              Ask for more guidance and connect with a one-to-one mentor.
            </h4>
            <p className="aimura-role-body mt-2 text-sm leading-6">
              Once the 24-week roadmap is complete, use this handoff to get personal mentor guidance on interviews,
              applications, portfolio review, offer strategy, and the next custom roadmap.
            </p>
          </div>
          <ActionButtonGroup
            actions={[
              {
                label: "Ask for More Guidance",
                icon: MessageSquare,
                variant: "primary",
                loading: runningAction === "more-guidance",
                onClick: () =>
                  runPhaseAction("more-guidance", () => {
                    showToast("info", "More guidance opened", "Ask the AI Mentor what to do after the 24-week roadmap.");
                    onAskMentor();
                  }),
              },
              {
                label: "Plan 1:1 Mentor Call",
                icon: CalendarPlus,
                loading: runningAction === "mentor-call",
                onClick: () =>
                  runPhaseAction("mentor-call", () =>
                    showToast("success", "1:1 mentor handoff prepared", "Use this checkpoint to connect with a personal mentor for deeper guidance."),
                  ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function TimelineList({
  icon: Icon,
  title,
  values,
}: {
  icon: LucideIcon;
  title: string;
  values: string[];
}) {
  const theme = categoryThemes["weekly-plan"];
  return (
    <div>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" style={{ color: theme.accent }} aria-hidden />
        <p className="aimura-role-label min-w-0 break-words text-sm font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em]">{title}</p>
      </div>
      <ul className="mt-4 grid gap-2">
        {values.map((value) => (
          <li className="aimura-role-body min-w-0 break-words rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6" key={`${title}-${value}`}>
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
