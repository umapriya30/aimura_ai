"""Student Success OS helpers shared by the Aimura AI Python backend."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class DomainRule:
    pattern_terms: tuple[str, ...]
    normalized_field: str
    parent_domain: str
    target_roles: tuple[str, ...]
    required_skills: tuple[str, ...]


DOMAIN_RULES = [
    DomainRule(
        pattern_terms=("ai", "artificial intelligence", "machine learning", "ml", "data science", "deep learning"),
        normalized_field="Artificial Intelligence Engineering",
        parent_domain="Computer Science",
        target_roles=("AI Engineer", "Machine Learning Engineer", "Data Scientist"),
        required_skills=("Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "MLOps", "System Design"),
    ),
    DomainRule(
        pattern_terms=("software", "developer", "web", "backend", "frontend", "full stack", "app"),
        normalized_field="Software Engineering",
        parent_domain="Computer Science",
        target_roles=("Software Engineer", "Full Stack Developer", "Backend Engineer"),
        required_skills=("JavaScript", "TypeScript", "Data Structures", "APIs", "Databases", "Testing", "Cloud"),
    ),
    DomainRule(
        pattern_terms=("cyber", "security", "soc", "ethical hacking", "network security"),
        normalized_field="Cybersecurity",
        parent_domain="Computer Science",
        target_roles=("Cybersecurity Analyst", "Cloud Security Engineer", "SOC Analyst"),
        required_skills=("Networking", "Linux", "Python", "Threat Analysis", "SIEM", "Cloud Security"),
    ),
    DomainRule(
        pattern_terms=("business analyst", "product analyst", "analytics", "data analyst", "bi"),
        normalized_field="Business Analytics",
        parent_domain="Business and Data",
        target_roles=("Business Analyst", "Product Analyst", "Data Analyst"),
        required_skills=("SQL", "Excel", "Statistics", "Dashboards", "Storytelling", "Experimentation"),
    ),
]


def build_student_success_os(student_profile: Mapping[str, object]) -> dict[str, object]:
    """Build deterministic Student Success OS sections for web and Streamlit reports."""
    rule = _match_domain_rule(student_profile)
    known_skills = _terms(
        student_profile.get("skills"),
        student_profile.get("academic_projects"),
        student_profile.get("projects"),
        student_profile.get("subjects"),
        student_profile.get("preferred_subjects"),
    )
    missing_skills = [
        skill for skill in rule.required_skills if skill.lower() not in known_skills
    ][:4] or ["Portfolio Projects", "Interview Readiness"]
    skill_score = _skill_score(rule, known_skills, student_profile)
    student_name = _profile_value(student_profile, "full_name", "Student")

    return {
        "student_os_profile": {
            "student_name": student_name,
            "normalized_domain": rule.normalized_field,
            "parent_domain": rule.parent_domain,
            "skill_score": skill_score,
            "target_roles": list(rule.target_roles),
            "required_skills": list(rule.required_skills),
            "missing_skills": missing_skills,
            "free_api_sources": ["Wikipedia", "OpenAlex", "GitHub", "Hipolabs", "REST Countries"],
            "paid_api_slots": ["OpenAI", "Groq", "Gemini", "Tavily", "SerpAPI", "YouTube Data API"],
        },
        "learning_hub": _learning_hub(rule),
        "portfolio_builder": _portfolio_builder(rule, student_name),
        "mentor_guidance": _mentor_guidance(rule, missing_skills, skill_score, student_profile),
        "api_provider_plan": {
            "free_now": [
                "Use public APIs and search links for reliable demos without keys.",
                "Fall back to local domain rules when an API is unavailable.",
            ],
            "paid_later": [
                "Route LLM reasoning through OpenAI, Groq, Gemini, or Azure when keys are configured.",
                "Use Tavily, SerpAPI, or YouTube Data API for richer metadata without changing the UI contract.",
            ],
        },
        "database_storage_plan": {
            "current": "Local JSON database for accounts and saved reports so GitHub downloads run without setup.",
            "upgrade_path": ["SQLite", "Supabase Postgres", "Firebase", "Neon/Postgres"],
            "portable_note": "No native database dependency is required for Mac, Windows, Linux, or phone-browser demos.",
        },
    }


def _match_domain_rule(student_profile: Mapping[str, object]) -> DomainRule:
    intent = " ".join(
        [
            _profile_value(student_profile, "dream_role", ""),
            _profile_value(student_profile, "degree_stream", ""),
            _profile_value(student_profile, "preferred_subjects", ""),
            _profile_value(student_profile, "domain_preferences", ""),
            _profile_value(student_profile, "career_priority", ""),
        ]
    ).lower()
    for rule in DOMAIN_RULES:
        if any(term in intent for term in rule.pattern_terms):
            return rule
    return DOMAIN_RULES[0]


def _skill_score(rule: DomainRule, known_skills: set[str], profile: Mapping[str, object]) -> int:
    matched = sum(1 for skill in rule.required_skills if skill.lower() in known_skills)
    project_bonus = 15 if _profile_value(profile, "academic_projects", "") or _profile_value(profile, "projects", "") else 0
    context_bonus = 10 if _profile_value(profile, "preferred_countries", "") else 0
    return max(35, min(96, 35 + round((matched / len(rule.required_skills)) * 40) + project_bonus + context_bonus))


def _learning_hub(rule: DomainRule) -> list[dict[str, str]]:
    query = rule.normalized_field.replace(" ", "%20")
    return [
        {
            "title": f"{rule.normalized_field} roadmap videos",
            "provider": "YouTube",
            "format": "video search",
            "url": f"https://www.youtube.com/results?search_query={query}%20roadmap",
        },
        {
            "title": f"{rule.normalized_field} guided courses",
            "provider": "Coursera",
            "format": "course search",
            "url": f"https://www.coursera.org/search?query={query}",
        },
        {
            "title": f"{rule.normalized_field} portfolio repositories",
            "provider": "GitHub",
            "format": "project search",
            "url": f"https://github.com/search?q={query}%20portfolio&type=repositories",
        },
        {
            "title": f"{rule.normalized_field} research signals",
            "provider": "OpenAlex",
            "format": "research search",
            "url": f"https://api.openalex.org/works?search={query}",
        },
    ]


def _portfolio_builder(rule: DomainRule, student_name: str) -> dict[str, object]:
    role = rule.target_roles[0]
    return {
        "project_ideas": [
            f"Build a {rule.normalized_field} starter project with a clean README and measurable result.",
            "Create a case study explaining problem, data, constraints, decisions, and limitations.",
            "Publish a small deployable demo so reviewers can try the work directly.",
        ],
        "github_checklist": [
            "Pin the best two repositories.",
            "Add screenshots, setup steps, and a limitations section.",
            "Include Mac, Windows, and browser/mobile demo notes.",
        ],
        "linkedin_headline": f"{student_name} | Aspiring {role} | {', '.join(rule.required_skills[:3])}",
        "resume_bullets": [
            f"Built a {rule.normalized_field} project using {', '.join(rule.required_skills[:3])}.",
            "Converted a student goal into a measurable learning and portfolio roadmap.",
        ],
        "interview_topics": [*rule.required_skills[:5], "Project storytelling", "Trade-offs"],
    }


def _mentor_guidance(
    rule: DomainRule,
    missing_skills: list[str],
    skill_score: int,
    student_profile: Mapping[str, object],
) -> list[dict[str, str]]:
    weekly_hours = _profile_value(student_profile, "weekly_study_hours", "6")
    return [
        {
            "question": "What should I learn first?",
            "answer": f"Start with {rule.required_skills[0]} and {rule.required_skills[1]} because they support the fastest path toward {rule.target_roles[0]}.",
        },
        {
            "question": "What should I do this week?",
            "answer": f"Use {weekly_hours} focused hours: learn one concept, build one small artifact, and document it publicly.",
        },
        {
            "question": "How strong is my profile?",
            "answer": f"Current Aimura skill score is {skill_score}/100. The biggest gaps are {', '.join(missing_skills)}.",
        },
    ]


def _profile_value(profile: Mapping[str, object], key: str, fallback: str) -> str:
    value = profile.get(key)
    if isinstance(value, str):
        return value.strip() or fallback
    if isinstance(value, Mapping):
        return ", ".join(str(item).strip() for item in value.values() if str(item).strip()) or fallback
    if isinstance(value, (list, tuple, set)):
        return ", ".join(str(item).strip() for item in value if str(item).strip()) or fallback
    return str(value).strip() if value else fallback


def _terms(*values: object) -> set[str]:
    words: set[str] = set()
    for value in values:
        text = str(value or "").lower()
        for separator in [",", ";", "/", "|", "&", "[", "]", "'", '"']:
            text = text.replace(separator, " ")
        words.update(word for word in text.split() if len(word) > 1)
    return words
