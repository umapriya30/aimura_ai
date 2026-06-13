"""Run local Aimura AI demo profile verification."""

from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from agent import AimuraAgent, AzureFoundryConfig
from pipeline import generate_pathway_report
from prompt_builder import MANDATORY_DISCLAIMER, REPORT_SECTIONS


LIST_FIELDS = {
    "subjects",
    "preferred_subjects",
    "work_preferences",
    "domain_preferences",
    "dream_companies",
    "preferred_countries",
    "language_comfort",
    "skills",
}


def load_demo_profiles(path: Path = ROOT / "examples" / "demo_profiles.csv") -> list[dict[str, object]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    profiles: list[dict[str, object]] = []
    for row in rows:
        profile: dict[str, object] = {}
        for key, value in row.items():
            if key in LIST_FIELDS:
                profile[key] = [item.strip() for item in value.split(";") if item.strip()]
            else:
                profile[key] = value
        profiles.append(profile)
    return profiles


def verify_profiles() -> list[str]:
    agent = AimuraAgent(
        AzureFoundryConfig(endpoint="", api_key="", deployment_name=""),
        use_azure=False,
    )
    results = []
    for profile in load_demo_profiles():
        report = generate_pathway_report(profile, agent=agent)
        missing = [section for section in REPORT_SECTIONS if section not in report]
        if missing:
            raise AssertionError(f"{profile['profile_id']} missing sections: {missing}")
        if report["safety_disclaimer"] != MANDATORY_DISCLAIMER:
            raise AssertionError(f"{profile['profile_id']} has incorrect safety disclaimer")
        results.append(f"{profile['profile_id']}: {report['generation_mode']}")
    return results


if __name__ == "__main__":
    for result in verify_profiles():
        print(result)
