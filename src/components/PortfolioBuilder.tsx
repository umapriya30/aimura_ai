"use client";

import { Layers3 } from "lucide-react";
import { categoryStyle, categoryThemes } from "@/lib/category-theme";
import { type PortfolioPlan } from "@/lib/student-os-types";

type PortfolioBuilderProps = {
  portfolio: PortfolioPlan;
};

export function PortfolioBuilder({ portfolio }: PortfolioBuilderProps) {
  const theme = categoryThemes["build-proof"];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {portfolio.projectIdeas.map((project) => (
          <div
            className="rounded-[1.25rem] border bg-aimura-panel/45 p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.05]"
            key={project.title}
            style={{ ...categoryStyle(theme), borderColor: theme.border }}
          >
            <span className="aimura-category-icon mb-4 size-10 rounded-2xl" style={categoryStyle(theme)}>
              <Layers3 className="size-4" aria-hidden />
            </span>
            <p className="aimura-role-title text-sm font-semibold">{project.title}</p>
            <p className="aimura-role-body mt-3 text-sm leading-6">{project.outcome}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span className="aimura-role-meta rounded-control border px-3 py-1 text-xs" key={`${project.title}-${item}`} style={{ borderColor: theme.border }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Checklist title="Portfolio checklist" values={portfolio.githubChecklist} />
        <Checklist title="Interview topics" values={portfolio.interviewTopics} />
      </div>

      <div className="rounded-[1.25rem] border p-4" style={{ background: theme.soft, borderColor: theme.border }}>
        <p className="aimura-role-label text-xs uppercase tracking-[0.2em]" style={categoryStyle(theme)}>LinkedIn headline</p>
        <p className="aimura-role-title mt-2 text-base font-semibold" style={categoryStyle(theme)}>{portfolio.linkedInHeadline}</p>
      </div>

      <Checklist title="Resume bullets" values={portfolio.resumeBullets} />
    </div>
  );
}

function Checklist({ title, values }: { title: string; values: string[] }) {
  const theme = categoryThemes["build-proof"];
  return (
    <div className="rounded-[1.25rem] border bg-aimura-panel/45 p-4" style={{ borderColor: theme.border }}>
      <p className="aimura-role-label text-sm font-semibold uppercase tracking-[0.18em]" style={categoryStyle(theme)}>{title}</p>
      <ul className="aimura-role-body mt-3 space-y-2 text-sm leading-6" style={categoryStyle(theme)}>
        {values.map((value) => (
          <li key={`${title}-${value}`}>- {value}</li>
        ))}
      </ul>
    </div>
  );
}
