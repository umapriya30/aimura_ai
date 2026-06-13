"""End-to-end Aimura AI pathway generation pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Mapping

from agent import AimuraAgent
from knowledge_loader import filter_relevant_context, load_knowledge_base
from scorer import calculate_field_scores
from student_os import build_student_success_os


def generate_pathway_report(
    student_profile: Mapping[str, object],
    data_dir: str | Path = "data",
    agent: AimuraAgent | None = None,
) -> dict[str, object]:
    """Run scoring, retrieval, prompt/agent generation, and report assembly."""
    knowledge_base = load_knowledge_base(data_dir)
    field_records = knowledge_base.fields.to_dict(orient="records")
    field_scores = calculate_field_scores(student_profile, field_records)
    context = filter_relevant_context(student_profile, knowledge_base, field_scores)

    active_agent = agent or AimuraAgent()
    report = active_agent.generate_report(student_profile, context, field_scores)
    report.update(build_student_success_os(student_profile))
    report["field_scores"] = field_scores
    report["retrieved_context_counts"] = {
        dataset: len(records) for dataset, records in context.items()
    }
    return report
