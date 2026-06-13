import { NextResponse } from "next/server";
import { saveReport } from "@/lib/app-data-store";
import { buildStudentOSReport } from "@/lib/student-os-engine";
import { enrichIntelligenceWithAI } from "@/lib/intelligence";
import { type StudentAnswers } from "@/lib/student-os-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = normalizeAnswers(body?.answers);
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!answers.fullName.trim() || !answers.dreamRole.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide at least your full name and dream job role." },
        { status: 400 },
      );
    }

    const report = await buildStudentOSReport(answers);

    // Upgrade the deterministic intelligence with the AI engine when available.
    const enriched = await enrichIntelligenceWithAI(report).catch(() => null);
    if (enriched) report.intelligence = enriched;

    let saved = false;
    let sessionInvalid = false;
    let message = "Report generated in this browser.";

    if (userId) {
      const stored = await saveReport(userId, report);
      if (!stored.success) {
        sessionInvalid = true;
        message = "Report generated, but the saved login was stale. Sign in again to save future roadmaps.";
      } else {
        saved = true;
        message = "Report generated and saved to your local Aimura AI account.";
      }
    }

    return NextResponse.json({ success: true, report, saved, sessionInvalid, message });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to generate the Aimura AI report." },
      { status: 500 },
    );
  }
}

function normalizeAnswers(value: unknown): StudentAnswers {
  const input = (value || {}) as Record<string, unknown>;
  const text = (key: string) => asText(input[key]);
  const list = (key: string) => asList(input[key]);
  return {
    fullName: text("fullName"),
    age: text("age"),
    country: text("country"),
    educationLevel: text("educationLevel"),
    fieldOfStudy: text("fieldOfStudy"),
    gpa: text("gpa"),
    dreamRole: text("dreamRole"),
    dreamCompanies: list("dreamCompanies"),
    careerPriority: text("careerPriority"),
    subjects: list("subjects"),
    workStyle: text("workStyle"),
    activities: list("activities"),
    skills: list("skills"),
    hasProjects: text("hasProjects"),
    hasInternship: text("hasInternship"),
    hasGithub: text("hasGithub"),
    hasLinkedin: text("hasLinkedin"),
    careerGap: text("careerGap"),
    studyCountries: list("studyCountries"),
    budgetRange: text("budgetRange"),
    needScholarship: text("needScholarship"),
    englishTest: text("englishTest"),
    englishScore: text("englishScore"),
    weeklyHours: text("weeklyHours"),
    learningStyle: text("learningStyle"),
    learningSpeed: text("learningSpeed"),
    wantMentor: text("wantMentor"),
    wantCommunity: text("wantCommunity"),
    helpFocus: text("helpFocus"),
  };
}

function asText(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}
