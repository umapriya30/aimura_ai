"""Prompt assembly for the Aimura AI reasoning flow."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Mapping, Sequence


PROMPT_PATH = Path("prompts/aimura_agent_prompt.txt")

REPORT_SECTIONS = [
    "student_summary",
    "student_os_profile",
    "top_recommended_fields",
    "why_this_fits",
    "why_this_may_not_fit",
    "learning_hub",
    "portfolio_builder",
    "mentor_guidance",
    "api_provider_plan",
    "database_storage_plan",
    "best_countries",
    "exams_needed",
    "university_targeting",
    "dream_role_reality_check",
    "university_skill_roadmap",
    "next_30_days_action_plan",
    "safety_disclaimer",
]

MANDATORY_DISCLAIMER = (
    "Aimura AI provides educational guidance based on publicly available "
    "information and general career patterns. This report does not guarantee "
    "university admission, visa approval, scholarship awards, salaries, or job "
    "offers. Final decisions depend on official university requirements, visa "
    "regulations, and employer criteria. Always verify information directly with "
    "universities, visa authorities, and potential employers."
)


def load_master_prompt(prompt_path: str | Path = PROMPT_PATH) -> str:
    """Load the versioned Aimura AI master prompt."""
    return Path(prompt_path).read_text(encoding="utf-8").strip()


def build_agent_messages(
    student_profile: Mapping[str, object],
    knowledge_context: Mapping[str, Sequence[Mapping[str, object]]],
    field_scores: Sequence[Mapping[str, object]],
    prompt_path: str | Path = PROMPT_PATH,
) -> list[dict[str, str]]:
    """Build deployment-compatible chat messages for the reasoning call."""
    return [
        {"role": "system", "content": load_master_prompt(prompt_path)},
        {
            "role": "user",
            "content": build_user_prompt(student_profile, knowledge_context, field_scores),
        },
    ]


def build_user_prompt(
    student_profile: Mapping[str, object],
    knowledge_context: Mapping[str, Sequence[Mapping[str, object]]],
    field_scores: Sequence[Mapping[str, object]],
) -> str:
    """Build the grounded user prompt sent to the Foundry-hosted model."""
    payload = {
        "student_profile": student_profile,
        "field_scores": list(field_scores),
        "filtered_knowledge_context": {
            dataset: list(records) for dataset, records in knowledge_context.items()
        },
    }

    return "\n\n".join(
        [
            "Generate an Aimura AI pathway report for the student below.",
            "Use the field scores as evidence, but refine the narrative with the filtered knowledge base context.",
            "Follow the required 10-step reasoning sequence from the system prompt before producing the final JSON.",
            "Do not invent official requirements, visa outcomes, admissions guarantees, scholarships, salaries, or job offers.",
            "For the university skill roadmap, provide month-by-month guidance for Year 1 and Year 2 of university.",
            "Return only valid JSON matching the required schema.",
            "Grounded input payload:",
            _to_json(payload),
        ]
    )


def expected_response_schema() -> dict[str, object]:
    """Return the structured JSON contract expected from the agent."""
    return {
        "student_summary": "string",
        "student_os_profile": {
            "student_name": "string",
            "normalized_domain": "string",
            "parent_domain": "string",
            "skill_score": "integer 0-100",
            "target_roles": ["string"],
            "required_skills": ["string"],
            "missing_skills": ["string"],
            "free_api_sources": ["string"],
            "paid_api_slots": ["string"],
        },
        "top_recommended_fields": [
            {
                "field": "string",
                "fit_score": "integer 0-100",
                "reason": "string",
            }
        ],
        "why_this_fits": ["string"],
        "why_this_may_not_fit": ["string"],
        "learning_hub": [
            {
                "title": "string",
                "provider": "string",
                "format": "string",
                "url": "string",
            }
        ],
        "portfolio_builder": {
            "project_ideas": ["string"],
            "github_checklist": ["string"],
            "linkedin_headline": "string",
            "resume_bullets": ["string"],
            "interview_topics": ["string"],
        },
        "mentor_guidance": [
            {
                "question": "string",
                "answer": "string",
            }
        ],
        "api_provider_plan": {
            "free_now": ["string"],
            "paid_later": ["string"],
        },
        "database_storage_plan": {
            "current": "string",
            "upgrade_path": ["string"],
            "portable_note": "string",
        },
        "best_countries": [
            {
                "country": "string",
                "rank": "integer",
                "cost_fit": "string",
                "career_outcome": "string",
                "visa_pathway": "string",
                "trade_off": "string",
            }
        ],
        "exams_needed": [
            {
                "exam": "string",
                "target_score": "string",
                "timeline": "string",
                "importance": "required | optional | program-specific",
            }
        ],
        "university_targeting": {
            "ambitious": ["string"],
            "moderate": ["string"],
            "safe": ["string"],
        },
        "dream_role_reality_check": {
            "achievability": "string",
            "timeline": "string",
            "entry_level_steps": ["string"],
        },
        "university_skill_roadmap": [
            {
                "period": "Year 1 Month 1",
                "skills": ["string"],
                "projects": ["string"],
                "internship_actions": ["string"],
                "linkedin_github_milestones": ["string"],
            }
        ],
        "next_30_days_action_plan": ["five specific actions"],
        "safety_disclaimer": MANDATORY_DISCLAIMER,
    }


def _to_json(value: object) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False)
