"use client";

import { ExternalLink } from "lucide-react";
import { SafeLink } from "@/components/LinkGuard";
import { categoryStyle, categoryThemes } from "@/lib/category-theme";
import { type LiveResource } from "@/lib/student-os-types";

type LiveLearningHubProps = {
  resources: LiveResource[];
};

export function LiveLearningHub({ resources }: LiveLearningHubProps) {
  const theme = categoryThemes.learn;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {resources.map((resource) => (
        <SafeLink
          className="block w-full rounded-[1.25rem] border bg-aimura-panel/45 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.05]"
          description={resource.description}
          href={resource.url}
          key={`${resource.provider}-${resource.title}-${resource.url}`}
          label={`${resource.provider} · ${resource.format}`}
          style={{ ...categoryStyle(theme), borderColor: theme.border }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="aimura-role-title text-sm font-semibold">{resource.title}</p>
            <span className="aimura-role-value rounded-control px-3 py-1 text-xs font-medium" style={{ background: theme.soft }}>
              {resource.format}
            </span>
          </div>
          <p className="aimura-role-label mt-2 text-xs uppercase tracking-[0.18em]">{resource.provider}</p>
          <p className="aimura-role-body mt-3 text-sm leading-6">{resource.description}</p>
          <p className="aimura-role-value mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            <ExternalLink className="size-3.5" aria-hidden />
            Opens after you confirm
          </p>
        </SafeLink>
      ))}
    </div>
  );
}
