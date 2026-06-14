"use client";

import { LogOut, MessageSquare, Route, Sparkles } from "lucide-react";
import { type AuthUser } from "@/lib/student-os-types";

export type WorkspaceView = "profile" | "results";

type TopNavProps = {
  sessionUser: AuthUser;
  latestActivity?: string;
  hasReport: boolean;
  onLogout: () => void;
  onJumpTo: (sectionId: string) => void;
  activeView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
};

export function TopNav({ sessionUser, latestActivity, hasReport, onLogout, onJumpTo, activeView, onNavigate }: TopNavProps) {
  const navButton = (view: WorkspaceView, label: string, Icon: typeof Route, disabled = false) => (
    <button
      className={`aimura-focus-ring inline-flex min-w-0 items-center justify-center gap-2 rounded-control border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-sm ${
        activeView === view
          ? "border-aimura-green/50 bg-aimura-green/10 text-aimura-white shadow-[0_0_28px_rgb(44_230_161_/_0.16)]"
          : "border-white/10 bg-white/[0.035] text-aimura-muted hover:border-aimura-green/40 hover:text-aimura-white"
      }`}
      disabled={disabled}
      onClick={() => onNavigate(view)}
      type="button"
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-aimura-ink/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:flex-nowrap lg:gap-4 lg:px-12">
        <button
          className="aimura-focus-ring flex items-center gap-3 text-left"
          onClick={() => onJumpTo("top")}
          type="button"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-aimura-green/30 bg-aimura-green/10 text-aimura-green shadow-[0_0_28px_rgb(44_230_161_/_0.18)]">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight text-aimura-white">Aimura AI</span>
            <span className="hidden text-xs text-aimura-muted sm:block">Career Operating System</span>
          </span>
        </button>

        <div className="order-last grid w-full grid-cols-2 items-center gap-2 pt-1 sm:w-auto sm:flex lg:order-none lg:pt-0">
          {navButton("profile", "Profile Intake", Route)}
          {navButton("results", hasReport ? "Focused Results" : "Results locked", MessageSquare, !hasReport)}
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden max-w-xs truncate rounded-control border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-aimura-muted md:block">
            {latestActivity || `Signed in as ${sessionUser.name}`}
          </div>
          <button
            className="aimura-focus-ring inline-flex items-center gap-2 rounded-control border border-aimura-moss/40 px-4 py-2 text-sm font-semibold text-aimura-white transition hover:border-aimura-green/60 hover:bg-aimura-green/10"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
