import { completeText } from "@/lib/ai-provider";
import {
  type AimuraStudentReport,
  type CareerIntelligence,
  type DomainProfile,
  type FallbackOption,
  type RiskItem,
  type RoadmapStep,
  type StudentAnswers,
  type TimetableWeek,
} from "@/lib/student-os-types";

type FieldMarket = {
  demandLevel: string;
  outlook: string;
  salaryOutlook: string;
  signals: string[];
};

const FIELD_MARKET: Record<string, FieldMarket> = {
  "Artificial Intelligence Engineering": {
    demandLevel: "Very high",
    outlook: "AI and ML roles remain among the fastest-growing technical careers, with strong demand for applied LLM, MLOps, and data skills.",
    salaryOutlook: "Entry roles are competitive; salaries rise sharply with production ML and deployment experience.",
    signals: [
      "Employers prioritise shipped projects over certificates.",
      "LLM, RAG, and evaluation skills are increasingly requested.",
      "MLOps and cloud deployment separate strong candidates.",
    ],
  },
  "Software Engineering": {
    demandLevel: "High",
    outlook: "Software roles stay broad and resilient, with steady demand across web, backend, and product teams.",
    salaryOutlook: "Healthy entry-level range; specialisation and system-design depth drive growth.",
    signals: [
      "Data structures and system design dominate interviews.",
      "A deployed full-stack project is strong proof of work.",
      "Open-source contributions stand out to reviewers.",
    ],
  },
  Cybersecurity: {
    demandLevel: "High",
    outlook: "Security talent shortages keep demand strong across SOC, cloud, and application security.",
    salaryOutlook: "Solid entry salaries; certifications plus hands-on labs accelerate progression.",
    signals: [
      "Hands-on labs and CTFs demonstrate real capability.",
      "Cloud security knowledge is increasingly required.",
      "Clear incident write-ups impress hiring teams.",
    ],
  },
  "Business Analytics": {
    demandLevel: "Growing",
    outlook: "Analytics and BI roles are expanding as every team becomes data-driven.",
    salaryOutlook: "Moderate entry salaries with fast growth into product and data-science tracks.",
    signals: [
      "SQL plus a clear dashboard portfolio wins interviews.",
      "Storytelling with data is a differentiator.",
      "Experimentation and metrics literacy are valued.",
    ],
  },
  "Law and Public Policy": {
    demandLevel: "Steady",
    outlook: "Legal and policy careers remain stable, with growing legal-tech and compliance niches.",
    salaryOutlook: "Varies widely by jurisdiction, firm, and specialisation.",
    signals: [
      "Strong writing and research samples matter most.",
      "Legal-tech literacy is an emerging advantage.",
      "Internships and moots build credibility.",
    ],
  },
  "Medicine and Clinical Practice": {
    demandLevel: "High but regulated",
    outlook: "Healthcare pathways have durable demand, but progression depends on accredited study, licensing, supervised practice, and country-specific rules.",
    salaryOutlook: "Highly dependent on country, specialty, training stage, and licensing status.",
    signals: [
      "Official accreditation and licensing matter more than informal certificates.",
      "Clinical communication and ethics are core employability signals.",
      "Research, volunteering, and supervised exposure strengthen applications.",
    ],
  },
  "Photography and Visual Storytelling": {
    demandLevel: "Portfolio-driven",
    outlook: "Photography opportunities exist across commercial, editorial, event, product, and creator markets, with outcomes tied strongly to portfolio quality and client trust.",
    salaryOutlook: "Income varies widely by niche, geography, network, and freelance/business skills.",
    signals: [
      "A curated portfolio beats a long unedited gallery.",
      "Lighting, editing, and client communication separate beginners from paid work.",
      "Consistent personal projects help define a recognizable style.",
    ],
  },
  "Music Performance and Production": {
    demandLevel: "Competitive and network-led",
    outlook: "Music careers combine craft, collaboration, audience building, and diversified income through performance, teaching, production, sync, and content.",
    salaryOutlook: "Variable and often portfolio/gig-based; stable income usually comes from multiple streams.",
    signals: [
      "Strong recordings and live evidence matter more than claims.",
      "Collaboration and reliability drive repeat opportunities.",
      "Publishing, rights, and basic business skills protect income.",
    ],
  },
  "Research and Academia": {
    demandLevel: "Specialised",
    outlook: "Research pathways reward depth, writing, methods, supervisor fit, and evidence of independent inquiry.",
    salaryOutlook: "Varies by funding, country, discipline, and academic versus industry path.",
    signals: [
      "A focused research question helps supervisors assess fit.",
      "Writing samples and methods evidence are key.",
      "Conference posters, lab work, and literature reviews build credibility.",
    ],
  },
  "Design and Creative Practice": {
    demandLevel: "Portfolio-driven",
    outlook: "Design careers reward strong taste, user/client understanding, craft, iteration, and the ability to explain decisions.",
    salaryOutlook: "Varies by specialism, location, and portfolio strength.",
    signals: [
      "Case studies are stronger than isolated visuals.",
      "Critique and iteration are expected in serious portfolios.",
      "Communication and client framing matter alongside craft.",
    ],
  },
};

