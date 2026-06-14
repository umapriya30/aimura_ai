"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ChevronDown, Circle, Sparkles } from "lucide-react";
import { useState } from "react";
import { type CategoryTheme, categoryStyle } from "@/lib/category-theme";

export type ModuleNavItem<Id extends string> = {
  id: Id;
  label: string;
  description: string;
  theme: CategoryTheme;
  icon: LucideIcon;
  status: "ready" | "active" | "locked" | "done";
  completion?: number;
};

type ModuleSidebarProps<Id extends string> = {
  items: Array<ModuleNavItem<Id>>;
  activeId: Id;
  onChange: (id: Id) => void;
};

const statusLabel: Record<ModuleNavItem<string>["status"], string> = {
  active: "Now",
  done: "Done",
  ready: "Ready",
  locked: "Soon",
};

export function ModuleSidebar<Id extends string>({ items, activeId, onChange }: ModuleSidebarProps<Id>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = items.find((item) => item.id === activeId) || items[0];
  const ActiveIcon = activeItem.icon;

  return (
    <>
      <div className="w-full min-w-0 max-w-full overflow-hidden lg:hidden">
        <button
          className="aimura-focus-ring flex w-full min-w-0 max-w-full items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-aimura-panel/70 p-3 text-left"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="aimura-category-icon size-10 shrink-0 rounded-2xl" style={categoryStyle(activeItem.theme)}>
              <ActiveIcon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="aimura-role-title block text-sm font-semibold" style={categoryStyle(activeItem.theme)}>{activeItem.label}</span>
              <span className="aimura-role-body block truncate text-xs" style={categoryStyle(activeItem.theme)}>{activeItem.description}</span>
            </span>
          </span>
          <ChevronDown className={`size-4 shrink-0 text-aimura-muted transition ${mobileOpen ? "rotate-180" : ""}`} aria-hidden />
        </button>

        <div className="mt-3 grid min-w-0 max-w-full grid-cols-2 gap-2">
          {items.map((item) => (
            <ModuleButton
              active={item.id === activeId}
              compact
              item={item}
              key={item.id}
              onClick={() => {
                onChange(item.id);
                setMobileOpen(false);
              }}
            />
          ))}
        </div>

        {mobileOpen ? (
          <div className="aimura-glass mt-3 grid w-full min-w-0 max-w-full gap-2 overflow-hidden rounded-[1.15rem] p-2">
            {items.map((item) => (
              <ModuleButton
                active={item.id === activeId}
                item={item}
                key={item.id}
                onClick={() => {
                  onChange(item.id);
                  setMobileOpen(false);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <aside className="aimura-glass sticky top-24 hidden max-h-[calc(100vh-7rem)] min-w-0 max-w-full overflow-y-auto rounded-[1.35rem] p-3 lg:block">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1">
          <span className="inline-flex size-8 items-center justify-center rounded-xl border border-aimura-green/30 bg-aimura-green/10 text-aimura-green">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aimura-green">Plan Sections</p>
            <p className="text-xs text-aimura-muted">Module navigator</p>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <ModuleButton active={item.id === activeId} item={item} key={item.id} onClick={() => onChange(item.id)} />
          ))}
        </div>
      </aside>
    </>
  );
}

function ModuleButton<Id extends string>({
  item,
  active,
  compact,
  onClick,
}: {
  item: ModuleNavItem<Id>;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      className={`aimura-focus-ring group relative min-w-0 max-w-full overflow-hidden rounded-[1rem] border text-left transition duration-200 ${
        compact ? "w-full px-3 py-2" : "w-full p-3"
      } ${
        active
          ? "bg-white/[0.07] text-aimura-white"
          : "border-white/10 bg-white/[0.025] text-aimura-muted hover:bg-white/[0.05] hover:text-aimura-white"
      }`}
      data-testid={`report-tab-${item.id}`}
      onClick={onClick}
      style={{
        ...categoryStyle(item.theme),
        borderColor: active ? item.theme.border : undefined,
        boxShadow: active ? item.theme.shadow : undefined,
      }}
      type="button"
    >
      <div className={`flex min-w-0 items-center gap-3 ${compact ? "" : "items-start"}`}>
        <span className={`${compact ? "size-8 rounded-xl" : "size-10 rounded-2xl"} aimura-category-icon shrink-0`} style={categoryStyle(item.theme)}>
          <Icon className={compact ? "size-3.5" : "size-4"} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className={`aimura-role-title min-w-0 flex-1 break-words font-semibold ${compact ? "text-xs leading-4" : "text-sm"}`}>{item.label}</span>
            {!compact ? (
              <span className="aimura-role-value ml-auto inline-flex shrink-0 items-center gap-1 rounded-control border px-2 py-0.5 text-[0.62rem] font-semibold" style={{ borderColor: item.theme.border }}>
                {item.status === "done" ? <CheckCircle2 className="size-3" aria-hidden /> : <Circle className="size-2 fill-current" aria-hidden />}
                {statusLabel[item.status]}
              </span>
            ) : null}
          </span>
          {!compact ? <span className="aimura-role-body mt-1 block text-xs leading-5">{item.description}</span> : null}
          {!compact && typeof item.completion === "number" ? (
            <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, item.completion))}%`,
                  background: `linear-gradient(90deg, ${item.theme.accent}, ${item.theme.accent2})`,
                }}
              />
            </span>
          ) : null}
        </span>
      </div>
      {active ? <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full" style={{ background: item.theme.accent }} /> : null}
    </button>
  );
}
