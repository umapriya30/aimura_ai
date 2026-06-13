import unittest

from app import (
    INTAKE_SECTIONS,
    REPORT_RENDER_SECTIONS,
    intake_field_count,
    missing_report_sections,
    split_csv_text,
)


class AppHelperTests(unittest.TestCase):
    def test_intake_form_captures_documented_number_of_fields(self):
        self.assertGreaterEqual(intake_field_count(), 30)
        self.assertEqual(
            set(INTAKE_SECTIONS),
            {
                "academic_background",
                "interests",
                "career_ambition",
                "practical_constraints",
            },
        )

    def test_split_csv_text_removes_empty_items(self):
        self.assertEqual(split_csv_text("AI, data, , coding "), ["AI", "data", "coding"])

    def test_report_section_validator_identifies_missing_sections(self):
        report = {section: "placeholder" for section in REPORT_RENDER_SECTIONS}
        self.assertEqual(missing_report_sections(report), [])

        report.pop("best_countries")
        self.assertEqual(missing_report_sections(report), ["best_countries"])


if __name__ == "__main__":
    unittest.main()
