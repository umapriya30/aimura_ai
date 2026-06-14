"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, CircleDot, Loader2, Sparkles, X } from "lucide-react";
import { type CategoryTheme, categoryStyle } from "@/lib/category-theme";

export type ToastTone = "success" | "info" | "warning" | "error";

export type ToastState = {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
};

const toastToneClass: Record<ToastTone, string> = {
  success: "border-aimura-green/35 text-aimura-green",
  info: "border-aimura-blue/35 text-aimura-blue",
  warning: "border-yellow-300/35 text-yellow-200",
  error: "border-red-300/35 text-red-200",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="aimura-shell min-h-screen text-aimura-white" id="top">
      <div className="relative z-[1]">{children}</div>
    </main>
  );
}

export function GradientCard({
  children,
  className = "",
  theme,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  theme?: CategoryTheme;
  style?: CSSProperties;
}) {
  return (
    <div className={`aimura-gradient-card min-w-0 max-w-full rounded-card ${className}`} style={{ ...(theme ? categoryStyle(theme) : {}), ...style }}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  theme,
  icon: Icon,
  meta,
}: {
  title: string;
  description?: string;
  theme: CategoryTheme;
  icon?: LucideIcon;
  meta?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[1.15rem] border p-4 sm:p-5"
      style={{
        ...categoryStyle(theme),
        background: theme.headerGradient,
        borderColor: theme.border,
      }}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {Icon ? (
            <span className="aimura-category-icon size-11 shrink-0 rounded-2xl" style={categoryStyle(theme)}>
              <Icon className="size-5" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.2em]">
              {theme.eyebrow}
            </p>
            <h3 className="aimura-role-title mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{title}</h3>
            {description ? <p className="aimura-role-body mt-2 max-w-3xl text-sm leading-6">{description}</p> : null}
          </div>
        </div>
        {meta ? <div className="min-w-0 shrink-0 sm:max-w-[45%]">{meta}</div> : null}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  theme,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  theme: CategoryTheme;
}) {
  return (
    <div
      className="group min-w-0 max-w-full rounded-[1.1rem] border bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.055]"
      style={{ ...categoryStyle(theme), borderColor: theme.border, boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)" }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="aimura-category-icon size-10 rounded-2xl" style={categoryStyle(theme)}>
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="mt-1 size-2 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 18px ${theme.accent}` }} />
      </div>
      <p className="aimura-role-label mt-4 text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em]">{label}</p>
      <p className="aimura-role-value mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{value}</p>
      {detail ? <p className="aimura-role-body mt-2 line-clamp-2 text-sm leading-6">{detail}</p> : null}
    </div>
  );
}

export function InsightCard({
  label,
  title,
  body,
  icon: Icon,
  theme,
  action,
}: {
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
  theme: CategoryTheme;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 max-w-full rounded-[1.15rem] border border-aimura-line/60 bg-aimura-panel/45 p-4 transition hover:border-[var(--accent-border)] hover:bg-white/[0.045]" style={categoryStyle(theme)}>
      <div className="flex items-start gap-3">
        <span className="aimura-category-icon size-10 shrink-0 rounded-2xl" style={categoryStyle(theme)}>
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.18em]">{label}</p>
          <h4 className="aimura-role-title mt-2 break-words text-lg font-semibold tracking-[-0.02em]">{title}</h4>
          <p className="aimura-role-body mt-2 text-sm leading-6">{body}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="aimura-glass rounded-[1.5rem] p-6 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl border border-aimura-green/30 bg-aimura-green/10 text-aimura-green">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-xl font-semibold text-aimura-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-aimura-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(24rem,calc(100vw-2rem))]">
      <div className={`aimura-glass aimura-rise rounded-[1.1rem] border p-4 ${toastToneClass[toast.tone]}`} role="status">
        <div className="flex items-start gap-3">
          {toast.tone === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden /> : null}
          {toast.tone === "info" ? <CircleDot className="mt-0.5 size-5 shrink-0" aria-hidden /> : null}
          {toast.tone === "warning" || toast.tone === "error" ? <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden /> : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-aimura-white">{toast.title}</p>
            {toast.message ? <p className="mt-1 text-sm leading-5 text-aimura-muted">{toast.message}</p> : null}
          </div>
          <button
            aria-label="Dismiss notification"
            className="aimura-focus-ring rounded-full p-1 text-aimura-muted transition hover:text-aimura-white"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProgressHeader({
  sections,
  activeIndex,
  completedCount,
  progressPercent,
  theme,
}: {
  sections: Array<{ id: string; title: string; tab: string }>;
  activeIndex: number;
  completedCount: number;
  progressPercent: number;
  theme: CategoryTheme;
}) {
  const progress = Math.max(0, Math.min(100, progressPercent));
  const active = sections[activeIndex];

  return (
    <div className="rounded-[1.15rem] border border-aimura-line/70 bg-aimura-panel/45 p-4" style={categoryStyle(theme)}>
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.2em]">
            7-step intake
          </p>
          <h3 className="aimura-role-title mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{active.title}</h3>
          <p className="aimura-role-body mt-1 text-sm">
            Step {activeIndex + 1} of {sections.length} · {completedCount} completed · {Math.round(progress)}% answered
          </p>
        </div>
        <div className="aimura-role-value w-full rounded-control border px-4 py-2 text-center text-sm font-semibold sm:w-auto sm:min-w-[10rem]" style={{ borderColor: theme.border }}>
          {active.tab}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="aimura-progress-rail h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {sections.map((section, index) => {
          const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "idle";
          return (
            <span
              aria-label={`${section.title} ${state}`}
              className="h-1.5 rounded-full transition"
              key={section.id}
              style={{
                background:
                  state === "done" || state === "active"
                    ? `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`
                    : "rgb(255 255 255 / 0.12)",
                opacity: state === "active" ? 1 : state === "done" ? 0.72 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function IntakeStepCard({
  children,
  theme,
  helper,
}: {
  children: React.ReactNode;
  theme: CategoryTheme;
  helper?: string;
}) {
  return (
    <div className="aimura-rise min-w-0 max-w-full overflow-hidden rounded-[1.4rem] border bg-aimura-panel/38 p-4 sm:p-5" style={{ ...categoryStyle(theme), borderColor: theme.border }}>
      {helper ? <p className="aimura-role-body mb-4 text-sm leading-6">{helper}</p> : null}
      {children}
    </div>
  );
}

export function ActionButtonGroup({
  actions,
}: {
  actions: Array<{
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
    loading?: boolean;
  }>;
}) {
  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      {actions.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? "secondary";
        return (
          <button
            className={`aimura-focus-ring inline-flex w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-control px-4 py-2.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto ${
              variant === "primary"
                ? "aimura-green-glow bg-aimura-green text-aimura-black hover:bg-aimura-mint"
                : variant === "ghost"
                  ? "text-aimura-muted hover:text-aimura-white"
                  : "border border-aimura-moss/35 bg-aimura-panel/65 text-aimura-white hover:border-aimura-green/50"
            }`}
            disabled={action.disabled || action.loading}
            key={action.label}
            onClick={action.onClick}
            type="button"
          >
            {action.loading ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
            <span className="min-w-0 break-words">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
