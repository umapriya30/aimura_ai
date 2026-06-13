"""Streamlit entrypoint for the Aimura AI MVP."""

from __future__ import annotations

try:
    import streamlit as st
except ModuleNotFoundError:  # Allows unit tests to import helper functions.
    st = None  # type: ignore[assignment]

from pipeline import generate_pathway_report


APP_TITLE = "Aimura AI"

SAFETY_NOTICE = (
    "Aimura AI provides educational guidance based on general career patterns "
    "and a curated knowledge base. It does not guarantee university admission, "
    "visa approval, scholarships, salaries, or job offers. Always verify "
    "requirements with official universities, visa authorities, and employers."
)

INTAKE_SECTIONS = {
    "academic_background": [
        "full_name",
        "current_country",
        "education_level",
        "target_degree_level",
        "degree_stream",
        "subjects",
        "marks_cgpa",
        "grading_scale",
        "academic_projects",
        "english_test_status",
        "english_test_score",
        "entrance_exam_status",
        "entrance_exam_scores",
    ],
    "interests": [
        "preferred_subjects",
        "work_preferences",
        "domain_preferences",
        "personal_strengths",
        "topics_to_avoid",
        "learning_style",
    ],
    "career_ambition": [
        "dream_role",
        "dream_companies",
        "target_work_country",
        "career_priority",
        "alternative_roles_open",
        "preferred_industries",
    ],
    "practical_constraints": [
        "budget_range",
        "scholarship_need",
        "preferred_countries",
        "visa_concern_level",
        "language_comfort",
        "start_timeline",
        "risk_tolerance",
        "program_duration_preference",
        "family_or_location_constraints",
    ],
}

REPORT_RENDER_SECTIONS = [
    "student_summary",
    "student_os_profile",
    "top_recommended_fields",
    "why_this_fits",
    "why_this_may_not_fit",
    "learning_hub",
    "portfolio_builder",
    "mentor_guidance",
    "api_provider_plan",
    "database_storage_plan",
    "best_countries",
    "exams_needed",
    "university_targeting",
    "dream_role_reality_check",
    "university_skill_roadmap",
    "next_30_days_action_plan",
    "safety_disclaimer",
]


def intake_field_count() -> int:
    """Return the number of student data points captured by the intake form."""
    return sum(len(fields) for fields in INTAKE_SECTIONS.values())


def split_csv_text(value: str) -> list[str]:
    """Split comma-separated Streamlit text input into clean list values."""
    return [item.strip() for item in value.split(",") if item.strip()]


def missing_report_sections(report: dict[str, object]) -> list[str]:
    """Return report sections that cannot be rendered because they are missing."""
    return [section for section in REPORT_RENDER_SECTIONS if section not in report]


def main() -> None:
    """Render the starter Streamlit application shell."""
    if st is None:
        raise RuntimeError("Install Streamlit with `pip install -r requirements.txt`.")

    st.set_page_config(page_title=APP_TITLE, layout="wide")

    st.title(APP_TITLE)
    st.subheader("Career-connected university pathway agent")

    profile = render_student_profile_form()
    if profile:
        st.success("Profile captured. Generating your grounded pathway report.")
        with st.expander("Review captured profile", expanded=False):
            st.json(profile)
        with st.spinner("Running field scoring, knowledge retrieval, and Aimura AI reasoning..."):
            report = generate_pathway_report(profile)
        render_pathway_report(report)


