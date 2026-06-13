"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Check,
  Globe2,
  Handshake,
  Loader2,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { GradientCard, IntakeStepCard, ProgressHeader, Toast, type ToastState } from "@/components/PremiumUI";
import { categoryStyle, categoryThemes, type CategoryId, type CategoryTheme } from "@/lib/category-theme";
import { domainOptions, inferDomainKey, type DomainKey } from "@/lib/domain-options";
import {
  type AimuraStudentReport,
  type AuthUser,
  type InsightResponse,
  type StudentAnswers,
} from "@/lib/student-os-types";

type MultiStepFormProps = {
  sessionUser: AuthUser | null;
  onSessionInvalid: () => void;
  onReportGenerated: (report: AimuraStudentReport) => void;
};

type FieldType = "text" | "number" | "select" | "multiselect";

type Field = {
  id: keyof StudentAnswers;
  label: string;
  type: FieldType;
  helper?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  // When true, the question's choices adapt to the student's field/target role.
  domainAware?: boolean;
  // When true (multiselect only), the student can type and add their own value.
  allowCustom?: boolean;
};

type Section = {
  id: string;
  icon: LucideIcon;
  category: CategoryId;
  title: string;
  tab: string;
  description: string;
  fields: Field[];
};

const COUNTRIES = [
  "India", "United Kingdom", "United States", "Canada", "Australia", "Germany",
  "Netherlands", "Ireland", "France", "Italy", "Spain", "Sweden", "Switzerland",
  "Denmark", "Norway", "Finland", "Austria", "Belgium", "Portugal", "Poland",
  "Czech Republic", "United Arab Emirates", "Saudi Arabia", "Qatar", "Singapore",
  "Malaysia", "China", "Japan", "South Korea", "Hong Kong", "Thailand",
  "Nigeria", "Kenya", "South Africa", "Bangladesh", "Pakistan", "Sri Lanka",
  "Nepal", "Ghana", "Egypt", "Brazil", "Mexico", "Argentina", "New Zealand",
  "Other",
];

const YES_NO = ["Yes", "No"];

