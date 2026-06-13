"""Weighted field-fit scoring for Aimura AI."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Mapping, Sequence


WEIGHTS = {
    "academic_match": 0.25,
    "interest_match": 0.25,
    "career_goal_match": 0.20,
    "budget_country_fit": 0.15,
    "skill_readiness": 0.15,
}


@dataclass(frozen=True)
class FieldScore:
    """Score details for one academic field."""

    field: str
    overall_score: int
    academic_match: int
    interest_match: int
    career_goal_match: int
    budget_country_fit: int
    skill_readiness: int
    rationale: str

    def as_dict(self) -> dict[str, object]:
        return {
            "field": self.field,
            "overall_score": self.overall_score,
            "academic_match": self.academic_match,
            "interest_match": self.interest_match,
            "career_goal_match": self.career_goal_match,
            "budget_country_fit": self.budget_country_fit,
            "skill_readiness": self.skill_readiness,
            "rationale": self.rationale,
        }


def calculate_field_scores(
    student_profile: Mapping[str, object],
    fields: Sequence[Mapping[str, object]],
) -> list[dict[str, object]]:
    """Calculate ranked fit scores for candidate academic fields."""
    scores = [_score_field(student_profile, field).as_dict() for field in fields]
    return sorted(scores, key=lambda row: row["overall_score"], reverse=True)


def _score_field(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> FieldScore:
    academic = _academic_match(student_profile, field)
    interest = _interest_match(student_profile, field)
    career = _career_match(student_profile, field)
    budget_country = _budget_country_fit(student_profile, field)
    skills = _skill_readiness(student_profile, field)

    overall = round(
        academic * WEIGHTS["academic_match"]
        + interest * WEIGHTS["interest_match"]
        + career * WEIGHTS["career_goal_match"]
        + budget_country * WEIGHTS["budget_country_fit"]
        + skills * WEIGHTS["skill_readiness"]
    )
    field_name = _text(field.get("field") or field.get("field_name") or "Unknown field")

    return FieldScore(
        field=field_name,
        overall_score=_clamp(overall),
        academic_match=academic,
        interest_match=interest,
        career_goal_match=career,
        budget_country_fit=budget_country,
        skill_readiness=skills,
        rationale=_rationale(field_name, academic, interest, career, budget_country, skills),
    )


def _academic_match(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> int:
    marks_score = _marks_score(student_profile)
    subject_terms = _terms(
        student_profile.get("subjects"),
        student_profile.get("degree_stream"),
        student_profile.get("education_level"),
    )
    requirement_terms = _terms(field.get("required_strengths"), field.get("field"))
    overlap = _overlap_score(subject_terms, requirement_terms)
    return _clamp(round(marks_score * 0.6 + overlap * 0.4))


def _interest_match(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> int:
    interest_terms = _terms(
        student_profile.get("interests"),
        student_profile.get("preferred_subjects"),
        student_profile.get("work_preferences"),
        student_profile.get("domain_preferences"),
    )
    field_terms = _terms(field.get("field"), field.get("good_for"), field.get("career_connections"))
    return _overlap_score(interest_terms, field_terms, default=45)


def _career_match(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> int:
    goal_terms = _terms(
        student_profile.get("dream_role"),
        student_profile.get("dream_companies"),
        student_profile.get("career_priority"),
    )
    field_terms = _terms(field.get("field"), field.get("career_connections"), field.get("good_for"))
    return _overlap_score(goal_terms, field_terms, default=45)


def _budget_country_fit(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> int:
    preferred = _terms(student_profile.get("preferred_countries"))
    available = _terms(field.get("available_countries"))
    country_score = _overlap_score(preferred, available, default=60)

    budget = _text(student_profile.get("budget_range") or student_profile.get("budget"))
    if not budget:
        return country_score

    affordability = 60
    low_budget_markers = {"low", "limited", "scholarship", "under"}
    high_budget_markers = {"high", "flexible", "self-funded", "premium"}
    available_text = _text(field.get("available_countries")).lower()

    if any(marker in budget.lower() for marker in low_budget_markers):
        affordability = 85 if "germany" in available_text else 55
    elif any(marker in budget.lower() for marker in high_budget_markers):
        affordability = 80

    return _clamp(round(country_score * 0.65 + affordability * 0.35))


def _skill_readiness(
    student_profile: Mapping[str, object], field: Mapping[str, object]
) -> int:
    student_terms = _terms(
        student_profile.get("skills"),
        student_profile.get("projects"),
        student_profile.get("subjects"),
    )
    field_terms = _terms(field.get("foundational_skills"), field.get("required_strengths"))
    return _overlap_score(student_terms, field_terms, default=45)


def _marks_score(student_profile: Mapping[str, object]) -> int:
    raw = student_profile.get("marks") or student_profile.get("marks_cgpa") or student_profile.get("cgpa")
    try:
        value = float(str(raw).replace("%", "").strip())
    except (TypeError, ValueError):
        return 55

    if value <= 10:
        value *= 10
    return _clamp(round(value))


def _overlap_score(set_a: set[str], set_b: set[str], default: int = 50) -> int:
    if not set_a or not set_b:
        return default

    matches = set_a & set_b
    if not matches:
        return 35

    coverage = len(matches) / max(1, min(len(set_a), len(set_b)))
    return _clamp(round(45 + coverage * 55))


def _terms(*values: object) -> set[str]:
    words: set[str] = set()
    for value in values:
        for piece in _flatten(value):
            normalized = _text(piece).lower()
            for separator in [";", ",", "/", "|", "&"]:
                normalized = normalized.replace(separator, " ")
            for word in normalized.split():
                cleaned = "".join(char for char in word if char.isalnum())
                if len(cleaned) > 1:
                    words.add(cleaned)
    return words


def _flatten(value: object) -> Iterable[object]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, Mapping):
        return value.values()
    if isinstance(value, Iterable):
        return value
    return [value]


def _text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _clamp(value: int) -> int:
    return max(0, min(100, value))


def _rationale(
    field_name: str,
    academic: int,
    interest: int,
    career: int,
    budget_country: int,
    skills: int,
) -> str:
    strongest = max(
        [
            ("academic fit", academic),
            ("interest alignment", interest),
            ("career relevance", career),
            ("country and budget fit", budget_country),
            ("skill readiness", skills),
        ],
        key=lambda item: item[1],
    )
    weakest = min(
        [
            ("academic fit", academic),
            ("interest alignment", interest),
            ("career relevance", career),
            ("country and budget fit", budget_country),
            ("skill readiness", skills),
        ],
        key=lambda item: item[1],
    )
    return (
        f"{field_name} is strongest on {strongest[0]} ({strongest[1]}/100) "
        f"and needs the most attention on {weakest[0]} ({weakest[1]}/100)."
    )