def render_student_profile_form() -> dict[str, object] | None:
    """Render the Streamlit student intake form and return a submitted profile."""
    st.write(
        "Tell Aimura AI about your academics, interests, career goals, and practical "
        "constraints. The next step will generate a grounded pathway report."
    )
    st.info(SAFETY_NOTICE)

    with st.form("student_profile_form"):
        st.markdown("### Academic Background")
        col_a, col_b = st.columns(2)
        with col_a:
            full_name = st.text_input("Student name", value="")
            current_country = st.text_input("Current country", value="India")
            education_level = st.selectbox(
                "Current education level",
                ["Grade 12", "Undergraduate", "Graduate", "Working professional"],
            )
            target_degree_level = st.selectbox(
                "Target degree level", ["Bachelors", "Masters", "PhD", "Diploma"]
            )
            degree_stream = st.text_input("Current stream or degree", value="Computer Science")
            subjects = st.text_input(
                "Strong subjects (comma separated)", value="Math, Computer Science, Statistics"
            )
        with col_b:
            marks_cgpa = st.text_input("Marks or CGPA", value="8.4")
            grading_scale = st.selectbox("Grading scale", ["10-point CGPA", "Percentage", "GPA 4.0"])
            academic_projects = st.text_area(
                "Academic projects", value="Built a Python dashboard and a basic ML classifier."
            )
            english_test_status = st.selectbox("English test status", ["Not started", "Booked", "Completed"])
            english_test_score = st.text_input("English test score if available", value="")
            entrance_exam_status = st.selectbox("Entrance exam status", ["Not needed", "Planning", "Completed"])
            entrance_exam_scores = st.text_input("Entrance exam scores if available", value="")

        st.markdown("### Interests")
        col_c, col_d = st.columns(2)
        with col_c:
            preferred_subjects = st.text_input("Subjects you enjoy", value="data, coding, automation")
            work_preferences = st.multiselect(
                "Preferred work style",
                ["coding", "business", "research", "healthcare", "design", "finance"],
                default=["coding", "research"],
            )
            domain_preferences = st.multiselect(
                "Domain preferences",
                ["machine learning", "software", "analytics", "cybersecurity", "finance", "product"],
                default=["machine learning", "analytics"],
            )
        with col_d:
            personal_strengths = st.text_area("Personal strengths", value="Analytical, persistent, curious")
            topics_to_avoid = st.text_input("Topics or work you want to avoid", value="Pure hardware")
            learning_style = st.selectbox("Learning style", ["project-based", "research-led", "classroom-led"])

        st.markdown("### Career Ambition")
        col_e, col_f = st.columns(2)
        with col_e:
            dream_role = st.text_input("Dream role", value="Machine Learning Engineer")
            dream_companies = st.text_input(
                "Dream companies (up to 5, comma separated)", value="Microsoft, Google, DeepMind"
            )
            target_work_country = st.text_input("Target work country", value="United Kingdom")
        with col_f:
            career_priority = st.selectbox(
                "Career priority", ["salary", "work-life balance", "research", "immigration", "impact"]
            )
            alternative_roles_open = st.checkbox("Open to alternative stepping-stone roles", value=True)
            preferred_industries = st.text_input("Preferred industries", value="data products, education technology")

        st.markdown("### Practical Constraints")
        col_g, col_h = st.columns(2)
        with col_g:
            budget_range = st.selectbox(
                "Budget range",
                ["limited scholarship needed", "medium", "high flexible", "not sure"],
            )
            scholarship_need = st.select_slider(
                "Scholarship need", options=["low", "medium", "high"], value="high"
            )
            preferred_countries = st.multiselect(
                "Preferred study countries",
                ["United Kingdom", "Germany", "Canada", "Australia", "United States"],
                default=["United Kingdom", "Germany"],
            )
            visa_concern_level = st.select_slider(
                "Visa concern level", options=["low", "medium", "high"], value="medium"
            )
        with col_h:
            language_comfort = st.multiselect("Language comfort", ["English", "German", "French"], default=["English"])
            start_timeline = st.selectbox("Study start timeline", ["next 6 months", "6-12 months", "12+ months"])
            risk_tolerance = st.select_slider(
                "Risk tolerance", options=["low", "medium", "high"], value="medium"
            )
            program_duration_preference = st.selectbox(
                "Program duration preference", ["1 year", "2 years", "flexible"]
            )
            family_or_location_constraints = st.text_area(
                "Family or location constraints", value="Prefer strong post-study work options."
            )

        submitted = st.form_submit_button("Generate My Pathway", type="primary")

    if not submitted:
        st.caption(
            "Configure the optional cloud reasoning credentials in `.env` when "
            "you are ready to use the live reasoning call."
        )
        return None

    return {
        "full_name": full_name,
        "current_country": current_country,
        "education_level": education_level,
        "target_degree_level": target_degree_level,
        "degree_stream": degree_stream,
        "subjects": split_csv_text(subjects),
        "marks_cgpa": marks_cgpa,
        "grading_scale": grading_scale,
        "academic_projects": academic_projects,
        "english_test_status": english_test_status,
        "english_test_score": english_test_score,
        "entrance_exam_status": entrance_exam_status,
        "entrance_exam_scores": entrance_exam_scores,
        "preferred_subjects": split_csv_text(preferred_subjects),
        "work_preferences": work_preferences,
        "domain_preferences": domain_preferences,
        "personal_strengths": personal_strengths,
        "topics_to_avoid": topics_to_avoid,
        "learning_style": learning_style,
        "dream_role": dream_role,
        "dream_companies": split_csv_text(dream_companies),
        "target_work_country": target_work_country,
        "career_priority": career_priority,
        "alternative_roles_open": alternative_roles_open,
        "preferred_industries": split_csv_text(preferred_industries),
        "budget_range": budget_range,
        "scholarship_need": scholarship_need,
        "preferred_countries": preferred_countries,
        "visa_concern_level": visa_concern_level,
        "language_comfort": language_comfort,
        "start_timeline": start_timeline,
        "risk_tolerance": risk_tolerance,
        "program_duration_preference": program_duration_preference,
        "family_or_location_constraints": family_or_location_constraints,
    }


