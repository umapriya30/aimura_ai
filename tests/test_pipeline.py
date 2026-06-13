import unittest

from agent import AimuraAgent, AzureFoundryConfig
from pipeline import generate_pathway_report
from prompt_builder import REPORT_SECTIONS


class PipelineTests(unittest.TestCase):
    def test_pipeline_generates_offline_report_from_local_data(self):
        profile = {
            "marks_cgpa": "8.4",
            "subjects": ["math", "computer science", "statistics"],
            "preferred_subjects": ["AI", "data", "coding"],
            "work_preferences": ["coding", "research"],
            "domain_preferences": ["AI", "analytics"],
            "dream_role": "Machine Learning Engineer",
            "dream_companies": ["Microsoft", "Google"],
            "preferred_countries": ["Germany", "United Kingdom"],
            "budget_range": "limited scholarship needed",
            "skills": ["Python", "SQL", "statistics"],
        }
        agent = AimuraAgent(
            AzureFoundryConfig(endpoint="", api_key="", deployment_name=""),
            use_azure=False,
        )

        report = generate_pathway_report(profile, agent=agent)

        for section in REPORT_SECTIONS:
            self.assertIn(section, report)
        self.assertEqual(report["generation_mode"], "offline_fallback")
        self.assertGreater(len(report["field_scores"]), 0)
        self.assertGreater(report["retrieved_context_counts"]["fields"], 0)
        self.assertIn("student_os_profile", report)
        self.assertIn("portfolio_builder", report)
        self.assertIn("learning_hub", report)
        self.assertIn("database_storage_plan", report)


if __name__ == "__main__":
    unittest.main()
