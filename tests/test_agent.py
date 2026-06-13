import json
import unittest

from agent import AimuraAgent, AzureFoundryConfig, build_offline_report, parse_agent_response
from prompt_builder import MANDATORY_DISCLAIMER, REPORT_SECTIONS


def complete_report():
    report = build_offline_report(
        {"dream_role": "Machine Learning Engineer"},
        {
            "countries": [{"country": "Germany", "cost_level": "medium"}],
            "exams": [{"exam_name": "IELTS", "typical_minimum_score": "6.5"}],
            "universities": [
                {"university_name": "TUM", "country": "Germany", "tier": "ambitious"}
            ],
        },
        [{"field": "Data Science and AI", "overall_score": 88}],
    )
    return report


class AgentTests(unittest.TestCase):
    def test_parse_agent_response_accepts_json_fence(self):
        report = complete_report()
        parsed = parse_agent_response("```json\n" + json.dumps(report) + "\n```")

        self.assertEqual(parsed["safety_disclaimer"], MANDATORY_DISCLAIMER)

    def test_parse_agent_response_rejects_missing_sections(self):
        with self.assertRaisesRegex(ValueError, "missing report sections"):
            parse_agent_response('{"student_summary": "Only one section"}')

    def test_offline_report_contains_required_sections_and_roadmap(self):
        report = complete_report()

        for section in REPORT_SECTIONS:
            self.assertIn(section, report)
        self.assertEqual(len(report["university_skill_roadmap"]), 24)
        self.assertIn("does not guarantee", report["safety_disclaimer"])

    def test_agent_uses_offline_fallback_without_credentials(self):
        agent = AimuraAgent(
            AzureFoundryConfig(endpoint="", api_key="", deployment_name=""),
            use_azure=True,
        )
        report = agent.generate_report(
            {"dream_role": "Data Scientist"},
            {"countries": [], "exams": [], "universities": []},
            [{"field": "Data Science and AI", "overall_score": 90}],
        )

        self.assertEqual(report["generation_mode"], "offline_fallback")


if __name__ == "__main__":
    unittest.main()
