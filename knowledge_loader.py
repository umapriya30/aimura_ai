"""CSV knowledge base loading and relevance filtering for Aimura AI."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, Sequence

import pandas as pd


REQUIRED_FILES = {
    "fields": "fields.csv",
    "countries": "countries.csv",
    "exams": "exams.csv",
    "universities": "universities_sample.csv",
    "career_roles": "career_roles.csv",
}


@dataclass(frozen=True)
class KnowledgeBase:
    fields: pd.DataFrame
    countries: pd.DataFrame
    exams: pd.DataFrame
    universities: pd.DataFrame
    career_roles: pd.DataFrame


def load_knowledge_base(data_dir: str | Path = "data") -> KnowledgeBase:
    """Load all Aimura AI CSV knowledge base files."""
    root = Path(data_dir)
    missing = [filename for filename in REQUIRED_FILES.values() if not (root / filename).exists()]
    if missing:
        raise FileNotFoundError(f"Missing knowledge base files: {', '.join(missing)}")

    return KnowledgeBase(
        fields=pd.read_csv(root / REQUIRED_FILES["fields"]).fillna(""),
        countries=pd.read_csv(root / REQUIRED_FILES["countries"]).fillna(""),
        exams=pd.read_csv(root / REQUIRED_FILES["exams"]).fillna(""),
        universities=pd.read_csv(root / REQUIRED_FILES["universities"]).fillna(""),
        career_roles=pd.read_csv(root / REQUIRED_FILES["career_roles"]).fillna(""),
    )


def filter_relevant_context(
    student_profile: Mapping[str, object],
    knowledge_base: KnowledgeBase,
    field_scores: Sequence[Mapping[str, object]],
    max_rows_per_dataset: int = 8,
) -> dict[str, list[dict[str, object]]]:
    """Filter CSV records to the compact context needed by the reasoning agent."""
    preferred_countries = _phrases(student_profile.get("preferred_countries"))
    top_fields = _top_field_names(field_scores)
    top_field_phrases = set(_phrases(top_fields))
    dream_phrases = _phrases(student_profile.get("dream_role"), student_profile.get("dream_companies"))

    fields = _filter_fields(knowledge_base.fields, top_fields).head(max_rows_per_dataset)
    countries = _filter_countries(knowledge_base.countries, preferred_countries).head(
        max_rows_per_dataset
    )
    exams = _filter_by_columns(
        knowledge_base.exams,
        ["applicable_countries", "applicable_fields"],
        preferred_countries | top_field_phrases,
    ).head(max_rows_per_dataset)
    universities = _filter_universities(
        knowledge_base.universities, preferred_countries, top_field_phrases
    ).head(max_rows_per_dataset)
    career_roles = _filter_by_columns(
        knowledge_base.career_roles,
        ["role_name", "typical_dream_companies", "related_fields"],
        dream_phrases | top_field_phrases,
    ).head(max_rows_per_dataset)

    return {
        "fields": _records(fields),
        "countries": _records(countries),
        "exams": _records(exams),
        "universities": _records(universities),
        "career_roles": _records(career_roles),
    }


def _top_field_names(field_scores: Sequence[Mapping[str, object]]) -> list[str]:
    names = []
    for score in field_scores:
        try:
            overall = int(score.get("overall_score", 0))
        except (TypeError, ValueError):
            overall = 0
        if overall >= 50 and score.get("field"):
            names.append(str(score["field"]))
    return names[:5]


def _filter_fields(fields: pd.DataFrame, top_fields: Sequence[str]) -> pd.DataFrame:
    if not top_fields:
        return fields
    return _filter_by_columns(fields, ["field"], _phrases(top_fields))


def _filter_countries(countries: pd.DataFrame, preferred_countries: set[str]) -> pd.DataFrame:
    if not preferred_countries:
        return countries
    filtered = _filter_by_columns(countries, ["country"], preferred_countries)
    return filtered if not filtered.empty else countries


def _filter_universities(
    universities: pd.DataFrame, preferred_countries: set[str], top_fields: set[str]
) -> pd.DataFrame:
    if preferred_countries:
        universities = _filter_by_columns(universities, ["country"], preferred_countries)

    if not top_fields:
        return universities

    filtered = _filter_by_columns(universities, ["known_for_fields"], top_fields)
    return filtered if not filtered.empty else universities


def _filter_by_columns(
    dataframe: pd.DataFrame, columns: Sequence[str], needles: set[str]
) -> pd.DataFrame:
    if not needles:
        return dataframe

    mask = pd.Series(False, index=dataframe.index)
    for column in columns:
        if column not in dataframe.columns:
            continue
        mask = mask | dataframe[column].astype(str).apply(lambda value: _contains_any(value, needles))

    filtered = dataframe[mask]
    return filtered if not filtered.empty else dataframe


def _contains_any(value: str, needles: set[str]) -> bool:
    haystack = str(value).lower()
    return any(needle in haystack for needle in needles)


def _phrases(*values: object) -> set[str]:
    phrases: set[str] = set()
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            items = [value]
        elif isinstance(value, Mapping):
            items = value.values()
        elif isinstance(value, Sequence):
            items = value
        else:
            items = [value]

        for item in items:
            text = str(item).strip().lower()
            if text:
                phrases.add(text)
    return phrases


def _terms(*values: object) -> set[str]:
    terms: set[str] = set()
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            items = [value]
        elif isinstance(value, Mapping):
            items = value.values()
        elif isinstance(value, Sequence):
            items = value
        else:
            items = [value]

        for item in items:
            normalized = str(item).lower()
            for separator in [";", ",", "/", "|", "&"]:
                normalized = normalized.replace(separator, " ")
            terms.update(
                "".join(char for char in word if char.isalnum())
                for word in normalized.split()
                if len("".join(char for char in word if char.isalnum())) > 1
            )
    return terms


def _records(dataframe: pd.DataFrame) -> list[dict[str, object]]:
    return dataframe.to_dict(orient="records")
