import type { CSSProperties } from "react";

export type CategoryId =
  | "my-plan"
  | "career-fit"
  | "learn"
  | "build-proof"
  | "study-options"
  | "weekly-plan"
  | "mentor";

export type CategoryTheme = {
  id: CategoryId;
  label: string;
  shortLabel: string;
  eyebrow: string;
  accent: string;
  accent2: string;
  soft: string;
  border: string;
  shadow: string;
  cta: string;
  iconTone: string;
  headerGradient: string;
  text: {
    label: string;
    title: string;
    value: string;
    body: string;
    subtle: string;
    meta: string;
  };
};

export const categoryThemes: Record<CategoryId, CategoryTheme> = {
  "my-plan": {
    id: "my-plan",
    label: "My Plan",
    shortLabel: "Plan",
    eyebrow: "Career command center",
    accent: "#2ce6a1",
    accent2: "#86f6c9",
    soft: "rgb(44 230 161 / 0.13)",
    border: "rgb(44 230 161 / 0.34)",
    shadow: "0 20px 58px rgb(44 230 161 / 0.18)",
    cta: "Continue Weekly Plan",
    iconTone: "emerald/mint",
    headerGradient: "linear-gradient(135deg, rgb(44 230 161 / 0.2), rgb(134 246 201 / 0.06))",
    text: {
      label: "#2ce6a1",
      title: "#dfffee",
      value: "#86f6c9",
      body: "#c5d9d2",
      subtle: "#8bb8a8",
      meta: "#b4ffe1",
    },
  },
  "career-fit": {
    id: "career-fit",
    label: "Career Fit",
    shortLabel: "Fit",
    eyebrow: "Market and role intelligence",
    accent: "#38d8ff",
    accent2: "#5eead4",
    soft: "rgb(56 216 255 / 0.12)",
    border: "rgb(56 216 255 / 0.32)",
    shadow: "0 20px 58px rgb(56 216 255 / 0.16)",
    cta: "Review Career Signals",
    iconTone: "blue/cyan",
    headerGradient: "linear-gradient(135deg, rgb(56 216 255 / 0.2), rgb(94 234 212 / 0.05))",
    text: {
      label: "#38d8ff",
      title: "#d8f6ff",
      value: "#5eead4",
      body: "#bfd8e8",
      subtle: "#88a9bd",
      meta: "#b8fbff",
    },
  },
  learn: {
    id: "learn",
    label: "Learn",
    shortLabel: "Learn",
    eyebrow: "Skill-building resources",
    accent: "#a78bfa",
    accent2: "#6366f1",
    soft: "rgb(167 139 250 / 0.13)",
    border: "rgb(167 139 250 / 0.34)",
    shadow: "0 20px 58px rgb(129 140 248 / 0.16)",
    cta: "Open Learning Hub",
    iconTone: "violet/indigo",
    headerGradient: "linear-gradient(135deg, rgb(167 139 250 / 0.2), rgb(99 102 241 / 0.05))",
    text: {
      label: "#a78bfa",
      title: "#eee8ff",
      value: "#c4b5fd",
      body: "#d0c9ea",
      subtle: "#a79bc8",
      meta: "#ddd6fe",
    },
  },
  "build-proof": {
    id: "build-proof",
    label: "Build Proof",
    shortLabel: "Proof",
    eyebrow: "Portfolio evidence",
    accent: "#fbbf24",
    accent2: "#fb923c",
    soft: "rgb(251 191 36 / 0.13)",
    border: "rgb(251 191 36 / 0.32)",
    shadow: "0 20px 58px rgb(251 146 60 / 0.15)",
    cta: "Build Portfolio Proof",
    iconTone: "amber/orange",
    headerGradient: "linear-gradient(135deg, rgb(251 191 36 / 0.2), rgb(251 146 60 / 0.05))",
    text: {
      label: "#fbbf24",
      title: "#fff2c7",
      value: "#fb923c",
      body: "#e8d2b4",
      subtle: "#c9a76e",
      meta: "#fde68a",
    },
  },
  "study-options": {
    id: "study-options",
    label: "Study Options",
    shortLabel: "Study",
    eyebrow: "University pathways",
    accent: "#5b8cff",
    accent2: "#8fb4ff",
    soft: "rgb(91 140 255 / 0.13)",
    border: "rgb(91 140 255 / 0.32)",
    shadow: "0 20px 58px rgb(91 140 255 / 0.16)",
    cta: "Compare Study Options",
    iconTone: "blue/azure",
    headerGradient: "linear-gradient(135deg, rgb(91 140 255 / 0.2), rgb(143 180 255 / 0.05))",
    text: {
      label: "#7da6ff",
      title: "#e6eeff",
      value: "#a9c5ff",
      body: "#c6d4ee",
      subtle: "#93a6cc",
      meta: "#cbdcff",
    },
  },
  "weekly-plan": {
    id: "weekly-plan",
    label: "Weekly Plan",
    shortLabel: "Weekly",
    eyebrow: "Execution timeline",
    accent: "#5eead4",
    accent2: "#bef264",
    soft: "rgb(94 234 212 / 0.13)",
    border: "rgb(94 234 212 / 0.32)",
    shadow: "0 20px 58px rgb(190 242 100 / 0.13)",
    cta: "Start This Week",
    iconTone: "teal/lime",
    headerGradient: "linear-gradient(135deg, rgb(94 234 212 / 0.2), rgb(190 242 100 / 0.05))",
    text: {
      label: "#5eead4",
      title: "#dcfff8",
      value: "#bef264",
      body: "#c7ded9",
      subtle: "#96bbb4",
      meta: "#d9f99d",
    },
  },
  mentor: {
    id: "mentor",
    label: "Mentor",
    shortLabel: "Mentor",
    eyebrow: "Live AI mentor",
    accent: "#818cf8",
    accent2: "#a5b4fc",
    soft: "rgb(129 140 248 / 0.13)",
    border: "rgb(129 140 248 / 0.32)",
    shadow: "0 20px 58px rgb(129 140 248 / 0.16)",
    cta: "Ask AI Mentor",
    iconTone: "indigo/periwinkle",
    headerGradient: "linear-gradient(135deg, rgb(129 140 248 / 0.2), rgb(165 180 252 / 0.05))",
    text: {
      label: "#9aa5ff",
      title: "#eaecff",
      value: "#c0c8ff",
      body: "#cdd2ee",
      subtle: "#9ba2c8",
      meta: "#d6dcff",
    },
  },
};

export function categoryStyle(theme: CategoryTheme): CSSProperties {
  return {
    "--accent": theme.accent,
    "--accent-2": theme.accent2,
    "--accent-soft": theme.soft,
    "--accent-border": theme.border,
    "--accent-shadow": theme.shadow,
    "--accent-header": theme.headerGradient,
    "--accent-label": theme.text.label,
    "--accent-title": theme.text.title,
    "--accent-value": theme.text.value,
    "--accent-body": theme.text.body,
    "--accent-subtle": theme.text.subtle,
    "--accent-meta": theme.text.meta,
  } as CSSProperties;
}
