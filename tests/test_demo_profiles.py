import unittest

from scripts.verify_demo_profiles import load_demo_profiles, verify_profiles


class DemoProfileTests(unittest.TestCase):
    def test_demo_profiles_include_neutral_student_and_multiple_paths(self):
        profiles = load_demo_profiles()
        profile_ids = {profile["profile_id"] for profile in profiles}

        self.assertGreaterEqual(len(profiles), 3)
        self.assertIn("student-ai", profile_ids)
        self.assertIn("arjun-cyber", profile_ids)
        self.assertIn("mei-analytics", profile_ids)

    def test_demo_profiles_generate_required_reports(self):
        results = verify_profiles()

        self.assertEqual(len(results), 3)
        self.assertTrue(all("offline_fallback" in result for result in results))


if __name__ == "__main__":
    unittest.main()