const sections: Section[] = [
  {
    id: "basic",
    icon: UserRound,
    category: "my-plan",
    title: "Basic Profile",
    tab: "Profile",
    description: "Tell us who you are. This anchors every recommendation.",
    fields: [
      { id: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { id: "age", label: "Age", type: "number", placeholder: "e.g. 21" },
      { id: "country", label: "Country of Residence", type: "select", options: COUNTRIES },
      { id: "educationLevel", label: "Highest Education Level", type: "select", options: ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Other"] },
      { id: "fieldOfStudy", label: "Current Course / Field of Study", type: "text", placeholder: "e.g. Medicine, Music, Photography, Law, Computer Science" },
      { id: "gpa", label: "Current GPA / Percentage", type: "number", placeholder: "e.g. 7.8 or 82" },
    ],
  },
  {
    id: "goals",
    icon: Target,
    category: "career-fit",
    title: "Career Goals",
    tab: "Goals",
    description: "Where do you want to go? Aimura normalizes this into roles and skills.",
    fields: [
      { id: "dreamRole", label: "Dream Job Role", type: "text", placeholder: "e.g. Doctor, Photographer, Musician, Lawyer, AI Engineer", required: true, helper: "Tip: set this first — your other options adapt to this role." },
      { id: "dreamCompanies", label: "Dream Companies / Organisations", type: "multiselect", domainAware: true, allowCustom: true, helper: "Choices reflect your target role. Type to add your own.", options: ["Startup / Own Business", "Other"] },
      { id: "careerPriority", label: "Career Priority", type: "select", domainAware: true, options: ["High Salary", "Job Stability", "Work-Life Balance", "Entrepreneurship", "Other"] },
    ],
  },
  {
    id: "interests",
    icon: Brain,
    category: "learn",
    title: "Interests & Preferences",
    tab: "Interests",
    description: "What energizes you? This shapes the style of your plan.",
    fields: [
      { id: "subjects", label: "Subjects You Like", type: "multiselect", allowCustom: true, helper: "An add-on signal — your score is driven by your studies and skills, not by interests alone.", options: ["Mathematics", "Programming", "Physics", "Biology", "Medicine", "Psychology", "Business", "Finance", "Design", "Photography", "Music", "Drama / Performing Arts", "Law", "Politics", "Economics", "Architecture", "History", "Languages", "Other"] },
      { id: "workStyle", label: "Preferred Work Style", type: "select", domainAware: true, options: ["Technical Problem Solving", "Creative Work", "Research", "Leadership / Management", "Client Service", "Other"] },
      { id: "activities", label: "Activities You Enjoy", type: "multiselect", options: ["Coding", "Data Analysis", "Designing", "Photography", "Music Practice", "Performing", "Writing", "Public Speaking", "Research", "Lab Work", "Volunteering", "Teaching", "Debating", "Building Projects", "Helping People", "Other"] },
    ],
  },
  {
    id: "skills",
    icon: BadgeCheck,
    category: "build-proof",
    title: "Skills & Experience",
    tab: "Skills",
    description: "Your current evidence makes the skill score and roadmap accurate.",
    fields: [
      { id: "skills", label: "Current Skills", type: "multiselect", domainAware: true, allowCustom: true, helper: "These are matched against your target role. Don't see yours? Type it and press Add.", options: ["Communication", "Problem Solving", "Research", "Teamwork", "Writing", "Other"] },
      { id: "hasProjects", label: "Do you have project experience?", type: "select", options: YES_NO },
      { id: "hasInternship", label: "Do you have internship experience?", type: "select", options: YES_NO },
      { id: "hasGithub", label: "Portfolio / GitHub Profile Available?", type: "select", options: YES_NO },
      { id: "hasLinkedin", label: "LinkedIn Profile Available?", type: "select", options: YES_NO },
      { id: "careerGap", label: "Any career or study gap?", type: "select", helper: "A pause in study or work. Honest answers make the plan and risk strategy realistic.", options: ["No gap", "Less than 6 months", "6–12 months", "1–2 years", "More than 2 years"] },
    ],
  },
  {
    id: "abroad",
    icon: Globe2,
    category: "study-options",
    title: "Study Abroad Preferences",
    tab: "Study Abroad",
    description: "Where and how you want to study, so university matches fit your budget.",
    fields: [
      { id: "studyCountries", label: "Preferred Study Countries", type: "multiselect", options: ["United Kingdom", "Germany", "Canada", "United States", "Australia", "Netherlands", "Ireland", "France", "Italy", "Spain", "Sweden", "Switzerland", "Denmark", "Norway", "Finland", "Austria", "Belgium", "Portugal", "United Arab Emirates", "Singapore", "Malaysia", "Japan", "South Korea", "New Zealand", "India", "Other"] },
      { id: "budgetRange", label: "Budget Range (Annual Tuition, GBP £)", type: "select", helper: "All budgets are in British Pounds (GBP).", options: ["Below £10,000", "£10,000 – £20,000", "£20,000 – £35,000", "£35,000+"] },
      { id: "needScholarship", label: "Do you need scholarship support?", type: "select", options: YES_NO },
      { id: "englishTest", label: "Which English test will you take?", type: "select", options: ["IELTS", "TOEFL", "PTE Academic", "Duolingo English Test", "Cambridge English (C1/C2)", "Not required / Native speaker", "Still deciding", "Other"] },
      { id: "englishScore", label: "Your English test score (achieved or target)", type: "text", placeholder: "e.g. IELTS 7.5, TOEFL 100, Duolingo 120", helper: "Leave blank if you haven't taken it yet." },
    ],
  },
  {
    id: "learning",
    icon: BookOpen,
    category: "weekly-plan",
    title: "Learning Preferences",
    tab: "Learning",
    description: "How you learn best, so the timetable matches your pace.",
    fields: [
      { id: "weeklyHours", label: "Weekly Study Hours", type: "number", placeholder: "e.g. 10" },
      { id: "learningStyle", label: "Preferred Learning Style", type: "select", options: ["Video Courses", "Reading", "Hands-on Projects", "Studio / Practice Sessions", "Clinical / Lab Practice", "Live Classes", "Mentor Feedback", "Other"] },
      { id: "learningSpeed", label: "Learning Speed Preference", type: "select", options: ["Self-paced", "Structured Plan", "Intensive Practice Sprint", "Fast-track Bootcamp Style", "Slow and Deep Mastery"] },
    ],
  },
  {
    id: "mentorship",
    icon: Handshake,
    category: "mentor",
    title: "Mentorship & Goal",
    tab: "Mentorship",
    description: "Support preferences, and what you want Aimura AI to focus on today.",
    fields: [
      { id: "wantMentor", label: "Want Mentor Support?", type: "select", options: YES_NO },
      { id: "wantCommunity", label: "Want Peer Group / Study Community?", type: "select", options: YES_NO },
      { id: "helpFocus", label: "What do you want Aimura AI to help you with today?", type: "select", options: ["Complete Career Plan", "University Recommendations", "Course Suggestions", "Skill Gap Analysis", "Study Roadmap", "Admission Strategy"] },
    ],
  },
];

const defaultAnswers: StudentAnswers = {
  fullName: "", age: "", country: "", educationLevel: "", fieldOfStudy: "", gpa: "",
  dreamRole: "", dreamCompanies: [], careerPriority: "",
  subjects: [], workStyle: "", activities: [],
  skills: [], hasProjects: "", hasInternship: "", hasGithub: "", hasLinkedin: "", careerGap: "",
  studyCountries: [], budgetRange: "", needScholarship: "", englishTest: "", englishScore: "",
  weeklyHours: "", learningStyle: "", learningSpeed: "",
  wantMentor: "", wantCommunity: "", helpFocus: "",
};

// One-click demo profiles across different domains, so anyone (judges,
// community voters) can generate a full report without filling 27 fields —
// and to show the engine works far beyond tech.
const SAMPLE_PROFILES: Array<{ label: string; answers: StudentAnswers }> = [
  {
    label: "AI Engineer",
    answers: {
      fullName: "Riya Sharma", age: "21", country: "India", educationLevel: "Bachelor's",
      fieldOfStudy: "Computer Science", gpa: "7.8", dreamRole: "AI Engineer",
      dreamCompanies: ["Google", "Microsoft", "Startup / Own Business"], careerPriority: "High Salary",
      subjects: ["Mathematics", "Programming"], workStyle: "Technical Problem Solving",
      activities: ["Coding", "Building Projects", "Data Analysis"],
      skills: ["Python", "SQL", "Machine Learning", "Data Analysis"],
      hasProjects: "Yes", hasInternship: "No", hasGithub: "Yes", hasLinkedin: "Yes", careerGap: "No gap",
      studyCountries: ["United Kingdom", "Germany", "Canada"], budgetRange: "£10,000 – £20,000",
      needScholarship: "Yes", englishTest: "IELTS", englishScore: "", weeklyHours: "12",
      learningStyle: "Hands-on Projects", learningSpeed: "Structured Plan",
      wantMentor: "Yes", wantCommunity: "Yes", helpFocus: "Complete Career Plan",
    },
  },
  {
    label: "Doctor",
    answers: {
      fullName: "Aarav Patel", age: "19", country: "India", educationLevel: "High School",
      fieldOfStudy: "Biology", gpa: "88", dreamRole: "Doctor",
      dreamCompanies: ["Hospital / NHS", "Research Lab"], careerPriority: "Patient / Public Impact",
      subjects: ["Biology", "Medicine", "Psychology"], workStyle: "Clinical / Patient-facing Work",
      activities: ["Research", "Volunteering", "Helping People"],
      skills: ["Human Biology", "Anatomy", "Patient Communication", "Research"],
      hasProjects: "No", hasInternship: "No", hasGithub: "No", hasLinkedin: "No", careerGap: "No gap",
      studyCountries: ["United Kingdom", "Ireland", "Australia"], budgetRange: "£20,000 – £35,000",
      needScholarship: "Yes", englishTest: "IELTS", englishScore: "", weeklyHours: "15",
      learningStyle: "Clinical / Lab Practice", learningSpeed: "Slow and Deep Mastery",
      wantMentor: "Yes", wantCommunity: "Yes", helpFocus: "Admission Strategy",
    },
  },
  {
    label: "Photographer",
    answers: {
      fullName: "Maya Chen", age: "22", country: "United Kingdom", educationLevel: "Bachelor's",
      fieldOfStudy: "Photography", gpa: "75", dreamRole: "Photographer",
      dreamCompanies: ["Studio / Agency", "Museum / Gallery", "Startup / Own Business"], careerPriority: "Creative Freedom",
      subjects: ["Photography", "Design", "Languages"], workStyle: "Creative Work",
      activities: ["Photography", "Designing", "Building Projects"],
      skills: ["Photography", "Lighting", "Camera Operation", "Photo Editing", "Composition"],
      hasProjects: "Yes", hasInternship: "Yes", hasGithub: "No", hasLinkedin: "Yes", careerGap: "No gap",
      studyCountries: ["United Kingdom", "United States", "Italy"], budgetRange: "£20,000 – £35,000",
      needScholarship: "No", englishTest: "IELTS", englishScore: "7.5", weeklyHours: "10",
      learningStyle: "Studio / Practice Sessions", learningSpeed: "Intensive Practice Sprint",
      wantMentor: "Yes", wantCommunity: "No", helpFocus: "Course Suggestions",
    },
  },
];

function fieldHasValue(field: Field, answers: StudentAnswers) {
  const value = answers[field.id];
  return Array.isArray(value) ? value.length > 0 : `${value || ""}`.trim().length > 0;
}

function isSectionComplete(section: Section, answers: StudentAnswers) {
  const requiredFields = section.fields.filter((field) => field.required);
  if (requiredFields.length > 0) {
    return requiredFields.every((field) => fieldHasValue(field, answers));
  }
  return section.fields.some((field) => fieldHasValue(field, answers));
}

function getSectionCompletion(section: Section, answers: StudentAnswers) {
  const answered = section.fields.filter((field) => fieldHasValue(field, answers)).length;
  return (answered / section.fields.length) * 100;
}

export function MultiStepForm({ sessionUser, onReportGenerated, onSessionInvalid }: MultiStepFormProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswers>(defaultAnswers);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [message, setMessage] = useState(
    "Complete the 7 sections, then generate your student plan. Full name and dream role are required; everything else sharpens the result.",
  );

  const activeSection = sections[activeStepIndex];
  const activeTheme = categoryThemes[activeSection.category];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === sections.length - 1;
  const completedCount = sections.filter((section) => isSectionComplete(section, answers)).length;
  const activeCompletion = getSectionCompletion(activeSection, answers);
  const requiredMissing = activeSection.fields.filter((field) => field.required && !fieldHasValue(field, answers));
  // Drives domain-aware options (career priority, skills, companies, work style).
  const domainKey = inferDomainKey(answers.dreamRole, answers.fieldOfStudy, answers.skills);

  function notify(tone: ToastState["tone"], title: string, nextMessage?: string) {
    setToast({ id: Date.now(), tone, title, message: nextMessage });
    setMessage(nextMessage || title);
  }

  function setText(id: keyof StudentAnswers, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function toggleMulti(id: keyof StudentAnswers, option: string) {
    setAnswers((current) => {
      const list = (current[id] as string[]) || [];
      const next = list.includes(option) ? list.filter((item) => item !== option) : [...list, option];
      return { ...current, [id]: next };
    });
  }

  function loadSample(sample: StudentAnswers) {
    setAnswers(sample);
    setActiveStepIndex(sections.length - 1);
    notify("success", "Demo profile loaded", `Loaded the "${sample.dreamRole}" sample profile. Click Generate Student OS to see a full report.`);
    scrollToTop();
  }

  function goBack() {
    setActiveStepIndex((current) => Math.max(0, current - 1));
    scrollToTop();
  }

  function goNext() {
    if (requiredMissing.length) {
      const missingLabels = requiredMissing.map((field) => field.label).join(", ");
      notify("warning", "Required field missing", `Please complete ${missingLabels} before continuing.`);
      return;
    }

    if (isLastStep) {
      generateReport();
      return;
    }
    setActiveStepIndex((current) => Math.min(sections.length - 1, current + 1));
    scrollToTop();
  }

  function scrollToTop() {
    document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function generateReport() {
    if (!answers.fullName.trim() || !answers.dreamRole.trim()) {
      notify("warning", "Required fields missing", "Please fill Full Name (Section 1) and Dream Job Role (Section 2) before generating.");
      return;
    }

    setIsGenerating(true);
    setMessage(
      sessionUser
        ? "Building your Student OS and career intelligence, then saving to your account..."
        : "Building your Student OS and career intelligence...",
    );

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, userId: sessionUser?.id }),
      });
      const data = (await response.json()) as InsightResponse;
      if (!response.ok || !data.success || !data.report) {
        throw new Error(data.message || "Aimura AI could not generate the report.");
      }
      onReportGenerated(data.report);
      if (data.sessionInvalid) onSessionInvalid();
      notify("success", "Student OS generated", data.message || "Your roadmap, score, timetable, and mentor are ready.");
      document.getElementById("report")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      notify("error", "Generation failed", error instanceof Error ? error.message : "Report generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  const ActiveIcon = activeSection.icon;

  return (
    <section className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 lg:px-12" id="wizard">
      <div className="grid gap-8 lg:grid-cols-[0.52fr_1fr]">
        <div className="min-w-0">
          <div className="min-w-0 lg:sticky lg:top-24">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-aimura-green">Guided intake</p>
            <h2 className="mt-4 max-w-full break-words text-3xl font-semibold tracking-[-0.03em] text-aimura-white sm:max-w-md sm:text-5xl sm:tracking-[-0.04em]">
              Seven focused sections. One career operating system.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-aimura-muted">
              Aimura turns structured answers into a normalized career domain, an honest skill score,
              university matches, and a timetable with risk and fallback strategy.
            </p>

            <GradientCard className="mt-6 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-aimura-green">
                <Sparkles className="size-4" aria-hidden />
                Try it in 2 clicks
              </div>
              <p className="mt-1.5 text-xs leading-5 text-aimura-muted">
                No time to fill every field? Load a ready-made student, then hit generate. Real user names and goals stay dynamic.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_PROFILES.map((sample) => (
                  <button
                    key={sample.label}
                    className="aimura-focus-ring inline-flex items-center gap-1.5 rounded-control border border-aimura-green/40 bg-aimura-panel-2 px-3.5 py-2 text-sm text-aimura-white transition hover:bg-aimura-green hover:text-aimura-black"
                    onClick={() => loadSample(sample.answers)}
                    type="button"
                  >
                    <Sparkles className="size-3.5" aria-hidden />
                    {sample.label}
                  </button>
                ))}
              </div>
            </GradientCard>

            <div className="aimura-no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
              {sections.map((section, index) => {
                const theme = categoryThemes[section.category];
                const Icon = section.icon;
                const complete = isSectionComplete(section, answers);
                return (
                  <button
                    key={section.id}
                    className={`aimura-focus-ring flex min-w-[13rem] items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-left text-sm transition lg:w-full ${
                      index === activeStepIndex
                        ? "bg-white/[0.075] text-aimura-white"
                        : "bg-white/[0.025] text-aimura-muted hover:bg-white/[0.05] hover:text-aimura-white"
                    }`}
                    onClick={() => setActiveStepIndex(index)}
                    style={{ ...categoryStyle(theme), borderColor: index === activeStepIndex ? theme.border : "rgb(255 255 255 / 0.1)" }}
                    type="button"
                  >
                    <span className="aimura-category-icon size-10 shrink-0 rounded-2xl" style={categoryStyle(theme)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="aimura-role-title block truncate font-semibold">{section.title}</span>
                      <span className="aimura-role-subtle mt-1 block text-xs">{section.tab}</span>
                    </span>
                    {complete ? <Check className="size-4 shrink-0" style={{ color: theme.accent }} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <GradientCard className="min-w-0 p-5 sm:p-6" theme={activeTheme}>
          <ProgressHeader sections={sections} activeIndex={activeStepIndex} completedCount={completedCount} theme={activeTheme} />

          <div className="mt-5 grid gap-5">
            <IntakeStepCard
              helper={`${activeSection.description} ${requiredMissing.length ? "Required fields are highlighted before you move on." : "Optional details sharpen the recommendation."}`}
              theme={activeTheme}
            >
              <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="aimura-category-icon size-12 rounded-2xl" style={categoryStyle(activeTheme)}>
                    <ActiveIcon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="aimura-role-label text-xs font-semibold uppercase tracking-[0.2em]">
                      Section {activeStepIndex + 1} · {activeTheme.iconTone}
                    </p>
                    <h3 className="aimura-role-title mt-2 text-2xl font-semibold tracking-[-0.03em]">{activeSection.title}</h3>
                  </div>
                </div>
                <div className="aimura-role-value rounded-control border px-4 py-2 text-sm font-semibold" style={{ borderColor: activeTheme.border }}>
                  {Math.round(activeCompletion)}% answered
                </div>
              </div>

              <div className="grid gap-4">
                {activeSection.fields.map((field) => (
                  <FieldControl
                    key={field.id}
                    field={field}
                    answers={answers}
                    domainKey={domainKey}
                    onText={setText}
                    onToggle={toggleMulti}
                    theme={activeTheme}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  className="aimura-focus-ring inline-flex items-center justify-center gap-2 rounded-control border border-aimura-moss/50 px-6 py-3 text-sm font-semibold text-aimura-white transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-aimura-green"
                  disabled={isFirstStep || isGenerating}
                  onClick={goBack}
                  type="button"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back
                </button>
                <button
                  className="aimura-focus-ring aimura-green-glow inline-flex items-center justify-center gap-2 rounded-control bg-aimura-green px-6 py-3 text-sm font-semibold text-aimura-black transition hover:bg-aimura-mint disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isGenerating}
                  onClick={goNext}
                  type="button"
                >
                  {isGenerating ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {isGenerating ? "Generating..." : isLastStep ? "Generate Student OS" : "Next section"}
                  {!isGenerating ? <ArrowRight className="size-4" aria-hidden /> : null}
                </button>
              </div>

              <p className="aimura-role-body mt-4 flex items-start gap-2 text-sm leading-6">
                {requiredMissing.length ? <AlertCircle className="mt-1 size-4 shrink-0 text-yellow-200" aria-hidden /> : null}
                <span>{message}</span>
              </p>
            </IntakeStepCard>
          </div>
        </GradientCard>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}

// Resolves the options a field should show. Domain-aware fields adapt to the
// student's target role / field of study; any already-selected value is always
// kept visible so changing the role never drops a previous answer.
function resolveOptions(field: Field, domainKey: DomainKey, answers: StudentAnswers): string[] {
  let base = field.options ?? [];
  if (field.domainAware) {
    const dyn = domainOptions(domainKey);
    if (field.id === "careerPriority") base = dyn.careerPriority;
    else if (field.id === "skills") base = dyn.skills;
    else if (field.id === "dreamCompanies") base = dyn.dreamCompanies;
    else if (field.id === "workStyle") base = dyn.workStyle;
  }
  const current = answers[field.id];
  const selected = Array.isArray(current) ? current : current ? [current as string] : [];
  return Array.from(new Set([...base, ...selected]));
}

function FieldControl({
  field,
  answers,
  domainKey,
  onText,
  onToggle,
  theme,
}: {
  field: Field;
  answers: StudentAnswers;
  domainKey: DomainKey;
  onText: (id: keyof StudentAnswers, value: string) => void;
  onToggle: (id: keyof StudentAnswers, option: string) => void;
  theme: CategoryTheme;
}) {
  const [customValue, setCustomValue] = useState("");
  const options = resolveOptions(field, domainKey, answers);
  const labelNode = (
    <span className="aimura-role-label flex items-center gap-2 text-xs uppercase tracking-[0.18em]" style={categoryStyle(theme)}>
      {field.label}
      {field.required ? <span className="aimura-role-value">required</span> : null}
    </span>
  );

  function addCustom() {
    const value = customValue.trim();
    if (!value) return;
    const selected = (answers[field.id] as string[]) || [];
    if (!selected.includes(value)) onToggle(field.id, value);
    setCustomValue("");
  }

  if (field.type === "multiselect") {
    const selected = (answers[field.id] as string[]) || [];
    return (
      <div className="rounded-2xl border bg-aimura-panel/55 p-4" style={{ ...categoryStyle(theme), borderColor: theme.border }}>
        {labelNode}
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                className={`aimura-focus-ring inline-flex items-center gap-1.5 rounded-control border px-3.5 py-2 text-sm transition ${
                  active
                    ? "text-aimura-black"
                    : "border-aimura-moss/30 bg-aimura-panel-2 aimura-role-body hover:text-aimura-white"
                }`}
                style={
                  active
                    ? { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, borderColor: theme.border }
                    : { borderColor: "rgb(125 147 170 / 0.3)" }
                }
                onClick={() => onToggle(field.id, option)}
                type="button"
              >
                {active ? <Check className="size-3.5" aria-hidden /> : null}
                {option}
              </button>
            );
          })}
        </div>
        {field.allowCustom ? (
          <div className="mt-3 flex gap-2">
            <input
              aria-label={`Add a custom ${field.label.toLowerCase()}`}
              className="aimura-focus-ring aimura-role-title min-w-0 flex-1 rounded-xl border border-aimura-moss/30 bg-aimura-panel-2 px-3 py-2 text-sm outline-none placeholder:text-aimura-moss"
              onChange={(event) => setCustomValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Type your own and press Add"
              value={customValue}
            />
            <button
              className="aimura-focus-ring rounded-control border border-aimura-green/50 bg-aimura-panel-2 px-4 py-2 text-sm font-semibold text-aimura-white transition hover:bg-aimura-green hover:text-aimura-black disabled:opacity-40"
              disabled={!customValue.trim()}
              onClick={addCustom}
              type="button"
            >
              Add
            </button>
          </div>
        ) : null}
        {field.helper ? <span className="aimura-role-subtle mt-2 block text-xs leading-5">{field.helper}</span> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block rounded-2xl border bg-aimura-panel/55 p-4" style={{ ...categoryStyle(theme), borderColor: field.required && !fieldHasValue(field, answers) ? theme.border : "rgb(125 147 170 / 0.25)" }}>
        {labelNode}
        <select
          aria-label={field.label}
          className="aimura-focus-ring aimura-role-title mt-2 w-full cursor-pointer rounded-xl border border-aimura-moss/30 bg-aimura-panel-2 px-3 py-2.5 text-sm font-medium outline-none"
          onChange={(event) => onText(field.id, event.target.value)}
          style={{ borderColor: field.required && !fieldHasValue(field, answers) ? theme.border : undefined }}
          value={answers[field.id] as string}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {field.helper ? <span className="aimura-role-subtle mt-2 block text-xs leading-5">{field.helper}</span> : null}
      </label>
    );
  }

  return (
    <label
      className="block rounded-2xl border border-aimura-moss/25 bg-aimura-panel/55 p-4"
      style={{ ...categoryStyle(theme), borderColor: field.required && !fieldHasValue(field, answers) ? theme.border : "rgb(125 147 170 / 0.25)" }}
    >
      {labelNode}
      <input
        aria-label={field.label}
        className="aimura-focus-ring aimura-role-title mt-2 w-full border-0 bg-transparent text-sm font-medium outline-none placeholder:text-aimura-moss"
        inputMode={field.type === "number" ? "decimal" : "text"}
        onChange={(event) => onText(field.id, event.target.value)}
        placeholder={field.placeholder}
        type={field.type === "number" ? "number" : "text"}
        value={answers[field.id] as string}
      />
      {field.helper ? <span className="aimura-role-subtle mt-2 block text-xs leading-5">{field.helper}</span> : null}
    </label>
  );
}
