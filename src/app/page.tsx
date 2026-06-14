"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { LoginLanding } from "@/components/LoginLanding";
import { MultiStepForm } from "@/components/MultiStepForm";
import { AppShell, GradientCard } from "@/components/PremiumUI";
import { ReportDashboard } from "@/components/ReportDashboard";
import { TopNav, type WorkspaceView } from "@/components/TopNav";
import { type AimuraStudentReport, type AuthUser } from "@/lib/student-os-types";

export default function Home() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [report, setReport] = useState<AimuraStudentReport | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [latestActivity, setLatestActivity] = useState("Workspace ready.");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("profile");
  const [openMentorSignal, setOpenMentorSignal] = useState(0);
  const [initialAuthMode, setInitialAuthMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceLogin = params.get("auth") === "login";
      if (forceLogin) {
        setInitialAuthMode("login");
        window.localStorage.removeItem("aimura_user");
        window.localStorage.removeItem("aimura_token");
        window.localStorage.removeItem("aimura_latest_report");
        window.localStorage.removeItem("aimura_latest_report_version");
        setLatestActivity(
          params.get("activated") === "1"
            ? "Profile activated. Please log in."
            : params.get("reset") === "1"
              ? "Password updated. Please log in."
              : "Please log in.",
        );
        setHydrated(true);
        return;
      }

      const storedUser = window.localStorage.getItem("aimura_user");
      const storedReport = window.localStorage.getItem("aimura_latest_report");
      const storedReportVersion = window.localStorage.getItem("aimura_latest_report_version");
      if (storedUser) setSessionUser(JSON.parse(storedUser) as AuthUser);
      if (storedReport && storedReportVersion === "student-os-v3") {
        const parsedReport = JSON.parse(storedReport) as AimuraStudentReport;
        setReport(parsedReport);
        setIsGenerated(true);
        setWorkspaceView("results");
      } else {
        window.localStorage.removeItem("aimura_latest_report");
      }
    } catch {
      window.localStorage.removeItem("aimura_user");
      window.localStorage.removeItem("aimura_token");
      window.localStorage.removeItem("aimura_latest_report");
      window.localStorage.removeItem("aimura_latest_report_version");
    } finally {
      setHydrated(true);
    }
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleAuthSuccess = useCallback((user: AuthUser, token: string) => {
    setSessionUser(user);
    setWorkspaceView("profile");
    window.localStorage.setItem("aimura_user", JSON.stringify(user));
    window.localStorage.setItem("aimura_token", token);
  }, []);

  const handleLogout = useCallback(() => {
    setLatestActivity("Logged out and cleared local session.");
    setSessionUser(null);
    setReport(null);
    setIsGenerated(false);
    setWorkspaceView("profile");
    window.localStorage.removeItem("aimura_user");
    window.localStorage.removeItem("aimura_token");
    window.localStorage.removeItem("aimura_latest_report");
    window.localStorage.removeItem("aimura_latest_report_version");
  }, []);

  const handleSessionInvalid = useCallback(() => {
    setLatestActivity("Session expired. Please sign in again.");
    setSessionUser(null);
    setWorkspaceView("profile");
    window.localStorage.removeItem("aimura_user");
    window.localStorage.removeItem("aimura_token");
  }, []);

  const handleReportGenerated = useCallback((nextReport: AimuraStudentReport) => {
    setReport(nextReport);
    setIsGenerated(true);
    setWorkspaceView("results");
    setLatestActivity(`Generated roadmap for ${nextReport.studentName}.`);
    window.localStorage.setItem("aimura_latest_report", JSON.stringify(nextReport));
    window.localStorage.setItem("aimura_latest_report_version", "student-os-v3");
  }, []);

  const handleProfileReset = useCallback(() => {
    setReport(null);
    setIsGenerated(false);
    setWorkspaceView("profile");
    setLatestActivity("Profile intake reset. Start fresh when ready.");
    window.localStorage.removeItem("aimura_latest_report");
    window.localStorage.removeItem("aimura_latest_report_version");
  }, []);

  // Avoid a flash of the login page before localStorage hydrates.
  if (!hydrated) {
    return <main className="aimura-shell min-h-screen" />;
  }

  if (!sessionUser) {
    return <LoginLanding initialMode={initialAuthMode} onAuthSuccess={handleAuthSuccess} />;
  }

  const firstName = sessionUser.name.split(" ")[0] || "there";

  return (
    <AppShell>
      <TopNav
        hasReport={!!report}
        latestActivity={latestActivity || `Signed in as ${sessionUser.name}`}
        onJumpTo={scrollToSection}
        onLogout={handleLogout}
        activeView={workspaceView}
        onNavigate={(view) => {
          setWorkspaceView(view);
          scrollToSection("top");
        }}
        sessionUser={sessionUser}
      />
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 sm:pt-10 lg:px-12">
        <GradientCard className="flex min-w-0 flex-col justify-between gap-5 p-4 sm:p-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-aimura-green sm:tracking-[0.28em]">
              <Sparkles className="size-4" aria-hidden />
              {report ? "You're all set" : "You're in"}
            </p>
            <h1 className="mt-3 break-words text-3xl font-semibold tracking-[-0.04em] text-aimura-white sm:text-4xl">
              Welcome, {firstName}. Your career OS is ready to build.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-aimura-muted">
              {report
                ? "Your Student OS is ready. Open focused results, or return to Profile Intake any time to edit details and regenerate."
                : "Best next step: complete the 2-minute intake below and generate your Student OS — career map, skill score, roadmap, and a live mentor."}
            </p>
          </div>
          <button
            className="aimura-focus-ring aimura-green-glow inline-flex w-full items-center justify-center gap-2 rounded-control bg-aimura-green px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-aimura-mint sm:w-auto"
            onClick={() => {
              setWorkspaceView(report ? "results" : "profile");
              scrollToSection(report ? "report" : "wizard");
            }}
            type="button"
          >
            {report ? <MessageSquare className="size-4" aria-hidden /> : null}
            {report ? "Open focused results" : "Start the intake"}
            {!report ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
        </GradientCard>
      </section>

      {workspaceView === "profile" ? (
        <MultiStepForm
          onSessionInvalid={handleSessionInvalid}
          onReportGenerated={handleReportGenerated}
          onProfileReset={handleProfileReset}
          sessionUser={sessionUser}
        />
      ) : null}
      {workspaceView === "results" ? (
        <ReportDashboard isGenerated={isGenerated} onActivity={setLatestActivity} report={report} openMentorSignal={openMentorSignal} />
      ) : null}

      {report && report.answers.supportPreference !== "No help right now" ? (
        <button
          aria-label="Ask the AI mentor"
          className="aimura-focus-ring aimura-green-glow fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-control bg-aimura-green px-5 py-3.5 text-sm font-semibold text-aimura-black shadow-lg transition hover:bg-aimura-mint"
          onClick={() => {
            setWorkspaceView("results");
            setOpenMentorSignal((value) => value + 1);
            scrollToSection("report");
          }}
          type="button"
        >
          <MessageSquare className="size-5" aria-hidden />
          Ask AI Mentor
        </button>
      ) : null}
    </AppShell>
  );
}
