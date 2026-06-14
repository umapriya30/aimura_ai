#!/usr/bin/env python3
"""Generates the Aimura AI 'Top 20 Updates' PDF for the Agents League 2026 submission."""
from fpdf import FPDF

NAVY = (11, 27, 46)
EMERALD = (18, 160, 107)
EMERALD_BRIGHT = (44, 230, 161)
BLUE = (37, 99, 235)
GREY = (74, 95, 116)
LIGHT = (243, 251, 247)
WHITE = (255, 255, 255)
BG = (6, 18, 37)


def s(text: str) -> str:
    """Make text safe for the core latin-1 fonts."""
    repl = {"→": "->", "—": "-", "–": "-", "‘": "'", "’": "'",
            "“": '"', "”": '"', "…": "...", "✓": "[x]", "•": "-"}
    for k, v in repl.items():
        text = text.replace(k, v)
    return text.encode("latin-1", "replace").decode("latin-1")


# (title, description, rubric tag) in priority order — biggest first.
ITEMS = [
    ("Microsoft Foundry IQ reasoning core",
     "The mandatory Microsoft IQ layer. A resilient reasoning chain grounds the career intelligence "
     "in Foundry IQ, with a deterministic offline fallback so the agent never breaks during judging.",
     "Required integration | Reasoning 20% + Accuracy 20%"),
    ("Role-anchored career-mapping engine",
     "The plan is locked to the student's TARGET role first, then field of study, then skills - so the "
     "recommendation never silently drifts to their current field. Mismatch is detected, not hidden.",
     "Reasoning 20% + Accuracy 20%"),
    ("Always-on live AI mentor",
     "A context-grounded chat that answers using the student's full generated plan, reachable from a "
     "floating button on every screen. Varied, career-specific answers - not one canned reply.",
     "Reasoning 20% + UX 15%"),
    ("Transparent readiness score (0-100)",
     "Driven by skills and education linked to the target role. It DROPS when study and skills do not "
     "fit the goal, so the number is honest rather than inflated - and explainable.",
     "Accuracy 20% + Reliability 20%"),
    ("Interactive career-journey chart",
     "A donut that starts at 0% and climbs as the student completes each stage, with cumulative "
     "milestone bars (interview-ready reads 90%). Turns a static report into a progress tracker.",
     "UX 15% + Creativity 15%"),
    ("Domain-aware adaptive intake",
     "Career priority, skills, dream companies and work style options change to fit the chosen field "
     "and role, so a coder is never shown 'patient impact'. Skills also accept free-typed entries.",
     "Accuracy 20% + UX 15%"),
    ("Guided 7-section intake with required gating",
     "Structured, validated questions across seven focused sections. Students cannot skip the answers "
     "that actually drive the plan, which keeps every output well-grounded.",
     "UX 15%"),
    ("Focus-based report rendering",
     "If a student only wants university recommendations, the report shows only that - not a wall of "
     "every module. The answer they gave changes what they see.",
     "Accuracy/Relevance 20% + UX 15%"),
    ("12-week timetable + risk strategy + fallbacks",
     "A concrete multi-step execution plan: weekly themes, risk mitigations, and plan-B options - the "
     "clear problem-solving approach judges score under multi-step thinking.",
     "Reasoning 20%"),
    ("University matches with safe outbound links",
     "Country-aware university matches where every external link asks for confirmation before it opens "
     "- a deliberate safety pattern, not a raw redirect.",
     "Reliability + Safety 20%"),
    ("Email activation + password reset",
     "Token-based account activation and password reset via Resend, with an in-app link fallback when "
     "no email key is configured - so the flow works in every environment.",
     "Reliability 20% + UX 15%"),
    ("Currency-flexible, country-aware study planning",
     "Budget is shown in the student's own currency, with a stay-or-move-abroad choice and degree level "
     "inferred from their education stage (school -> bachelor's, college -> master's).",
     "Accuracy/Relevance 20%"),
    ("Empathetic 'not sure about studying' path",
     "If a student does not want formal study, the agent routes to a coach that asks logical questions "
     "and gives a supportive message instead of forcing a plan. Unexpected, human execution.",
     "Creativity 15% + UX 15%"),
    ("Clean, colourful PDF report export",
     "A light, crisp, colour-accented report that prints reliably - no faded dark output. Polished and "
     "demoable, the way judges expect a finished product to feel.",
     "UX / Presentation 15%"),
    ("Resilient provider chain + deploy-safe storage",
     "Runs with zero API keys (grounded offline mode) and on read-only/serverless hosts via an "
     "in-memory store. It does not crash mid-demo - the core of the reliability score.",
     "Reliability 20%"),
    ("Privacy-first, vendor-neutral design",
     "Local-first storage, secrets kept out of git, no personal data in links, and confirmation before "
     "any external action. Built to respect the disclaimer and code of conduct.",
     "Reliability + Safety 20%"),
    ("One-command launch + instant share link",
     "Mac and Windows launchers plus a tunnel script give judges a public link they can open on any "
     "phone in seconds - removing friction from evaluation and community voting.",
     "UX 15% + Community 10%"),
    ("Curated live data grounding",
     "Wikipedia, GitHub and OpenAlex signals enrich the skill map and learning resources, with curated "
     "fallbacks when an API is down - so results stay relevant and current.",
     "Accuracy/Relevance 20%"),
    ("Cohesive premium UI",
     "A consistent design system with a calm, reassuring colour language (no alarming reds) across the "
     "whole app, so the experience reads as a finished, trustworthy product.",
     "UX / Presentation 15%"),
    ("Reset-on-change integrity",
     "Changing the dream role clears the role-dependent answers (keeping name and age) so every "
     "recommendation stays internally consistent and honest.",
     "Reliability 20%"),
]