def render_pathway_report(report: dict[str, object]) -> None:
    """Render the 10-section Aimura AI pathway report in Streamlit."""
    missing = missing_report_sections(report)
    if missing:
        st.error(f"Report is missing required sections: {', '.join(missing)}")
        return

    st.divider()
    st.header("Your Aimura AI Pathway Report")

    st.subheader("1. Student Summary")
    st.write(report["student_summary"])

    st.subheader("Student Success OS")
    student_os = report["student_os_profile"]
    col_domain, col_score = st.columns(2)
    with col_domain:
        st.metric("Normalized domain", student_os.get("normalized_domain", "Not available"))
        st.caption(f"Parent domain: {student_os.get('parent_domain', 'Not available')}")
    with col_score:
        st.metric("Skill score", f"{student_os.get('skill_score', 0)}/100")
        st.caption("Generated from current skills, projects, and profile context.")
    _render_list("Target roles", student_os.get("target_roles", []))
    _render_list("Missing skills", student_os.get("missing_skills", []))

    st.subheader("2. Top Recommended Fields")
    for field in report["top_recommended_fields"]:
        field_name = str(field.get("field", "Recommended field"))
        fit_score = int(field.get("fit_score", field.get("overall_score", 0)))
        st.markdown(f"**{field_name}** - {fit_score}/100")
        st.progress(max(0, min(100, fit_score)))
        st.caption(str(field.get("reason", "")))

    col_fit, col_risk = st.columns(2)
    with col_fit:
        st.subheader("3. Why This Fits")
        for item in report["why_this_fits"]:
            st.write(f"- {item}")
    with col_risk:
        st.subheader("4. Why This May Not Fit")
        for item in report["why_this_may_not_fit"]:
            st.write(f"- {item}")

    st.subheader("Learning Hub")
    st.dataframe(report["learning_hub"], width="stretch", hide_index=True)

    st.subheader("Portfolio Builder")
    portfolio = report["portfolio_builder"]
    _render_list("Project ideas", portfolio.get("project_ideas", []))
    _render_list("GitHub checklist", portfolio.get("github_checklist", []))
    st.caption(portfolio.get("linkedin_headline", ""))
    _render_list("Resume bullets", portfolio.get("resume_bullets", []))

    st.subheader("Mini Mentor")
    for item in report["mentor_guidance"]:
        with st.expander(str(item.get("question", "Mentor question")), expanded=False):
            st.write(item.get("answer", ""))

    st.subheader("API and Storage Plan")
    st.json(
        {
            "api_provider_plan": report["api_provider_plan"],
            "database_storage_plan": report["database_storage_plan"],
        }
    )

    st.subheader("5. Best Countries")
    st.dataframe(report["best_countries"], width="stretch", hide_index=True)

    st.subheader("6. Exams Needed")
    st.dataframe(report["exams_needed"], width="stretch", hide_index=True)

    st.subheader("7. University Targeting")
    ambitious, moderate, safe = st.columns(3)
    tiers = report["university_targeting"]
    for column, tier_name in [
        (ambitious, "ambitious"),
        (moderate, "moderate"),
        (safe, "safe"),
    ]:
        with column:
            st.markdown(f"**{tier_name.title()}**")
            for university in tiers.get(tier_name, []) or ["Verify program-specific options."]:
                st.write(f"- {university}")

    st.subheader("8. Dream Role Reality Check")
    reality = report["dream_role_reality_check"]
    st.write(reality.get("achievability", "Verify role feasibility."))
    st.caption(reality.get("timeline", "Timeline varies by student profile and market conditions."))
    for step in reality.get("entry_level_steps", []):
        st.write(f"- {step}")

    st.subheader("9. University Skill Roadmap")
    for item in report["university_skill_roadmap"]:
        period = item.get("period", "Roadmap period")
        with st.expander(str(period), expanded=False):
            _render_list("Skills", item.get("skills", []))
            _render_list("Projects", item.get("projects", []))
            _render_list("Internship actions", item.get("internship_actions", []))
            _render_list(
                "LinkedIn/GitHub milestones",
                item.get("linkedin_github_milestones", []),
            )

    st.subheader("10. Next 30 Days Action Plan")
    for action in report["next_30_days_action_plan"]:
        st.write(f"- {action}")

    st.warning(report["safety_disclaimer"])


def _render_list(title: str, values: object) -> None:
    st.markdown(f"**{title}**")
    if isinstance(values, list):
        for value in values:
            st.write(f"- {value}")
    elif values:
        st.write(f"- {values}")
    else:
        st.write("- No specific guidance provided.")


if __name__ == "__main__":
    main()
