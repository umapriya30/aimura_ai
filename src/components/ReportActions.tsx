"use client";

import { Download, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";

type ReportActionsProps = {
  activeSectionLabel?: string;
  isGenerated: boolean;
};

const actionBaseClass =
  "aimura-focus-ring inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition";

export function ReportActions({
  activeSectionLabel,
  isGenerated,
}: ReportActionsProps) {
  const [message, setMessage] = useState(
    isGenerated
      ? "Ready to export or share."
      : "Generate a report before exporting or sharing.",
  );

  useEffect(() => {
    setMessage(
      isGenerated
        ? "Ready to export or share the generated report."
        : "Generate a report before exporting or sharing.",
    );
  }, [isGenerated]);

  const handleDownloadPdf = () => {
    setMessage("Opening print dialog. Choose Save as PDF to download.");
    window.print();
  };

  const handleSaveSession = () => {
    const savedSession = {
      activeSection: activeSectionLabel ?? "Student Summary",
      generated: isGenerated,
      savedAt: new Date().toISOString(),
      source: "Aimura AI local app",
    };

    window.localStorage.setItem(
      "aimura-ai-session:v1",
      JSON.stringify(savedSession),
    );
    setMessage("Session saved locally in this browser.");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Aimura AI pathway report");
    const body = encodeURIComponent(
      [
        isGenerated
          ? "Here is my generated Aimura AI pathway report."
          : "I am preparing an Aimura AI pathway report.",
        "",
        `Current section: ${activeSectionLabel ?? "Not generated yet"}`,
        `Report status: ${isGenerated ? "Generated" : "Not generated yet"}`,
        "",
        "Please verify admissions, visa, scholarship, and employment details with official sources.",
      ].join("\n"),
    );

    setMessage("Opening your email app with a drafted share message.");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          className={`${actionBaseClass} bg-aimura-green text-white hover:bg-aimura-mint`}
          onClick={handleDownloadPdf}
          type="button"
        >
          <Download aria-hidden="true" className="size-4" />
          Download PDF
        </button>
        <button
          className={`${actionBaseClass} border border-aimura-moss/40 bg-aimura-panel text-aimura-white hover:border-aimura-green/60`}
          onClick={handleSaveSession}
          type="button"
        >
          <Save aria-hidden="true" className="size-4" />
          Save Session
        </button>
        <button
          className={`${actionBaseClass} border border-aimura-moss/40 bg-aimura-panel text-aimura-white hover:border-aimura-green/60`}
          onClick={handleShareEmail}
          type="button"
        >
          <Mail aria-hidden="true" className="size-4" />
          Share via Email
        </button>
      </div>
      <p aria-live="polite" className="text-sm text-aimura-muted">
        {message}
      </p>
    </div>
  );
}
