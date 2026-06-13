import unittest

from scorer import calculate_field_scores


FIELDS = [
    {
        "field": "Data Science and AI",
        "required_strengths": "math,statistics,programming",
        "good_for": "coding, data, research, automation",
        "career_connections": "machine learning engineer; data scientist",
        "foundational_skills": "Python; SQL; statistics",
        "available_countries": "United Kingdom; Germany; Canada",
    },
    {
        "field": "Finance Analytics",
        "required_strengths": "math,finance,statistics",
        "good_for": "finance, markets, risk",
        "career_connections": "financial analyst; risk analyst",
        "foundational_skills": "Excel; accounting; statistics",
        "available_countries": "United Kingdom; United States",
    },
]


class ScorerTests(unittest.TestCase):
    def test_ranks_ai_for_ai_oriented_student(self):
        profile = {
            "marks": "8.4",
            "subjects": ["math", "computer science", "statistics"],
            "interests": ["coding", "data", "AI"],
            "dream_role": "Machine Learning Engineer",
            "preferred_countries": ["Germany", "United Kingdom"],
            "budget_range": "limited scholarship needed",
            "skills": ["Python", "SQL", "statistics"],
        }

        scores = calculate_field_scores(profile, FIELDS)

        self.assertEqual(scores[0]["field"], "Data Science and AI")
        self.assertGreater(scores[0]["overall_score"], scores[1]["overall_score"])
        self.assertGreaterEqual(scores[0]["skill_readiness"], 80)

    def test_scores_are_clamped_and_include_rationale(self):
        profile = {
            "marks": "99%",
            "subjects": ["finance", "math"],
            "interests": ["markets"],
            "dream_role": "Financial Analyst",
            "preferred_countries": ["United States"],
            "budget_range": "high flexible",
            "skills": ["Excel", "statistics"],
        }

        scores = calculate_field_scores(profile, FIELDS)

        for score in scores:
            self.assertGreaterEqual(score["overall_score"], 0)
            self.assertLessEqual(score["overall_score"], 100)
            self.assertIn("needs the most attention", score["rationale"])


if __name__ == "__main__":
    unittest.main()

