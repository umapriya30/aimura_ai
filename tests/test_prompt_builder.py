import json
import unittest

from prompt_builder import (
    MANDATORY_DISCLAIMER,
    build_agent_messages,
    build_user_prompt,
    expected_response_schema,
    load_master_prompt,
)


class PromptBuilderTests(unittest.TestCase):
    def test_master_prompt_contains_required_constraints(self):
        prompt = load_master_prompt()

        self.assertIn("field-fit scores", prompt)
        self.assertIn("10-step sequence", prompt)
        self.assertIn("month-by-month", prompt)
        self.assertIn("does not guarantee university admission", prompt)

    def test_user_prompt_embeds_profile_context_and_scores(self):
        profile = {"dream_role": "Machine Learning Engineer"}
        context = {"fields": [{"field": "Data Science and AI"}]}
        scores = [{"field": "Data Science and AI", "overall_score": 88}]

        prompt = build_user_prompt(profile, context, scores)

        self.assertIn("Machine Learning Engineer", prompt)
        self.assertIn("Data Science and AI", prompt)
        self.assertIn("Return only valid JSON", prompt)
        json_blob = prompt.split("Grounded input payload:\n", 1)[1]
        parsed = json.loads(json_blob)
        self.assertEqual(parsed["field_scores"][0]["overall_score"], 88)

    def test_agent_messages_are_chat_completion_compatible(self):
        messages = build_agent_messages(
            {"dream_role": "Data Scientist"},
            {"career_roles": [{"role_name": "Data Scientist"}]},
            [{"field": "Data Science and AI", "overall_score": 90}],
        )

        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(messages[1]["role"], "user")
        self.assertIn("Data Scientist", messages[1]["content"])

    def test_schema_contains_all_report_sections_and_disclaimer(self):
        schema = expected_response_schema()

        self.assertIn("university_skill_roadmap", schema)
        self.assertEqual(schema["safety_disclaimer"], MANDATORY_DISCLAIMER)


if __name__ == "__main__":
    unittest.main()
