import unittest

from knowledge_loader import filter_relevant_context, load_knowledge_base
from scorer import calculate_field_scores


class KnowledgeLoaderTests(unittest.TestCase):
    def test_loads_required_csv_files(self):
        knowledge_base = load_knowledge_base("data")

        self.assertGreaterEqual(len(knowledge_base.fields), 5)
        self.assertGreaterEqual(len(knowledge_base.countries), 5)
        self.assertGreaterEqual(len(knowledge_base.exams), 5)
        self.assertGreaterEqual(len(knowledge_base.universities), 3)
        self.assertGreaterEqual(len(knowledge_base.career_roles), 5)

    def test_filters_context_to_student_preferences(self):
        knowledge_base = load_knowledge_base("data")
        profile = {
            "marks": "8.2",
            "subjects": ["math", "computer science", "statistics"],
            "interests": ["AI", "data", "coding"],
            "dream_role": "Machine Learning Engineer",
            "dream_companies": ["Microsoft"],
            "preferred_countries": ["Germany", "United Kingdom"],
            "budget_range": "limited scholarship needed",
            "skills": ["Python", "SQL"],
        }
        field_scores = calculate_field_scores(
            profile, knowledge_base.fields.to_dict(orient="records")
        )

        context = filter_relevant_context(profile, knowledge_base, field_scores)

        country_names = {row["country"] for row in context["countries"]}
        field_names = {row["field"] for row in context["fields"]}
        role_names = {row["role_name"] for row in context["career_roles"]}

        self.assertEqual(country_names, {"Germany", "United Kingdom"})
        self.assertIn("Data Science and AI", field_names)
        self.assertIn("Machine Learning Engineer", role_names)
        self.assertLessEqual(len(context["fields"]), 5)


if __name__ == "__main__":
    unittest.main()

