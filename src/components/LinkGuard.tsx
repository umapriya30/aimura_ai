"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ExternalLink, ShieldAlert, X } from "lucide-react";

type PendingLink = {
  href: string;
  label: string;
  description: string;
};

type LinkGuardContextValue = {
  requestNavigate: (link: PendingLink) => void;
};

const LinkGuardContext = createContext<LinkGuardContextValue | null>(null);

function hostOf(href: string) {
  try {
    return new URL(href).host;
  } catch {
    return href;
  }
}

export function LinkGuardProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingLink | null>(null);

  const requestNavigate = useCallback((link: PendingLink) => {
    setPending(link);
  }, []);

  const close = useCallback(() => setPending(null), []);

  const confirm = useCallback(() => {
    if (pending) {
      window.open(pending.href, "_blank", "noopener,noreferrer");
    }
    setPending(null);
  }, [pending]);

  const value = useMemo(() => ({ requestNavigate }), [requestNavigate]);

  return (
    <LinkGuardContext.Provider value={value}>
      {children}
      {pending ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-aimura-ink/45 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm leaving Aimura AI"
        >
          <div
            className="aimura-card w-full max-w-md rounded-[1.75rem] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-aimura-green/30 bg-aimura-green/10 text-aimura-green">
                <ShieldAlert className="size-5" aria-hidden />
              </span>
              <button
                className="aimura-focus-ring rounded-full p-1 text-aimura-muted transition hover:text-aimura-white"
                onClick={close}
                type="button"
                aria-label="Cancel"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-aimura-white">Open an external site?</h3>
            <p className="mt-2 text-sm leading-6 text-aimura-muted">{pending.description}</p>

            <div className="mt-4 rounded-2xl border border-aimura-moss/30 bg-aimura-panel-2 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-aimura-moss">{pending.label}</p>
              <p className="mt-1 break-all text-sm font-medium text-aimura-green">{pending.href}</p>
              <p className="mt-2 text-xs text-aimura-muted">You will leave Aimura AI and open {hostOf(pending.href)} in a new tab.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="aimura-focus-ring rounded-control border border-aimura-moss/50 px-5 py-2.5 text-sm font-semibold text-aimura-white transition hover:border-aimura-green"
                onClick={close}
                type="button"
              >
                Cancel
              </button>
              <button
                className="aimura-focus-ring aimura-green-glow inline-flex items-center justify-center gap-2 rounded-control bg-aimura-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-aimura-mint"
                onClick={confirm}
                type="button"
              >
                <ExternalLink className="size-4" aria-hidden />
                Open link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </LinkGuardContext.Provider>
  );
}

type SafeLinkProps = {
  href: string;
  label?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// Renders like a link, but routes every outbound click through a confirmation
// dialog so the user always approves leaving the app first.
export function SafeLink({ href, label, description, className, style, children }: SafeLinkProps) {
  const context = useContext(LinkGuardContext);

  const handleClick = () => {
    context?.requestNavigate({
      href,
      label: label ?? "External link",
      description:
        description ?? "This link opens a website outside Aimura AI. Review the address below before continuing.",
    });
  };

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  );
}