function marketFor(field: string): FieldMarket {
  return (
    FIELD_MARKET[field] || {
      demandLevel: "Growing",
      outlook: `Demand for ${field} roles is steady, with the strongest outcomes for candidates who show real, documented work samples and feedback loops.`,
      salaryOutlook: "Entry salaries vary by country and employer; verify current ranges on official job boards.",
      signals: [
        "Documented work samples beat certificates alone.",
        "A clear portfolio and online presence improve callbacks.",
        "Networking and referrals shorten the path to interviews.",
      ],
    }
  );
}

function buildTimetable(profile: DomainProfile, answers: StudentAnswers): TimetableWeek[] {
  const hours = Number(answers.weeklyHours) > 0 ? Number(answers.weeklyHours) : 8;
  const proof = proofStrategy(profile);
  const split = `${hours}h/week — ~60% learning, ~30% practice/proof, ~10% reflection`;
  const [s1, s2, s3, s4] = profile.requiredSkills;
  const role = profile.targetRoles[0];

  const themes: Array<{ theme: string; tasks: string[] }> = [
    {
      theme: `Foundations: ${s1 || "core skill 1"}`,
      tasks: [
        `Complete a focused tutorial on ${s1 || "your first core skill"}.`,
        proof.practiceTask,
        `Write a short reflection in ${proof.platform}.`,
      ],
    },
    {
      theme: `Foundations: ${s2 || "core skill 2"}`,
      tasks: [
        `Create a small practice piece using ${s2 || "your second core skill"}.`,
        "Read one real program, role, audition, brief, or professional profile and list the skills you still need.",
        `Add notes, references, and feedback to ${proof.platform}.`,
      ],
    },
    {
      theme: `Apply: ${s3 || "core skill 3"}`,
      tasks: [
        `Start ${proof.article} combining ${s1 || "skill 1"} and ${s3 || "skill 3"}.`,
        "Sketch the problem, inputs, and expected outcome.",
        proof.trackTask,
      ],
    },
    {
      theme: `Apply: ${s4 || "core skill 4"}`,
      tasks: [
        `Finish a first version of ${proof.artifact}.`,
        "Add process notes, evidence, and a clear explanation.",
        "Ask one person to try it and give feedback.",
      ],
    },
    {
      theme: "Portfolio proof — build",
      tasks: [
        `Define ${proof.article} that signals readiness for ${role}.`,
        proof.buildTask,
        "Log small progress consistently.",
      ],
    },
    {
      theme: "Portfolio proof — polish",
      tasks: [
        "Write a short story: brief, process, choices, feedback, and trade-offs.",
        "Add a limitations, ethics, or safety section where relevant.",
        proof.publishTask,
      ],
    },
    {
      theme: "Evidence & presence",
      tasks: [
        proof.profileTask,
        "Update your LinkedIn headline and summary.",
        `Draft a one-paragraph story for each ${proof.artifact}.`,
      ],
    },
    {
      theme: "Close skill gaps",
      tasks: [
        `Target your weak spots: ${profile.missingSkills.join(", ")}.`,
        "Do focused drills on each gap.",
        `Add one gap-closing improvement to ${proof.artifact}.`,
      ],
    },
    {
      theme: "Applications — shortlist",
      tasks: [
        "Shortlist 6-9 roles or programs and split into ambitious/target/safe.",
        "Tailor your resume to the top three.",
        "Note each deadline and requirement (verify on official sites).",
      ],
    },
    {
      theme: "Applications — apply",
      tasks: [
        "Submit your first batch of applications.",
        `Personalise each one with ${proof.article} or evidence link.`,
        "Track responses in a simple sheet.",
      ],
    },
    {
      theme: "Interview prep",
      tasks: [
        `Practice the core topics: ${profile.requiredSkills.slice(0, 4).join(", ")}.`,
        "Rehearse explaining your decisions, constraints, feedback, and trade-offs.",
        "Do one timed interview drill, critique, audition run-through, case discussion, or practice task.",
      ],
    },
    {
      theme: "Mock interview & review",
      tasks: [
        proof.reviewTask,
        "Collect feedback and fix the top two weaknesses.",
        "Plan the next 12 weeks based on what you learned.",
      ],
    },
  ];

  return themes.map((entry, index) => ({
    label: `Week ${index + 1}`,
    theme: entry.theme,
    hoursFocus: split,
    tasks: entry.tasks,
  }));
}

