"use client";

import { Download, Mail, Save, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, type ToastState } from "@/components/PremiumUI";
import { type AimuraStudentReport } from "@/lib/student-os-types";

type ExportActionsProps = {
  activeSectionLabel?: string;
  isGenerated: boolean;
  report?: AimuraStudentReport;
  reportTitle?: string;
  onActivity?: (message: string) => void;
};

type ExportAction = "download" | "save" | "share";

const buttonBase =
  "aimura-focus-ring inline-flex w-full items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto";

export function ExportActions({ activeSectionLabel, isGenerated, report, reportTitle, onActivity }: ExportActionsProps) {
  const [message, setMessage] = useState(
    isGenerated ? "Ready to export or share." : "Generate a report before exporting or sharing.",
  );
  const [runningAction, setRunningAction] = useState<ExportAction | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setMessage(isGenerated ? "Report actions are ready." : "Generate a report before exporting or sharing.");
  }, [isGenerated]);

  function notify(tone: ToastState["tone"], title: string, nextMessage?: string) {
    const activity = nextMessage || title;
    setToast({ id: Date.now(), tone, title, message: nextMessage });
    setMessage(activity);
    onActivity?.(activity);
  }

  async function runOnce(action: ExportAction, task: () => Promise<void> | void) {
    if (runningAction) return;
    if (!isGenerated) {
      notify("warning", "Generate your roadmap first", "Export tools unlock after Aimura creates a real report.");
      return;
    }

    setRunningAction(action);
    try {
      await task();
    } finally {
      window.setTimeout(() => setRunningAction(null), 500);
    }
  }

  const handleDownloadPdf = () =>
    runOnce("download", () => {
      if (!report) {
        notify("info", "Preparing PDF", "Opening the print dialog. Choose Save as PDF to download.");
        window.print();
        return;
      }

      const printWindow = window.open("", "_blank", "width=980,height=1200");
      if (!printWindow) {
        notify("warning", "Popup blocked", "Allow popups or use the browser print option to save the report as PDF.");
        window.print();
        return;
      }

      printWindow.document.open();
      printWindow.document.write(buildReportPrintHtml(report));
      printWindow.document.close();
      notify("info", "Preparing PDF", "A polished report view opened. Choose Save as PDF in the print dialog.");
      window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 450);
    });

  const handleSaveSession = () =>
    runOnce("save", () => {
      const savedSession = {
        activeSection: activeSectionLabel ?? "Student Summary",
        generated: isGenerated,
        reportTitle: reportTitle ?? "Aimura AI pathway report",
        savedAt: new Date().toISOString(),
        source: "Aimura AI local app",
      };

      window.localStorage.setItem("aimura-ai-session:v2", JSON.stringify(savedSession));
      notify("success", "Session saved", "Your current report state was saved locally in this browser.");
    });

  const handleShareEmail = () =>
    runOnce("share", () => {
      const subject = encodeURIComponent(reportTitle || "Aimura AI pathway report");
      const body = encodeURIComponent(
        [
          "Here is my generated Aimura AI pathway report.",
          "",
          `Current section: ${activeSectionLabel ?? "Student Summary"}`,
          "Report status: Generated",
          "",
          "Please verify admissions, visa, scholarship, and employment details with official sources.",
        ].join("\n"),
      );

      notify("info", "Share draft opened", "Opening your email app with a prepared message.");
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });

  return (
    <div className="print-hidden flex flex-col gap-3">
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <button
          className={`${buttonBase} aimura-green-glow bg-aimura-green text-aimura-black hover:bg-aimura-mint`}
          disabled={!!runningAction || !isGenerated}
          onClick={handleDownloadPdf}
          type="button"
        >
          <Download aria-hidden className="size-4" />
          {runningAction === "download" ? "Preparing..." : "Download PDF"}
        </button>
        <button
          className={`${buttonBase} border border-aimura-moss/40 bg-aimura-panel/75 text-aimura-white hover:border-aimura-green/60`}
          disabled={!!runningAction || !isGenerated}
          onClick={handleSaveSession}
          type="button"
        >
          <Save aria-hidden className="size-4" />
          {runningAction === "save" ? "Saving..." : "Save Session"}
        </button>
        <button
          className={`${buttonBase} border border-aimura-moss/40 bg-aimura-panel/75 text-aimura-white hover:border-aimura-green/60`}
          disabled={!!runningAction || !isGenerated}
          onClick={handleShareEmail}
          type="button"
        >
          <Mail aria-hidden className="size-4" />
          {runningAction === "share" ? "Opening..." : "Share via Email"}
        </button>
      </div>
      <p aria-live="polite" className="flex items-center gap-2 text-sm text-aimura-muted">
        <Share2 className="size-4 text-aimura-green" aria-hidden />
        {message}
      </p>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function buildReportPrintHtml(report: AimuraStudentReport) {
  const focus = Array.isArray(report.answers.helpFocus) && report.answers.helpFocus.length
    ? report.answers.helpFocus.join(", ")
    : "Complete Career Plan";
  const budget = `${report.answers.budgetCurrency || "selected currency"} ${report.answers.budgetRange || "not specified"}`;
  const roadmap = report.roadmap.map((step) => `
    <section class="phase">
      <div class="phase-top"><span>${escapeHtml(step.timeframe)}</span><strong>${escapeHtml(step.phase)}</strong></div>
      <p>${escapeHtml(step.focus)}</p>
      <ul>${step.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
    </section>
  `).join("");
  const universities = report.universityMatches.length
    ? report.universityMatches.map((match) => `
      <section class="mini">
        <strong>${escapeHtml(match.name)}</strong>
        <span>${escapeHtml(match.country)} · ${escapeHtml(match.tier)}</span>
        <p>${escapeHtml(match.fitReason)}</p>
      </section>
    `).join("")
    : `<section class="mini"><strong>No formal study path selected</strong><p>Aimura focused this report on coaching, flexible routes, and portfolio proof.</p></section>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(report.studentName)} Aimura AI Report</title>
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      /* Light, crisp, color-accented report — prints reliably on any printer
         (no dependence on "background graphics"), and never looks faded. */
      body { margin: 0; background: #ffffff; color: #0b1b2e; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      main { padding: 24px; background: #ffffff; }
      .hero { padding: 26px; border: 1px solid #cdeadd; border-top: 6px solid #12a06b; border-radius: 18px; background: #f2fbf7; }
      .card, .phase, .mini { border: 1px solid #dbe6f0; background: #ffffff; border-radius: 14px; }
      .eyebrow { color: #0f8a5b; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
      h1 { margin: 10px 0 12px; font-size: 32px; line-height: 1.05; letter-spacing: -.03em; color: #0b1b2e; }
      h2 { margin: 26px 0 12px; font-size: 19px; color: #0f6f8a; border-left: 4px solid #1aa6c4; padding-left: 10px; }
      p, li { color: #33485e; line-height: 1.58; font-size: 13px; }
      .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 18px; }
      .card { padding: 14px; min-height: 110px; border-top: 4px solid #2563eb; }
      .card span, .mini span { display: block; color: #2563eb; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
      .card strong { display: block; margin-top: 8px; color: #0b1b2e; font-size: 18px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .phase, .mini { padding: 16px; break-inside: avoid; border-left: 5px solid #12a06b; }
      .phase-top { display: flex; justify-content: space-between; gap: 12px; }
      .phase-top span { color: #b06f00; font-size: 12px; font-weight: 800; }
      .phase-top strong { color: #0f6f8a; }
      .mini { border-left-color: #2563eb; }
      .mini strong { color: #0b1b2e; }
      ul { margin: 10px 0 0; padding-left: 18px; }
      .safety { margin-top: 22px; border-left: 4px solid #d98a00; padding: 12px 16px; background: #fff7e6; border-radius: 12px; color: #7a4e00; }
      @media print { main { padding: 0; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Aimura AI Career Operating System</div>
        <h1>${escapeHtml(report.studentName)}, your roadmap is live.</h1>
        <p>${escapeHtml(report.summary)}</p>
        <p><strong>Focus requested:</strong> ${escapeHtml(focus)} · <strong>Generated:</strong> ${escapeHtml(new Date(report.generatedAt).toLocaleString())}</p>
        <div class="metrics">
          <div class="card"><span>Skill Score</span><strong>${report.skillScore}/100</strong><p>${escapeHtml(report.domainProfile.normalizedField)}</p></div>
          <div class="card"><span>Target Role</span><strong>${escapeHtml(report.domainProfile.targetRoles[0] || report.answers.dreamRole)}</strong><p>${escapeHtml(report.domainProfile.parentDomain)}</p></div>
          <div class="card"><span>Timeline</span><strong>${report.roadmap.length} phases</strong><p>24-week execution plan</p></div>
          <div class="card"><span>Top Gaps</span><strong>${report.domainProfile.missingSkills.length}</strong><p>${escapeHtml(report.domainProfile.missingSkills.slice(0, 3).join(", "))}</p></div>
          <div class="card"><span>Budget</span><strong>${escapeHtml(budget)}</strong><p>${escapeHtml(report.answers.studyLocationIntent || "Study preference not specified")}</p></div>
        </div>
      </section>

      <h2>Roadmap</h2>
      <div class="grid">${roadmap}</div>

      <h2>Career Intelligence</h2>
      <section class="phase">
        <strong>${escapeHtml(report.intelligence.headline)}</strong>
        <p>${escapeHtml(report.intelligence.fitSummary)}</p>
        <p><strong>Market:</strong> ${escapeHtml(report.intelligence.jobMarket.demandLevel)} · ${escapeHtml(report.intelligence.jobMarket.outlook)}</p>
      </section>

      <h2>Study Options</h2>
      <div class="grid">${universities}</div>

      <h2>Proof To Build</h2>
      <div class="grid">
        ${report.portfolioPlan.projectIdeas.slice(0, 4).map((project) => `<section class="mini"><strong>${escapeHtml(project.title)}</strong><p>${escapeHtml(project.outcome)}</p><span>${escapeHtml(project.stack.join(", "))}</span></section>`).join("")}
      </div>

      <div class="safety">${escapeHtml(report.safetyNote)}</div>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char] || char;
  });
}
