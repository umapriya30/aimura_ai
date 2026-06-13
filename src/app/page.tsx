"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { LoginLanding } from "@/components/LoginLanding";
import { MultiStepForm } from "@/components/MultiStepForm";
import { AppShell, GradientCard } from "@/components/PremiumUI";
import { ReportDashboard } from "@/components/ReportDashboard";
import { TopNav } from "@/components/TopNav";
import { type AimuraStudentReport, type AuthUser } from "@/lib/student-os-types";

export default function Home() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [report, setReport] = useState<AimuraStudentReport | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [latestActivity, setLatestActivity] = useState("Workspace ready.");

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem("aimura_user");
      const storedReport = window.localStorage.getItem("aimura_latest_report");
      const storedReportVersion = window.localStorage.getItem("aimura_latest_report_version");
      if (storedUser) setSessionUser(JSON.parse(storedUser) as AuthUser);
      if (storedReport && storedReportVersion === "student-os-v3") {
        const parsedReport = JSON.parse(storedReport) as AimuraStudentReport;
        setReport(parsedReport);
        setIsGenerated(true);
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
    window.localStorage.setItem("aimura_user", JSON.stringify(user));
    window.localStorage.setItem("aimura_token", token);
  }, []);

  const handleLogout = useCallback(() => {
    setLatestActivity("Logged out and cleared local session.");
    setSessionUser(null);
    setReport(null);
    setIsGenerated(false);
    window.localStorage.removeItem("aimura_user");
    window.localStorage.removeItem("aimura_token");
    window.localStorage.removeItem("aimura_latest_report");
    window.localStorage.removeItem("aimura_latest_report_version");
  }, []);

  const handleSessionInvalid = useCallback(() => {
    setLatestActivity("Session expired. Please sign in again.");
    setSessionUser(null);
    window.localStorage.removeItem("aimura_user");
    window.localStorage.removeItem("aimura_token");
  }, []);

  const handleReportGenerated = useCallback((nextReport: AimuraStudentReport) => {
    setReport(nextReport);
    setIsGenerated(true);
    setLatestActivity(`Generated roadmap for ${nextReport.studentName}.`);
    window.localStorage.setItem("aimura_latest_report", JSON.stringify(nextReport));
    window.localStorage.setItem("aimura_latest_report_version", "student-os-v3");
  }, []);

  // Avoid a flash of the login page before localStorage hydrates.
  if (!hydrated) {
    return <main className="aimura-shell min-h-screen" />;
  }

  if (!sessionUser) {
    return <LoginLanding onAuthSuccess={handleAuthSuccess} />;
  }

  const firstName = sessionUser.name.split(" ")[0] || "there";

  return (
    <AppShell>
      <TopNav
        hasReport={!!report}
        latestActivity={latestActivity || `Signed in as ${sessionUser.name}`}
        onJumpTo={scrollToSection}
        onLogout={handleLogout}
        sessionUser={sessionUser}
      />
      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 lg:px-12">
        <GradientCard className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">
              <Sparkles className="size-4" aria-hidden />
              {report ? "You're all set" : "You're in"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-aimura-white sm:text-4xl">
              Welcome, {firstName}. Your career OS is ready to build.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-aimura-muted">
              {report
                ? "Your Student OS is ready. Open the AI Mentor to plan your week, or revisit the intake to regenerate with new details."
                : "Best next step: complete the 2-minute intake below and generate your Student OS — career map, skill score, roadmap, and a live mentor."}
            </p>
          </div>
          <button
            className="aimura-focus-ring aimura-green-glow inline-flex items-center justify-center gap-2 rounded-control bg-aimura-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-aimura-mint"
            onClick={() => scrollToSection(report ? "report" : "wizard")}
            type="button"
          >
            {report ? <MessageSquare className="size-4" aria-hidden /> : null}
            {report ? "Open my roadmap" : "Start the intake"}
            {!report ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
        </GradientCard>
      </section>

      <MultiStepForm
        onSessionInvalid={handleSessionInvalid}
        onReportGenerated={handleReportGenerated}
        sessionUser={sessionUser}
      />
      <ReportDashboard isGenerated={isGenerated} onActivity={setLatestActivity} report={report} />
    </AppShell>
  );
}
