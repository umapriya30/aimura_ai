import unittest

from student_os import build_student_success_os


class StudentOSTests(unittest.TestCase):
    def test_ai_goal_builds_student_success_os_sections(self):
        profile = {
            "full_name": "Verification Student",
            "degree_stream": "Computer Science",
            "dream_role": "AI Engineer",
            "preferred_subjects": ["AI", "data", "coding"],
            "skills": ["Python", "SQL", "statistics"],
            "academic_projects": "Built a Python dashboard.",
            "preferred_countries": ["United Kingdom", "Germany"],
        }

        report = build_student_success_os(profile)

        self.assertEqual(
            report["student_os_profile"]["normalized_domain"],
            "Artificial Intelligence Engineering",
        )
        self.assertIn("learning_hub", report)
        self.assertIn("portfolio_builder", report)
        self.assertIn("mentor_guidance", report)
        self.assertIn("OpenAI", report["student_os_profile"]["paid_api_slots"])
        self.assertGreaterEqual(report["student_os_profile"]["skill_score"], 35)


if __name__ == "__main__":
    unittest.main()
