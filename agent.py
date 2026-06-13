"""Cloud reasoning client and offline fallback for Aimura AI."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Mapping, Sequence

from prompt_builder import (
    MANDATORY_DISCLAIMER,
    REPORT_SECTIONS,
    build_agent_messages,
)
from student_os import build_student_success_os


DEFAULT_API_VERSION = "2024-10-21"


@dataclass(frozen=True)
class AzureFoundryConfig:
    endpoint: str = ""
    api_key: str = ""
    deployment_name: str = ""
    api_version: str = DEFAULT_API_VERSION

    @classmethod
    def from_env(cls) -> "AzureFoundryConfig":
        _load_dotenv_if_available()
        return cls(
            endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "").strip(),
            api_key=os.getenv("AZURE_OPENAI_KEY", "").strip(),
            deployment_name=os.getenv("AZURE_DEPLOYMENT_NAME", "").strip(),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", DEFAULT_API_VERSION).strip()
            or DEFAULT_API_VERSION,
        )

    @property
    def is_configured(self) -> bool:
        return bool(self.endpoint and self.api_key and self.deployment_name)


class AimuraAgent:
    """Generate Aimura AI pathway reports through cloud reasoning or offline fallback."""

    def __init__(self, config: AzureFoundryConfig | None = None, use_azure: bool = True):
        self.config = config or AzureFoundryConfig.from_env()
        self.use_azure = use_azure

    def generate_report(
        self,
        student_profile: Mapping[str, object],
        knowledge_context: Mapping[str, Sequence[Mapping[str, object]]],
        field_scores: Sequence[Mapping[str, object]],
    ) -> dict[str, object]:
        """Generate a structured pathway report."""
        if self.use_azure and self.config.is_configured:
            try:
                messages = build_agent_messages(student_profile, knowledge_context, field_scores)
                report = self._call_foundry(messages)
                report["generation_mode"] = "cloud"
                return report
            except Exception as exc:  # pragma: no cover - requires live Azure credentials.
                fallback = build_offline_report(student_profile, knowledge_context, field_scores)
                fallback["generation_mode"] = "offline_fallback"
                fallback["agent_warning"] = f"Cloud reasoning call failed: {exc}"
                return fallback

        fallback = build_offline_report(student_profile, knowledge_context, field_scores)
        fallback["generation_mode"] = "offline_fallback"
        return fallback

    def _call_foundry(self, messages: Sequence[Mapping[str, str]]) -> dict[str, object]:
        try:
            from openai import AzureOpenAI
        except ImportError as exc:  # pragma: no cover - depends on local environment.
            raise RuntimeError("Install the openai package to call cloud reasoning.") from exc

        client = AzureOpenAI(
            azure_endpoint=self.config.endpoint,
            api_key=self.config.api_key,
            api_version=self.config.api_version,
        )
        response = client.chat.completions.create(
            model=self.config.deployment_name,
            messages=list(messages),
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content or "{}"
        return parse_agent_response(content)


def parse_agent_response(content: str) -> dict[str, object]:
    """Parse and validate the JSON returned by the reasoning model."""
    cleaned = _strip_json_fence(content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Agent returned invalid JSON: {exc}") from exc

    missing = [section for section in REPORT_SECTIONS if section not in parsed]
    if missing:
        raise ValueError(f"Agent response missing report sections: {', '.join(missing)}")
    return parsed


def build_offline_report(
    student_profile: Mapping[str, object],
    knowledge_context: Mapping[str, Sequence[Mapping[str, object]]],
    field_scores: Sequence[Mapping[str, object]],
) -> dict[str, object]:
    """Build a deterministic report for local demos without Azure credentials."""
    top_fields = list(field_scores)[:3]
    best_field = str(top_fields[0].get("field", "the recommended field")) if top_fields else "the recommended field"
    dream_role = _profile_value(student_profile, "dream_role", "the target role")
    countries = _country_rows(knowledge_context.get("countries", []))
    exams = _exam_rows(knowledge_context.get("exams", []))
    universities = _university_tiers(knowledge_context.get("universities", []))
    student_os_sections = build_student_success_os(student_profile)

    return {
        "student_summary": (
            f"The student is targeting {dream_role} and shows the strongest current fit for "
            f"{best_field}. This report uses the local CSV knowledge base and weighted "
            "field scoring as grounded guidance."
        ),
        **student_os_sections,
        "top_recommended_fields": [
            {
                "field": str(score.get("field", "Unknown field")),
                "fit_score": int(score.get("overall_score", 0)),
                "reason": str(score.get("rationale", "Score calculated from profile alignment.")),
            }
            for score in top_fields
        ],
        "why_this_fits": [
            f"{best_field} aligns with the student's stated career target: {dream_role}.",
            "The recommendation uses academic, interest, career, country, budget, and skill-readiness signals.",
            "The filtered knowledge base keeps the advice focused on the student's preferred study context.",
        ],
        "why_this_may_not_fit": [
            "Admission requirements, visa rules, and scholarship availability can change and must be verified.",
            "The student may need additional portfolio projects, internships, or exam preparation before applying.",
            "Dream-company roles are competitive, so entry-level stepping stones should be planned early.",
        ],
        "best_countries": countries,
        "exams_needed": exams,
        "university_targeting": universities,
        "dream_role_reality_check": {
            "achievability": (
                f"{dream_role} is realistic as a medium-term goal if the student builds evidence "
                "through skills, projects, internships, and relevant coursework."
            ),
            "timeline": "Expect 1-4 years after graduation depending on role competitiveness and prior experience.",
            "entry_level_steps": [
                "Target internships connected to the top recommended field.",
                "Build two portfolio projects that show measurable outcomes.",
                "Apply for analyst, junior developer, or specialist entry roles before dream-company roles.",
            ],
        },
        "university_skill_roadmap": _roadmap(best_field, dream_role),
        "next_30_days_action_plan": [
            "Shortlist 6-9 programs across ambitious, moderate, and safe tiers.",
            "Verify official admission, English test, tuition, scholarship, and visa requirements.",
            "Create or update a LinkedIn profile and GitHub portfolio.",
            "Start one portfolio project aligned with the recommended field.",
            "Book a weekly study block for exam preparation or prerequisite skill gaps.",
        ],
        "safety_disclaimer": MANDATORY_DISCLAIMER,
    }


def _strip_json_fence(content: str) -> str:
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", content, flags=re.DOTALL)
    return match.group(1).strip() if match else content.strip()


def _profile_value(profile: Mapping[str, object], key: str, fallback: str) -> str:
    value = profile.get(key)
    if isinstance(value, Sequence) and not isinstance(value, str):
        return ", ".join(str(item) for item in value if str(item).strip()) or fallback
    return str(value).strip() if value else fallback


def _country_rows(records: Sequence[Mapping[str, object]]) -> list[dict[str, object]]:
    rows = []
    for index, record in enumerate(records[:5], 1):
        rows.append(
            {
                "country": str(record.get("country", "Unknown country")),
                "rank": index,
                "cost_fit": str(record.get("cost_level", "program-specific")),
                "career_outcome": str(record.get("career_strengths", "varies by field")),
                "visa_pathway": str(record.get("visa_pathway_quality", "verify officially")),
                "trade_off": str(record.get("main_weaknesses", "Confirm current rules.")),
            }
        )
    return rows


def _exam_rows(records: Sequence[Mapping[str, object]]) -> list[dict[str, object]]:
    rows = []
    for record in records[:5]:
        rows.append(
            {
                "exam": str(record.get("exam_name", "Program-specific requirement")),
                "target_score": str(record.get("typical_minimum_score", "Verify with university")),
                "timeline": str(record.get("preparation_time", "2-3 months")),
                "importance": str(record.get("importance", "program-specific")),
            }
        )
    return rows


def _university_tiers(records: Sequence[Mapping[str, object]]) -> dict[str, list[str]]:
    tiers = {"ambitious": [], "moderate": [], "safe": []}
    for record in records:
        tier = str(record.get("tier", "")).lower()
        if tier not in tiers:
            continue
        name = str(record.get("university_name", "Unknown university"))
        country = str(record.get("country", ""))
        cgpa = str(record.get("typical_cgpa_requirement", "program-specific"))
        tiers[tier].append(f"{name} ({country}) - typical CGPA {cgpa}")
    return tiers


def _roadmap(field: str, dream_role: str) -> list[dict[str, object]]:
    roadmap = []
    for year in [1, 2]:
        for month in range(1, 13):
            if month <= 3:
                skill_focus = f"Build foundations for {field}"
                project_focus = "Complete a guided mini-project"
            elif month <= 6:
                skill_focus = "Practice tools used in target roles"
                project_focus = "Publish a portfolio project with a clear README"
            elif month <= 9:
                skill_focus = "Deepen applied problem-solving"
                project_focus = "Work on a team or open-source project"
            else:
                skill_focus = "Prepare for internships and interviews"
                project_focus = f"Build a capstone aligned with {dream_role}"

            roadmap.append(
                {
                    "period": f"Year {year} Month {month}",
                    "skills": [skill_focus],
                    "projects": [project_focus],
                    "internship_actions": [
                        "Track relevant internships and note deadlines",
                        "Ask one mentor, professor, or senior student for feedback",
                    ],
                    "linkedin_github_milestones": [
                        "Post one learning update",
                        "Keep GitHub or portfolio evidence current",
                    ],
                }
            )
    return roadmap


def _load_dotenv_if_available() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv()