class PDF(FPDF):
    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*GREY)
        self.cell(0, 6, s("Aimura AI  -  Agents League Hackathon 2026  -  Reasoning Agents"), align="L")
        self.cell(0, 6, s(f"Page {self.page_no()}"), align="R")


def cover(pdf: PDF):
    pdf.add_page()
    pdf.set_fill_color(*BG)
    pdf.rect(0, 0, 210, 297, "F")
    # accent bars
    pdf.set_fill_color(*EMERALD_BRIGHT)
    pdf.rect(0, 70, 210, 2, "F")
    pdf.rect(0, 150, 60, 2, "F")
    # brand pill
    pdf.set_xy(18, 30)
    pdf.set_fill_color(*EMERALD_BRIGHT)
    pdf.set_text_color(*BG)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(38, 10, s("  AIMURA AI"), fill=True)
    # title
    pdf.set_xy(18, 82)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 40)
    pdf.cell(0, 18, s("Aimura AI"))
    pdf.set_xy(18, 104)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*EMERALD_BRIGHT)
    pdf.cell(0, 12, s("Top 20 Updates - Priority Order"))
    pdf.set_xy(18, 120)
    pdf.set_text_color(189, 209, 223)
    pdf.set_font("Helvetica", "", 13)
    pdf.multi_cell(174, 7, s("Career-connected student success OS. Plan your study path. Build your career path."))
    # facts box
    pdf.set_xy(18, 165)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(220, 235, 245)
    facts = [
        "Event:        Agents League Hackathon 2026 (June 4-14)",
        "Track:        Reasoning Agents",
        "Required IQ:  Microsoft Foundry IQ (integrated)",
        "Submission:   Public GitHub repo + README + demo video",
        "Prepared by:  Ankit Ranjan",
    ]
    for line in facts:
        pdf.set_x(18)
        pdf.cell(0, 9, s(line))
        pdf.ln(9)


def rubric_page(pdf: PDF):
    pdf.add_page()
    pdf.set_text_color(*NAVY)
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 12, s("How these map to the judging rubric"))
    pdf.ln(14)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*GREY)
    pdf.multi_cell(0, 6, s(
        "Every update below is ordered by impact on winning. The list leads with the mandatory Microsoft "
        "Foundry IQ integration and the reasoning/accuracy features (40% of the score combined), then "
        "reliability and safety (20%), experience and presentation (15%), creativity (15%), and the "
        "community-driven share features (10%)."))
    pdf.ln(4)
    rows = [
        ("Accuracy & Relevance", "20%", "#1 #2 #4 #6 #8 #12 #18"),
        ("Reasoning & Multi-step", "20%", "#1 #2 #3 #9"),
        ("Creativity & Originality", "15%", "#5 #13"),
        ("User Experience & Presentation", "15%", "#3 #5 #7 #14 #17 #19"),
        ("Reliability & Safety", "20%", "#10 #11 #15 #16 #20"),
        ("Community vote", "10%", "#17 (one-click share link)"),
    ]
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(*EMERALD)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(78, 9, s("  Criterion"), fill=True)
    pdf.cell(22, 9, s("Weight"), fill=True, align="C")
    pdf.cell(0, 9, s("  Covered by"), fill=True)
    pdf.ln(9)
    pdf.set_font("Helvetica", "", 10)
    fill = False
    for name, w, items in rows:
        pdf.set_fill_color(*(LIGHT if fill else WHITE))
        pdf.set_text_color(*NAVY)
        pdf.cell(78, 9, s("  " + name), fill=True)
        pdf.set_text_color(*EMERALD)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(22, 9, s(w), fill=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*GREY)
        pdf.cell(0, 9, s("  " + items), fill=True)
        pdf.ln(9)
        fill = not fill


def items_pages(pdf: PDF):
    pdf.add_page()
    pdf.set_text_color(*NAVY)
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 12, s("The 20 updates, in priority order"))
    pdf.ln(16)
    margin = 18
    for i, (title, desc, tag) in enumerate(ITEMS, start=1):
        # page-break guard (approximate height of a card)
        if pdf.get_y() > 250:
            pdf.add_page()
            pdf.ln(2)
        y0 = pdf.get_y()
        # number badge
        pdf.set_fill_color(*EMERALD)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_xy(margin, y0)
        pdf.cell(11, 9, s(f"{i:02d}"), fill=True, align="C")
        # title
        pdf.set_xy(margin + 14, y0)
        pdf.set_text_color(*NAVY)
        pdf.set_font("Helvetica", "B", 13)
        pdf.multi_cell(176 - 14, 7, s(title))
        # description
        pdf.set_x(margin + 14)
        pdf.set_text_color(*GREY)
        pdf.set_font("Helvetica", "", 10.5)
        pdf.multi_cell(176 - 14, 5.4, s(desc))
        # rubric tag
        pdf.set_x(margin + 14)
        pdf.set_text_color(*BLUE)
        pdf.set_font("Helvetica", "I", 9)
        pdf.multi_cell(176 - 14, 5, s("Targets: " + tag))
        pdf.ln(4)


def main():
    pdf = PDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_title("Aimura AI - Top 20 Updates")
    pdf.set_author("Ankit Ranjan")
    cover(pdf)
    rubric_page(pdf)
    items_pages(pdf)
    out = "Aimura_AI_Top20_Updates.pdf"
    pdf.output(out)
    print("Wrote", out)


if __name__ == "__main__":
    main()
