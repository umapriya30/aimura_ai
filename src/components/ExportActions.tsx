"use client";

import { Download, Mail, Save, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, type ToastState } from "@/components/PremiumUI";

type ExportActionsProps = {
  activeSectionLabel?: string;
  isGenerated: boolean;
  reportTitle?: string;
  onActivity?: (message: string) => void;
};

type ExportAction = "download" | "save" | "share";

const buttonBase =
  "aimura-focus-ring inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45";

export function ExportActions({ activeSectionLabel, isGenerated, reportTitle, onActivity }: ExportActionsProps) {
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
      notify("info", "Preparing PDF", "Opening the print dialog. Choose Save as PDF to download.");
      window.print();
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
      <div className="flex flex-wrap gap-2">
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