// An English test is "ready" if a score was entered or none is required.
function englishReady(answers: StudentAnswers): boolean {
  if (answers.englishScore.trim().length > 0) return true;
  return /not required|native/i.test(answers.englishTest);
}

function hasCareerGap(answers: StudentAnswers): boolean {
  const gap = answers.careerGap.trim().toLowerCase();
  return gap.length > 0 && gap !== "no gap" && gap !== "no gaps";
}

function formatFocus(focus: string[] | unknown) {
  if (Array.isArray(focus)) return focus.length ? focus.join(", ") : "Complete Career Plan";
  if (typeof focus === "string" && focus.trim()) return focus;
  return "Complete Career Plan";
}

function wantsFormalStudy(answers: StudentAnswers) {
  const text = `${answers.studyGoal} ${answers.studyLocationIntent}`.toLowerCase();
  return !/(do not|don't|dont|not planning formal study)/i.test(text);
}

export function buildOfflineIntelligence(
  profile: DomainProfile,
  answers: StudentAnswers,
  skillScore: number,
  _roadmap: RoadmapStep[],
): CareerIntelligence {
  const market = marketFor(profile.normalizedField);
  const role = profile.targetRoles[0];
  const country = answers.studyCountries[0] || answers.country || "your target country";
  const currency = answers.budgetCurrency || "selected currency";
  const proof = proofStrategy(profile);
  const formalStudy = wantsFormalStudy(answers);

  const riskStrategy: RiskItem[] = [
    {
      risk: `Skill gaps in ${profile.missingSkills.slice(0, 2).join(" and ")} could block ${role} applications.`,
      severity: skillScore < 55 ? "High" : "Medium",
      mitigation: `Convert each missing skill into ${proof.article} over the next 8 weeks.`,
    },
    {
      risk: `Thin ${proof.evidenceLabel} makes it hard to stand out without referrals, auditions, supervisor fit, or interviews.`,
      severity: answers.hasProjects.toLowerCase() === "yes" ? "Low" : "Medium",
      mitigation: `${proof.mitigation}`,
    },
  ];

  if (formalStudy) {
    riskStrategy.push(
      {
        risk:
          answers.needScholarship.toLowerCase() === "yes"
            ? `Funding and scholarship competition can delay study plans in ${currency}.`
            : `Tuition and living costs can exceed early estimates in ${currency}.`,
        severity: answers.needScholarship.toLowerCase() === "yes" ? "High" : "Medium",
        mitigation: `Verify ${country} fees and scholarship deadlines early on official university pages, and prepare a budget buffer.`,
      },
      {
        risk: englishReady(answers)
          ? "Application timing can slip without a tracked deadline list."
          : `An English test score (${answers.englishTest || "exam to be decided"}) that is not yet secured can stall admissions timelines.`,
        severity: englishReady(answers) ? "Low" : "Medium",
        mitigation: "Lock dates for your English test and applications now, and work backwards from each deadline.",
      },
    );
  } else {
    riskStrategy.push(
      {
        risk: "Without formal study, progress can feel unclear unless you choose a visible proof path.",
        severity: "Medium",
        mitigation: `Use ${proof.article} as the anchor: build, publish, ask for feedback, and review progress every 2 weeks.`,
      },
      {
        risk: "Flexible routes can become too broad if you compare too many options at once.",
        severity: "Low",
        mitigation: `Shortlist only 3 routes for ${role}: one project route, one work/volunteer route, and one certificate or mentor-guided route.`,
      },
    );
  }

  if (hasCareerGap(answers)) {
    riskStrategy.push({
      risk: `A study/career gap (${answers.careerGap}) can prompt questions from admissions teams or employers.`,
      severity: /more than 2|1.?2 years/i.test(answers.careerGap) ? "Medium" : "Low",
      mitigation:
        "Frame the gap honestly: show what you learned or built during it, and connect it to your target role in a short, confident sentence.",
    });
  }

  const fallbackOptions: FallbackOption[] = domainFallbackOptions(profile, role);

  return {
    headline: `${role} pathway intelligence for ${profile.normalizedField}`,
    fitSummary: `Based on your goal of ${role}, your strengths in ${(answers.skills[0] || answers.subjects[0] || "your current interests")} give you a workable start. Your current readiness is ${skillScore}/100, and closing ${profile.missingSkills.slice(0, 2).join(" and ")} is the highest-leverage next move.${/not planning|don't|dont|do not/i.test(answers.studyLocationIntent || answers.studyGoal) ? " Since you are not choosing formal study right now, the plan leans into coaching, proof-building, and flexible non-degree routes." : ""}`,
    jobMarket: {
      demandLevel: market.demandLevel,
      outlook: market.outlook,
      salaryOutlook: market.salaryOutlook,
      signals: market.signals,
      exampleTitles: profile.targetRoles,
    },
    riskStrategy,
    fallbackOptions,
    detailedTimetable: buildTimetable(profile, answers),
    source: "offline",
  };
}

function domainFallbackOptions(profile: DomainProfile, role: string): FallbackOption[] {
  if (/health/i.test(profile.parentDomain)) {
    return [
      {
        option: "Adjacent healthcare exposure",
        whenToUse: "If direct clinical entry is not available yet.",
        firstStep: "Seek supervised volunteering, shadowing, research assistant work, or healthcare support exposure.",
      },
      {
        option: "Domestic-first licensing route",
        whenToUse: "If international fees, exams, or licensing timelines are too risky.",
        firstStep: "Map domestic accredited programs and official licensing requirements before applying abroad.",
      },
      {
        option: "Research or public-health bridge",
        whenToUse: "If you want healthcare impact while strengthening clinical applications.",
        firstStep: "Build a small literature summary or public-health project with supervisor feedback.",
      },
    ];
  }

  if (/creative|design|architecture/i.test(profile.parentDomain)) {
    return [
      {
        option: "Assistant / studio route",
        whenToUse: "If direct paid work is too competitive at first.",
        firstStep: "Offer assistant, intern, or studio-support work while building a sharper portfolio.",
      },
      {
        option: "Local-client portfolio route",
        whenToUse: "If you need visible proof fast.",
        firstStep: "Complete 2-3 small local briefs with clear before/after, process, and testimonial notes.",
      },
      {
        option: "Academic portfolio route",
        whenToUse: "If you need a stronger university application.",
        firstStep: "Prepare a compact portfolio PDF with 8-12 curated pieces and critique notes.",
      },
    ];
  }

  if (/performing arts/i.test(profile.parentDomain)) {
    return [
      {
        option: "Session / collaboration route",
        whenToUse: "If solo opportunities are slow.",
        firstStep: "Collaborate on one recording, live set, or production credit to build proof and network.",
      },
      {
        option: "Teaching / workshop bridge",
        whenToUse: "If you need income while improving craft.",
        firstStep: "Offer beginner lessons or workshops and document student outcomes responsibly.",
      },
      {
        option: "Content and release route",
        whenToUse: "If you need audience evidence.",
        firstStep: "Release a short performance clip or demo every week for four weeks and track response.",
      },
    ];
  }

  if (/research/i.test(profile.parentDomain)) {
    return [
      {
        option: "Research assistant route",
        whenToUse: "If PhD entry is not ready yet.",
        firstStep: "Contact labs or supervisors with a focused research interest and writing sample.",
      },
      {
        option: "Taught master's or methods bridge",
        whenToUse: "If your methods background is thin.",
        firstStep: "Choose a methods-heavy course and produce a literature review before applying.",
      },
      {
        option: "Industry research route",
        whenToUse: "If academic funding is uncertain.",
        firstStep: "Target analyst, lab, policy, or R&D assistant roles that build research evidence.",
      },
    ];
  }

  return [
    {
      option: `Adjacent role to ${role}`,
      whenToUse: "If direct roles are too competitive at first.",
      firstStep: `Target a nearby role such as ${profile.targetRoles[1] || "an associate role"} to build experience.`,
    },
    {
      option: "Domestic-first study path",
      whenToUse: "If study-abroad funding does not come through in time.",
      firstStep: "Apply to strong local programs or online degrees while you reapply for funding next cycle.",
    },
    {
      option: "Apprenticeship / internship route",
      whenToUse: "If you want income and experience before a full degree.",
      firstStep: "Look for internships, apprenticeships, or graduate schemes that train on the job.",
    },
    {
      option: "Freelance / open-source bridge",
      whenToUse: "If you need proof of work fast.",
      firstStep: "Take small field-relevant tasks, collaborations, or contributions to build a public track record.",
    },
  ];
}

// Attempts an LLM-generated, richer intelligence layer. Returns null on any
// failure so the caller keeps the deterministic offline version.
export async function enrichIntelligenceWithAI(
  report: AimuraStudentReport,
): Promise<CareerIntelligence | null> {
  const { domainProfile: profile, answers } = report;

  const system = [
    "You are the Aimura AI career intelligence engine.",
    "Return ONLY valid minified JSON, no markdown, no commentary.",
    "Be specific, realistic, and encouraging. Never guarantee jobs, admissions, visas, or salaries.",
    "Never mention any third-party model or company; you are Aimura AI.",
  ].join(" ");

  const schema = `{
"headline": string,
"fitSummary": string (2-3 sentences),
"jobMarket": {"demandLevel": string, "outlook": string, "salaryOutlook": string, "signals": string[3-5], "exampleTitles": string[3-5]},
"riskStrategy": [{"risk": string, "severity": "Low"|"Medium"|"High", "mitigation": string}] (3-5 items),
"fallbackOptions": [{"option": string, "whenToUse": string, "firstStep": string}] (3-5 items),
"detailedTimetable": [{"label": string, "theme": string, "hoursFocus": string, "tasks": string[2-4]}] (exactly 12 weekly entries)
}`;

  const user = [
    "Generate career intelligence as JSON matching this schema exactly:",
    schema,
    "",
    "STUDENT:",
    `Name: ${report.studentName}`,
    `Age: ${answers.age || "n/a"}, Country: ${answers.country || "n/a"}, Education: ${answers.educationLevel || "n/a"}, Field: ${answers.fieldOfStudy || "n/a"}, GPA: ${answers.gpa || "n/a"}`,
    `Dream role: ${answers.dreamRole} | Target roles: ${profile.targetRoles.join(", ")}`,
    `Dream companies: ${answers.dreamCompanies.join(", ") || "n/a"} | Career priority: ${answers.careerPriority || "n/a"}`,
    `Normalized field: ${profile.normalizedField} | Required skills: ${profile.requiredSkills.join(", ")}`,
    `Known skills: ${answers.skills.join(", ") || "n/a"} | Missing: ${profile.missingSkills.join(", ")}`,
    `Skill score: ${report.skillScore}/100`,
    wantsFormalStudy(answers)
      ? `Study goal: ${answers.studyGoal || "n/a"} | Location intent: ${answers.studyLocationIntent || "n/a"} | Study countries: ${answers.studyCountries.join(", ") || answers.country || "n/a"} | Budget (${answers.budgetCurrency || "selected currency"}): ${answers.budgetRange || "n/a"} | Scholarship needed: ${answers.needScholarship || "n/a"} | English test: ${answers.englishTest || "n/a"} (score: ${answers.englishScore || "not provided"})`
      : `Formal study: not selected right now. Do not create university, scholarship, visa, or English-test recommendations unless the student asks to revisit study later.`,
    `Study/career gap: ${answers.careerGap || "not specified"}`,
    `Weekly hours: ${answers.weeklyHours || "n/a"} | Learning style: ${answers.learningStyle || "n/a"} | Speed: ${answers.learningSpeed || "n/a"}`,
    `Support preference: ${answers.supportPreference || "n/a"} | Main focus requested: ${formatFocus(answers.helpFocus)}`,
    "",
    "The detailedTimetable MUST have exactly 12 weekly entries, each grounded in this student's skills and goal.",
  ].join("\n");

  const result = await completeText(system, user).catch(() => null);
  if (!result) return null;

  const parsed = extractJson(result.text);
  if (!parsed) return null;

  const source = result.engine === "foundry" ? "foundry" : "ai";
  const validated = coerceIntelligence(parsed, source);
  if (!validated) return null;
  return validated;
}

function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function asSeverity(value: unknown): RiskItem["severity"] {
  return value === "Low" || value === "Medium" || value === "High" ? value : "Medium";
}

function proofStrategy(profile: DomainProfile) {
  if (/health/i.test(profile.parentDomain)) {
    return {
      artifact: "clinical learning evidence",
      article: "one supervised clinical reflection, research summary, or health-science case note",
      platform: "your supervised learning log",
      evidenceLabel: "clinical or research evidence",
      practiceTask: "Review one anatomy, biology, ethics, or patient-communication concept and write a short note.",
      trackTask: "Track progress privately; never publish patient-identifiable information.",
      buildTask: "Write a supervised reflection, case-style exercise, or research summary.",
      publishTask: "Save it in an application-safe portfolio or supervisor-reviewed folder.",
      profileTask: "Organise your learning log, CV, volunteering, research, and official requirement notes.",
      reviewTask: "Run one mock interview, clinical reflection review, or research discussion.",
      mitigation: "Create one supervisor-safe learning log, research summary, or volunteering reflection before applying.",
    };
  }

  if (/creative|design|architecture/i.test(profile.parentDomain)) {
    return {
      artifact: "portfolio work",
      article: "one portfolio piece or creative case study",
      platform: "your portfolio",
      evidenceLabel: "portfolio evidence",
      practiceTask: "Complete one small sketch, shoot, layout, prototype, model, or edit.",
      trackTask: "Track progress with drafts, contact sheets, critique notes, or before/after images.",
      buildTask: "Create a finished piece with process notes and critique.",
      publishTask: "Publish it to a portfolio, PDF, or private application folder.",
      profileTask: "Curate your strongest pieces into a clean portfolio sequence.",
      reviewTask: "Run one critique, portfolio review, or mock client presentation.",
      mitigation: "Finish one polished portfolio piece with process notes, feedback, and a clear final outcome.",
    };
  }

  if (/performing arts/i.test(profile.parentDomain)) {
    return {
      artifact: "performance or production evidence",
      article: "one recording, composition, showreel clip, or rehearsal log",
      platform: "your showreel or listening folder",
      evidenceLabel: "performance evidence",
      practiceTask: "Record a short practice take and note timing, tone, technique, and expression.",
      trackTask: "Track progress with rehearsal notes, recordings, credits, and feedback.",
      buildTask: "Create one polished recording, composition, production, or performance sample.",
      publishTask: "Save or publish a short audition-ready clip with credits and notes.",
      profileTask: "Curate your strongest recordings, performances, credits, and artist statement.",
      reviewTask: "Run one mock audition, listening review, or performance critique.",
      mitigation: "Record one polished sample and get critique from a teacher, collaborator, or practitioner.",
    };
  }

  if (/research/i.test(profile.parentDomain)) {
    return {
      artifact: "research evidence",
      article: "one literature review, methods memo, poster, or writing sample",
      platform: "your research portfolio",
      evidenceLabel: "research evidence",
      practiceTask: "Read one paper and write a claim-evidence-methods summary.",
      trackTask: "Track progress with citations, methods notes, and supervisor questions.",
      buildTask: "Write a short literature review, poster outline, or methods memo.",
      publishTask: "Save it as a writing sample or supervisor-ready discussion note.",
      profileTask: "Organise a CV, writing sample, topic interests, methods evidence, and supervisor list.",
      reviewTask: "Run one supervisor-style research discussion or writing review.",
      mitigation: "Produce one focused writing sample or methods memo before contacting supervisors.",
    };
  }

  if (/computer|data|technology|cyber/i.test(profile.parentDomain)) {
    return {
      artifact: "technical project evidence",
      article: "one working project, notebook, repository, or technical case study",
      platform: "GitHub or your technical portfolio",
      evidenceLabel: "technical portfolio evidence",
      practiceTask: "Build or solve 3-5 small exercises and save them with notes.",
      trackTask: "Track progress through commits, screenshots, evaluation notes, or a project log.",
      buildTask: "Build the core feature, experiment, or analysis end to end.",
      publishTask: "Deploy, record, or document a short demo.",
      profileTask: "Pin your two best repositories, notebooks, or technical case studies.",
      reviewTask: "Run one mock interview, code review, or portfolio walkthrough.",
      mitigation: "Ship one small working project with setup steps, screenshots, and limitations.",
    };
  }

  return {
    artifact: "field-relevant proof",
    article: "one field-relevant artifact, case study, or project",
    platform: "your portfolio or application folder",
    evidenceLabel: "portfolio evidence",
    practiceTask: "Complete one small practice task tied to your target role.",
    trackTask: "Track progress with notes, drafts, examples, and feedback.",
    buildTask: "Create one finished artifact with a clear goal, process, and result.",
    publishTask: "Save it in a portfolio, application folder, or personal site.",
    profileTask: "Curate your best work, feedback, references, and next-step notes.",
    reviewTask: "Run one mock interview, review, critique, or presentation.",
    mitigation: "Create one field-relevant artifact and document the goal, process, result, and limitations.",
  };
}

// Validates the LLM JSON into our type. Requires the core blocks to be present
// and the timetable to be non-trivial; otherwise we keep the offline version.
function coerceIntelligence(
  raw: Record<string, unknown>,
  source: CareerIntelligence["source"],
): CareerIntelligence | null {
  const market = (raw.jobMarket || {}) as Record<string, unknown>;
  const timetable = Array.isArray(raw.detailedTimetable) ? raw.detailedTimetable : [];
  if (timetable.length < 6) return null;

  const risks = Array.isArray(raw.riskStrategy) ? raw.riskStrategy : [];
  const fallbacks = Array.isArray(raw.fallbackOptions) ? raw.fallbackOptions : [];
  if (!risks.length || !fallbacks.length) return null;

  return {
    headline: asString(raw.headline, "Career pathway intelligence"),
    fitSummary: asString(raw.fitSummary, ""),
    jobMarket: {
      demandLevel: asString(market.demandLevel, "Growing"),
      outlook: asString(market.outlook, ""),
      salaryOutlook: asString(market.salaryOutlook, "Varies by country and employer."),
      signals: asStringArray(market.signals),
      exampleTitles: asStringArray(market.exampleTitles),
    },
    riskStrategy: risks
      .map((item) => {
        const r = (item || {}) as Record<string, unknown>;
        return {
          risk: asString(r.risk),
          severity: asSeverity(r.severity),
          mitigation: asString(r.mitigation),
        };
      })
      .filter((item) => item.risk && item.mitigation),
    fallbackOptions: fallbacks
      .map((item) => {
        const f = (item || {}) as Record<string, unknown>;
        return {
          option: asString(f.option),
          whenToUse: asString(f.whenToUse),
          firstStep: asString(f.firstStep),
        };
      })
      .filter((item) => item.option && item.firstStep),
    detailedTimetable: timetable
      .map((item, index) => {
        const w = (item || {}) as Record<string, unknown>;
        return {
          label: asString(w.label, `Week ${index + 1}`),
          theme: asString(w.theme),
          hoursFocus: asString(w.hoursFocus, ""),
          tasks: asStringArray(w.tasks),
        };
      })
      .filter((item) => item.theme && item.tasks.length > 0),
    source,
  };
}
