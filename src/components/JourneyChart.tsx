"use client";

import { categoryThemes } from "@/lib/category-theme";
import { type AimuraStudentReport } from "@/lib/student-os-types";

export type JourneySegment = {
  label: string;
  value: number;
  color: string;
  hint?: string;
  progress?: number;
};

const SEGMENT_COLORS = [
  categoryThemes["my-plan"].accent,
  categoryThemes["career-fit"].accent,
  categoryThemes.learn.accent,
  categoryThemes["build-proof"].accent,
  categoryThemes["study-options"].accent,
  categoryThemes["weekly-plan"].accent2,
];

type JourneyChartProps = {
  segments: JourneySegment[];
  centerLabel: string;
  centerSub: string;
  size?: number;
  caption?: string;
};

export function JourneyChart({ segments, centerLabel, centerSub, size = 230, caption }: JourneyChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const stroke = size * 0.15;
  const radius = (size - stroke) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  let cursor = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg
        className="journey-pop shrink-0"
        height={size}
        role="img"
        aria-label={`Career journey: ${segments.map((s) => `${s.label} ${s.progress ?? Math.round((s.value / total) * 100)}%`).join(", ")}`}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        style={{ filter: "drop-shadow(0 10px 26px rgba(44,230,161,0.28))" }}
      >
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {segments.map((segment, index) => {
          const fraction = segment.value / total;
          const pct = segment.progress ?? Math.round(fraction * 100);
          const dash = Math.max(fraction * circumference - 5, 0.5);
          const offset = -(cursor / total) * circumference;
          cursor += segment.value;
          return (
            <circle
              key={segment.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={segment.color || SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            >
              <title>{`${segment.label}: ${pct}%${segment.hint ? `, ${segment.hint}` : ""}`}</title>
            </circle>
          );
        })}
        <text x={cx} y={cy - size * 0.02} textAnchor="middle" fill="var(--accent-value, #ffffff)" style={{ fontSize: size * 0.125, fontWeight: 700 }}>
          {centerLabel}
        </text>
        <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill="var(--accent-body, #b6cdd9)" style={{ fontSize: size * 0.058, letterSpacing: "0.04em" }}>
          {centerSub}
        </text>
      </svg>

      <div className="w-full flex-1">
        {caption ? <p className="aimura-role-body mb-3 text-sm leading-6">{caption}</p> : null}
        <ul className="space-y-3">
          {segments.map((segment, index) => {
            const pct = Math.round((segment.value / total) * 100);
            const color = segment.color || SEGMENT_COLORS[index % SEGMENT_COLORS.length];
            return (
              <li key={segment.label}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="font-medium" style={{ color }} title={segment.hint || segment.label}>{segment.label}</span>
                  <span className="ml-auto font-semibold" style={{ color }}>{pct}%</span>
                </div>
                <div className="mt-1.5 ml-6 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
                </div>
                {segment.hint ? <p className="ml-6 mt-1 text-xs leading-5 text-aimura-moss">{segment.hint}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Builds journey segments from a report's roadmap phases (weeks per phase).
export function roadmapToJourney(report: AimuraStudentReport): {
  segments: JourneySegment[];
  centerLabel: string;
  centerSub: string;
} {
  const lastRoadmapIndex = Math.max(0, report.roadmap.length - 1);
  let previousProgress = 0;
  const segments: JourneySegment[] = report.roadmap.map((step, index) => {
    const targetProgress = index === lastRoadmapIndex
      ? 90
      : Math.round(((index + 1) / Math.max(1, report.roadmap.length)) * 80);
    const value = Math.max(5, targetProgress - previousProgress);
    previousProgress = targetProgress;
    return {
      label: step.phase,
      value,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      hint: `${step.timeframe} · ${targetProgress}% readiness`,
      progress: targetProgress,
    };
  });
  segments.push({
    label: "Get the job",
    value: 10,
    color: categoryThemes["weekly-plan"].accent2,
    hint: "After interview success · 100% job-ready target",
    progress: 100,
  });
  return {
    segments,
    centerLabel: "100%",
    centerSub: "JOB READY",
  };
}

// A representative demo journey for the login page.
export const DEMO_JOURNEY: { segments: JourneySegment[]; centerLabel: string; centerSub: string } = {
  segments: [
    { label: "Learn foundations", value: 20, color: SEGMENT_COLORS[0], hint: "Weeks 1-4 · 20% readiness", progress: 20 },
    { label: "Build portfolio", value: 30, color: SEGMENT_COLORS[1], hint: "Weeks 5-12 · 50% readiness", progress: 50 },
    { label: "Apply & network", value: 25, color: SEGMENT_COLORS[2], hint: "Weeks 13-18 · 75% readiness", progress: 75 },
    { label: "Interview ready", value: 15, color: SEGMENT_COLORS[3], hint: "Weeks 19-24 · 90% readiness", progress: 90 },
    { label: "Get the job", value: 10, color: categoryThemes["weekly-plan"].accent2, hint: "After interviews · 100% target", progress: 100 },
  ],
  centerLabel: "100%",
  centerSub: "JOB READY",
};
