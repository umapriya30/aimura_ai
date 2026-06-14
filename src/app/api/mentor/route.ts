import { streamMentorReply, type ChatMessage } from "@/lib/ai-provider";
import { type AimuraStudentReport } from "@/lib/student-os-types";

export const runtime = "nodejs";

const MENTOR_PERSONA = [
  "You are the Aimura AI mentor, a warm, sharp, and practical study-to-career coach.",
  "You speak directly to one student and help them turn their goal into concrete next steps.",
  "Style: encouraging but honest, specific, and concise. Prefer short paragraphs and tight bullet lists.",
  "Always ground advice in the student's own profile data provided below. Reference their real skills, gaps, roadmap, country, and budget.",
  "Answer the SPECIFIC question asked — never give a generic all-purpose reply. Vary your wording and structure between turns; do not repeat the same opener twice.",
  "End most replies with one short, relevant follow-up question to keep the conversation going. If the student seems confused or vague, ask one clarifying question before advising.",
  "Use the recent conversation for context so follow-ups like \"why\" or \"tell me more\" continue the previous topic.",
  "Never claim to be any third-party model, company, or product other than Aimura AI. If asked what you are, say you are the Aimura AI mentor.",
  "Safety: you give educational and career guidance only. Never guarantee admission, visas, scholarships, salaries, or job offers. When the student asks about those, remind them to verify with official providers.",
].join(" ");

function wantsFormalStudy(report: AimuraStudentReport) {
  const text = `${report.answers.studyGoal} ${report.answers.studyLocationIntent}`.toLowerCase();
  return !/(do not|don't|dont|not planning formal study)/i.test(text);
}

function buildSystemPrompt(report: AimuraStudentReport) {
  const profile = report.domainProfile;
  const answers = report.answers;
  const formalStudy = wantsFormalStudy(report);
  const roadmap = report.roadmap
    .map((step) => `- ${step.phase} (${step.timeframe}): ${step.focus}`)
    .join("\n");

  return [
    MENTOR_PERSONA,
    "",
    "STUDENT PROFILE:",
    `Name: ${report.studentName}`,
    `Normalized field: ${profile.normalizedField} (parent: ${profile.parentDomain})`,
    `Target roles: ${profile.targetRoles.join(", ")}`,
    `Required skills: ${profile.requiredSkills.join(", ")}`,
    `Missing / priority skills: ${profile.missingSkills.join(", ")}`,
    `Current Aimura skill score: ${report.skillScore}/100`,
    `Age: ${answers.age || "not specified"}, residence: ${answers.country || "not specified"}`,
    `Education: ${answers.educationLevel || "not specified"} in ${answers.fieldOfStudy || "not specified"} (GPA ${answers.gpa || "n/a"})`,
    `Dream companies: ${answers.dreamCompanies.join(", ") || "not specified"}; career priority: ${answers.careerPriority || "not specified"}`,
    formalStudy
      ? `Next study goal: ${answers.studyGoal || "not specified"}; study location intent: ${answers.studyLocationIntent || "not specified"}; preferred study countries: ${answers.studyCountries.join(", ") || answers.country || "not specified"}`
      : "Formal study is not selected right now. Do not push universities, visas, scholarships, or English-test planning unless the student asks to revisit study later.",
    formalStudy
      ? `Budget (${answers.budgetCurrency || "selected currency"}): ${answers.budgetRange || "not specified"}; scholarship needed: ${answers.needScholarship || "n/a"}; English test: ${answers.englishTest || "n/a"} (score: ${answers.englishScore || "not provided"}); study/career gap: ${answers.careerGap || "not specified"}`
      : `Flexible-path context: focus on proof-building, mentor coaching, internships, apprenticeships, volunteering, entry projects, certificates, or self-led practice. Study/career gap: ${answers.careerGap || "not specified"}`,
    `Learning style: ${answers.learningStyle || "not specified"} (${answers.learningSpeed || "n/a"})`,
    `Weekly study hours: ${answers.weeklyHours || "not specified"}`,
    `Experience flags — projects: ${answers.hasProjects || "n/a"}, internship: ${answers.hasInternship || "n/a"}, GitHub: ${answers.hasGithub || "n/a"}, LinkedIn: ${answers.hasLinkedin || "n/a"}`,
    `Support preference: ${answers.supportPreference || "not specified"}; main focus requested: ${formatFocus(answers.helpFocus)}`,
    "",
    "JOB MARKET (from the student's report):",
    `Demand: ${report.intelligence.jobMarket.demandLevel}. ${report.intelligence.jobMarket.outlook}`,
    "",
    "ROADMAP:",
    roadmap,
    "",
    `One-line summary already shown to the student: ${report.summary}`,
  ].join("\n");
}

function formatFocus(focus: string[] | unknown) {
  if (Array.isArray(focus)) return focus.length ? focus.join(", ") : "Complete Career Plan";
  if (typeof focus === "string" && focus.trim()) return focus;
  return "Complete Career Plan";
}

function hashStr(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

type MentorContext = {
  report: AimuraStudentReport;
  first: string;
  role: string;
  role2: string;
  field: string;
  skills: string[];
  missing: string[];
  hours: string;
  studyCountries: string;
  budget: string;
  score: number;
  formalStudy: boolean;
  proof: ReturnType<typeof mentorProofStrategy>;
  seed: number;
  deeper: boolean;
};

type Intent = {
  id: string;
  keywords: string[];
  build: (c: MentorContext) => string;
};

// A small career-coaching knowledge base. Each intent is scored against the
// student's question; the best match answers, grounded in the real report.
const INTENTS: Intent[] = [
  {
    id: "no-study",
    keywords: ["dont want to study", "don't want to study", "do not want to study", "no study", "not study", "skip college", "no university", "hate studying", "study feels wrong"],
    build: (c) => lines(
      `That's allowed, ${c.first}. Aimura is here to help you think clearly, not force a degree.`,
      "",
      "First, name the reason honestly:",
      "- Is it cost, pressure, low interest, fear of failure, bad past experience, or wanting to work sooner?",
      `- If you still want ${c.role}, we can test a non-degree route through ${c.proof.evidenceLabel}, internships, apprenticeships, local projects, volunteering, or client work.`,
      "- If you simply need a pause, keep one tiny learning habit alive so returning later feels easier.",
      "",
      "If your mind changes later, come back and Aimura will rebuild the study plan with you. What is the biggest reason study does not feel right right now?",
    ),
  },
  {
    id: "learn-first",
    keywords: ["learn first", "start learning", "where do i start", "where to start", "what to learn", "begin", "basics", "foundation", "prerequisite", "first step", "study first"],
    build: (c) => lines(
      pick([`Start here, ${c.first} — don't try to learn everything at once.`, `Good instinct to ask, ${c.first}. Sequence beats intensity.`], c.seed),
      "",
      `1. ${c.skills[0]} first — it unlocks the most of everything else for ${c.role}.`,
      `2. Then ${c.skills[1] || c.skills[0]}, applied immediately to a tiny piece of work.`,
      `3. Use a learn → practice → proof loop: 40% one focused resource, 40% making ${c.proof.smallArtifact}, 20% writing what you learned.`,
      "",
      `Which one do you want to go deep on first — ${c.skills[0]} or ${c.skills[1] || "something else"}?`,
    ),
  },
  {
    id: "weekly-plan",
    keywords: ["this week", "today", "daily", "routine", "schedule", "plan my week", "weekly", "this month", "next 7 days", "what now", "what should i do"],
    build: (c) => {
      const wk = c.report.intelligence.detailedTimetable[c.deeper ? 1 : 0];
      return lines(
        pick([`Here's a focused week, ${c.first}:`, `Let's make this week count, ${c.first}.`], c.seed),
        "",
        `Theme: ${wk?.theme ?? `Foundations in ${c.skills[0]}`} (${c.hours}h — ~60% learn / 30% build / 10% document).`,
        ...((wk?.tasks ?? [`Study ${c.skills[0]} with one focused resource.`, `Make ${c.proof.smallArtifact}.`, "Write a short log of what you learned."]).map((t) => `- ${t}`)),
        "",
        "Want me to turn this into a day-by-day breakdown?",
      );
    },
  },
  {
    id: "roadmap",
    keywords: ["roadmap", "timeline", "how long", "how many months", "by when", "step by step", "long term", "next year", "stages", "phases", "plan for"],
    build: (c) => lines(
      `Here's the shape of your journey to ${c.role}, ${c.first}:`,
      "",
      ...c.report.roadmap.map((s) => `- ${s.phase} (${s.timeframe}): ${s.focus}`),
      "",
      "It's about 24 weeks if you stay consistent. Which phase do you want to unpack — foundation, portfolio, applications, or interviews?",
    ),
  },
  {
    id: "skill-score",
    keywords: ["score", "how strong", "how good", "ready", "readiness", "chance", "good enough", "qualified", "am i", "my level", "where do i stand"],
    build: (c) => lines(
      `Your readiness right now is ${c.score}/100, ${c.first} — ${c.score >= 70 ? "a solid base to build on" : c.score >= 50 ? "a workable starting point" : "early days, which is completely normal"}.`,
      "",
      `What's working: a clear goal mapped to ${c.field}, and skills like ${c.skills[0]}.`,
      `What's holding the number down: ${c.missing.join(", ")}.`,
      `Fastest way up: turn each gap into ${c.proof.article}, then get feedback from ${c.proof.reviewer}. Evidence moves the score, not certificates alone.`,
      "",
      `Want a plan to close ${c.missing[0]} specifically?`,
    ),
  },
  {
    id: "gaps",
    keywords: ["gap", "missing", "weak", "lacking", "what am i missing", "weakness", "behind", "catch up", "close my"],
    build: (c) => lines(
      `Your priority gaps for ${c.role} are: ${c.missing.join(", ")}.`,
      "",
      `- ${c.missing[0]}: build one small thing that forces you to use it this month.`,
      `- ${c.missing[1] || c.missing[0]}: pair it with feedback from ${c.proof.reviewer}.`,
      "- Don't try to close all gaps at once — one visible proof per gap beats five half-finished courses.",
      "",
      `Want resources for ${c.missing[0]}, or a project idea that covers two gaps at once?`,
    ),
  },
  {
    id: "projects",
    keywords: ["project", "portfolio", "github", "build", "proof", "showreel", "case study", "what to make", "side project", "personal project"],
    build: (c) => {
      const idea = c.report.portfolioPlan.projectIdeas[c.deeper ? 1 : 0] ?? c.report.portfolioPlan.projectIdeas[0];
      return lines(
        `Strongest proof move for ${c.role}, ${c.first}:`,
        "",
        `- Build: "${idea?.title ?? "a focused starter project"}".`,
        `- Aim for: ${idea?.outcome ?? c.proof.outcome}`,
        `- Stack/skills: ${(idea?.stack ?? c.skills.slice(0, 3)).join(", ")}.`,
        `- Store it in ${c.proof.platform} with process, feedback, and limitations — reviewers trust honesty.`,
        "",
        "Want me to break this project into weekly milestones?",
      );
    },
  },
  {
    id: "resume",
    keywords: ["resume", "cv", "curriculum", "bullet", "one page"],
    build: (c) => lines(
      `Let's make your CV land for ${c.role}, ${c.first}:`,
      "",
      `- Headline: "${c.report.portfolioPlan.linkedInHeadline}".`,
      ...c.report.portfolioPlan.resumeBullets.slice(0, 3).map((b) => `- ${b}`),
      "- Rule: every bullet = action + skill + result. Lead with evidence, not adjectives.",
      "",
      "Want me to rewrite one of your real experiences into a strong bullet?",
    ),
  },
  {
    id: "linkedin",
    keywords: ["linkedin", "personal brand", "online presence", "profile headline", "network online", "visibility"],
    build: (c) => lines(
      `Your LinkedIn should signal "future ${c.role}", ${c.first}:`,
      "",
      `- Headline: "${c.report.portfolioPlan.linkedInHeadline}".`,
      `- About: 3 lines — where you are, what you're building (${c.skills.slice(0, 2).join(", ")}), where you're headed.`,
      "- Post one short build-log a week. Quiet profiles get ignored; visible learners get DMs.",
      "",
      "Want a draft of your About section?",
    ),
  },
  {
    id: "interview",
    keywords: ["interview", "hr round", "technical round", "mock", "questions they ask", "crack the interview", "viva", "audition"],
    build: (c) => lines(
      `Interview prep for ${c.role}, ${c.first} — three layers:`,
      "",
      `- Fundamentals: be fluent in ${c.report.portfolioPlan.interviewTopics.slice(0, 3).join(", ")}.`,
      `- Story: pick one project where you used ${c.skills.slice(0, 2).join(" and ")} and improved after feedback — rehearse it in 60 seconds.`,
      "- Honesty: name the skill you're actively building. Coachable beats fake-perfect.",
      "",
      "Want to practice a mock answer right here? Give me a question they might ask.",
    ),
  },
  {
    id: "jobs",
    keywords: ["internship", "job", "apply", "application", "placement", "hiring", "get hired", "no experience", "fresher", "entry level", "first job", "land a"],
    build: (c) => lines(
      pick([`Getting that first role is a numbers + proof game, ${c.first}.`, `Here's how to break in, ${c.first}.`], c.seed),
      "",
      `- Proof first: one strong ${c.proof.evidenceLabel} item beats a long list of courses.`,
      "- Apply in batches of 5-9, each personalised with a project link.",
      `- Use the side door: internships, apprenticeships, freelance, or open contributions — anything that gives real ${c.field} experience.`,
      `- Fallback if direct roles are tough: aim for ${c.role2}, then move up.`,
      "",
      "Want help writing a short, personalised application message?",
    ),
  },
  {
    id: "salary",
    keywords: ["salary", "pay", "money", "earn", "package", "income", "stipend", "ctc", "how much do", "compensation"],
    build: (c) => lines(
      `On pay for ${c.role}, ${c.first} — honest version:`,
      "",
      `- ${c.report.intelligence.jobMarket.salaryOutlook}`,
      "- Early salary depends on proof, not just your degree. Demonstrated skill raises offers.",
      "- Check current ranges on real job boards for your country before you anchor on a number.",
      "",
      "I can't promise figures, but I can help you build the evidence that earns higher offers. Want to start with your biggest gap?",
    ),
  },
  {
    id: "market",
    keywords: ["market", "demand", "scope", "future", "growth", "worth it", "good career", "in demand", "saturated", "is it a good", "trend"],
    build: (c) => lines(
      `Market reality for ${c.field}: demand is ${c.report.intelligence.jobMarket.demandLevel.toLowerCase()}.`,
      "",
      `- ${c.report.intelligence.jobMarket.outlook}`,
      ...c.report.intelligence.jobMarket.signals.slice(0, 2).map((s) => `- ${s}`),
      `- Your edge: ${c.proof.evidenceLabel} plus ${c.skills.slice(0, 2).join(" and ")}.`,
      "",
      "Want to see which specific skills employers ask for most in this field?",
    ),
  },
  {
    id: "universities",
    keywords: ["universit", "college", "study abroad", "masters", "ms ", "abroad", "which university", "shortlist", "course to study", "degree", "program"],
    build: (c) => {
      if (!c.formalStudy) {
        return lines(
          `${c.first}, you chose not to pursue formal study right now, so I won't force university shortlists.`,
          "",
          `- Start with visible proof for ${c.role}: create ${c.proof.smallArtifact} and save it in ${c.proof.platform}.`,
          "- Compare non-degree routes: entry projects, internships, apprenticeships, volunteering, certificates, or mentor-guided practice.",
          "- Keep a study option open only if it genuinely supports your goal later.",
          "",
          "Want me to map 3 non-degree routes for your current situation?",
        );
      }
      const unis = c.report.universityMatches.slice(0, 3).map((u) => u.name).filter(Boolean);
      return lines(
        `For ${c.studyCountries}, build a 3-tier shortlist, ${c.first}:`,
        "",
        "- Ambitious (2-3): stretch programs where your evidence must shine.",
        "- Target (3-4): realistic for your grades, budget, and requirements.",
        "- Safer (2): clearer entry routes or better scholarship odds.",
        ...(unis.length ? [`From your report, look at: ${unis.join(", ")}.`] : []),
        "- Verify every requirement on the official university and visa pages — I can guide strategy, but not guarantee admission.",
        "",
        "Want help deciding which countries fit your budget best?",
      );
    },
  },
  {
    id: "scholarship",
    keywords: ["scholarship", "funding", "fees", "afford", "financial", "cost", "expensive", "cheap", "budget", "tuition", "grant", "loan"],
    build: (c) =>
      c.formalStudy
        ? lines(
            `On funding, ${c.first} — your budget is ${c.budget || "tight"}, so be strategic:`,
            "",
            "- Target merit + need scholarships early; deadlines are often months before admission.",
            "- Favour countries/universities known for funding international students in your field.",
            "- A strong portfolio and a clear statement of purpose directly improve scholarship odds.",
            "- Lower-cost routes: public universities, EU options, or online + on-campus hybrids.",
            "",
            "Always confirm fees and scholarship terms on official pages. Want a list of what makes a scholarship application strong?",
          )
        : lines(
            `On cost, ${c.first}: since formal study is not selected, keep spending tied to proof, not degrees.`,
            "",
            "- Prioritise free/low-cost practice, internships, volunteering, apprenticeships, and mentor feedback.",
            `- Spend only where it helps you produce ${c.proof.evidenceLabel}.`,
            "- Revisit scholarships only if you later choose a formal study path.",
            "",
            "Want a low-cost 4-week proof-building plan?",
          ),
  },
  {
    id: "visa",
    keywords: ["visa", "immigration", "pr ", "settle", "work permit", "sponsor", "relocate", "post study", "stay back"],
    build: (c) =>
      c.formalStudy
        ? lines(
            `Visa and stay-back rules matter a lot for ${c.studyCountries}, ${c.first}:`,
            "",
            "- Check each country's post-study work visa length and conditions — they change often.",
            "- Pick programs/cities with stronger job markets in your field for better odds.",
            "- Keep documents (finances, English test, offer letter) ready early.",
            "",
            "I can't give legal or guaranteed immigration advice — always verify on the official government site. Want help comparing post-study options by country?",
          )
        : lines(
            `${c.first}, visa planning only matters if you decide to study or work abroad later.`,
            "",
            "- For now, focus on proof and local/flexible routes in your current country.",
            "- If relocation becomes a goal, verify current rules on official government pages.",
            "- Keep documents organised, but do not let visa planning distract from building evidence.",
            "",
            "Want help choosing a local next step instead?",
          ),
  },
  {
    id: "english-test",
    keywords: ["ielts", "toefl", "pte", "english test", "language test", "duolingo test"],
    build: (c) =>
      c.formalStudy
        ? lines(
            `On the English test, ${c.first} — you picked "${c.report.answers.englishTest || "not set yet"}"${c.report.answers.englishScore ? ` (score: ${c.report.answers.englishScore})` : ""}:`,
            "",
            "- Book it early; offers and visas often need the score before deadlines.",
            "- Typical targets: IELTS ~6.5-7.0, TOEFL ~90-100, PTE ~58-65, Duolingo ~115-125 — check each university's exact requirement.",
            "- 3-4 focused weeks of daily practice is usually enough if your English base is good.",
            "",
            "Want a 3-week prep outline for it?",
          )
        : lines(
            `${c.first}, you do not need an English-test plan unless you decide to apply for formal study later.`,
            "",
            "- Put that energy into communication proof: writing samples, presentations, client notes, or interview stories.",
            "- If study becomes active later, come back and I will help you plan IELTS/TOEFL/PTE properly.",
            "",
            "Want a communication-practice task for this week?",
          ),
  },
  {
    id: "networking",
    keywords: ["network", "mentor", "community", "connect", "referral", "cold email", "reach out", "linkedin people", "find people", "alumni"],
    build: (c) => lines(
      pick([`Networking is just learning in public, ${c.first}.`, `This is underrated, ${c.first} — most roles come through people.`], c.seed),
      "",
      `- Join 2 communities where ${c.role}s hang out (Discord, subreddits, local meetups, alumni groups).`,
      "- Share one thing you built each week — it gives people a reason to reply.",
      "- Cold-message with a specific question + your work link, not just \"can you help me\".",
      "",
      "Want a short, polite outreach message you can reuse?",
    ),
  },
  {
    id: "motivation",
    keywords: ["motivat", "procrastinat", "time management", "busy", "balance", "burnout", "tired", "lazy", "consistency", "discipline", "focus", "no time"],
    build: (c) => lines(
      pick([`Real talk, ${c.first}: motivation follows action, not the other way round.`, `Been there, ${c.first}. Let's shrink it down.`], c.seed),
      "",
      `- Commit to just ${Math.max(2, Math.round(Number(c.hours) / 3) || 3)}h this week, not a heroic plan you'll abandon.`,
      "- Same time, same place, smallest next step — consistency beats intensity.",
      "- Track a simple streak; visible progress is its own fuel.",
      "",
      "What's the main thing getting in the way — time, focus, or not knowing the next step?",
    ),
  },
  {
    id: "switch-field",
    keywords: ["switch", "change career", "change field", "pivot", "transition", "too late", "too old", "restart", "non tech", "different field", "start over"],
    build: (c) => lines(
      `Switching into ${c.field} is very doable, ${c.first} — and rarely "too late".`,
      "",
      "- Bridge, don't bulldoze: map skills you already have onto the new field.",
      `- Build 1-2 ${c.proof.evidenceLabel} pieces that prove you can do the new work.`,
      `- A clear story (\"why I'm moving toward ${c.role}\") matters as much as the skills.`,
      "",
      "Want help framing your switch as a strength in your story?",
    ),
  },
  {
    id: "decision",
    keywords: [" or ", " vs ", "versus", "should i choose", "better option", "which is better", "confused between", "can't decide", "cannot decide", "torn between"],
    build: (c) => lines(
      `Let's make this decision concrete, ${c.first} — feelings stall, criteria decide.`,
      "",
      "- Score each option 1-5 on: interest, job demand, cost, and how fast you can show proof.",
      "- Talk to one person actually doing each option for a reality check.",
      "- Pick the one you can take a real step on this week, then re-evaluate after the step.",
      "",
      "Tell me the two options you're weighing and I'll help you compare them.",
    ),
  },
  {
    id: "fallback",
    keywords: ["backup", "plan b", "fallback", "alternative", "if it doesn't work", "if i fail", "rejected", "not selected", "what if it"],
    build: (c) => {
      const fb = c.report.intelligence.fallbackOptions[0];
      return lines(
        `Smart to plan a safety net, ${c.first}. From your report:`,
        "",
        ...c.report.intelligence.fallbackOptions.slice(0, 3).map((f) => `- ${f.option}: ${f.firstStep}`),
        "",
        `Strongest first backup: ${fb?.option ?? c.role2}. Want me to detail how to set it up in parallel?`,
      );
    },
  },
  {
    id: "about",
    keywords: ["who are you", "what can you do", "how can you help", "what do you do", "your name", "are you a bot", "are you ai"],
    build: (c) => lines(
      `I'm your Aimura AI mentor, ${c.first} — I coach you from where you are now toward ${c.role}.`,
      "",
      "Ask me about: what to learn first, your weekly plan, closing skill gaps, projects, CV/LinkedIn, interviews, jobs, salaries, universities, scholarships, visas, or staying motivated.",
      "",
      "What's on your mind today?",
    ),
  },
];

const GREETINGS = ["hi", "hello", "hey", "yo", "hii", "hiya", "good morning", "good evening", "namaste", "hola"];
const THANKS = ["thank", "thanks", "thx", "appreciate", "helpful", "got it", "great answer", "awesome"];
const CONFUSION = ["confus", "overwhelm", "don't know", "dont know", "lost", "stuck", "no idea", "too much", "anxious", "scared", "nervous", "give up", "hopeless", "help me", "i'm new", "im new", "where do i even"];

function scoreIntent(intent: Intent, q: string) {
  let score = 0;
  for (const keyword of intent.keywords) {
    if (!q.includes(keyword)) continue;
    // Multi-word phrases and longer, more specific words outweigh short
    // generic ones (so "universit" beats a generic "apply", etc.).
    if (keyword.includes(" ")) score += 3;
    else if (keyword.length >= 7) score += 2;
    else score += 1;
  }
  return score;
}

// Deterministic, profile-grounded mentor that classifies the question across
// many career topics so different questions get genuinely different answers.
function offlineMentorReply(report: AimuraStudentReport, messages: ChatMessage[]) {
  const userTurns = messages.filter((m) => m.role === "user");
  const lastUser = userTurns[userTurns.length - 1]?.content ?? "";
  const prevUser = userTurns[userTurns.length - 2]?.content ?? "";
  const q = lastUser.toLowerCase().trim();

  const profile = report.domainProfile;
  const isFollowUp = q.length <= 18 && /^(more|why|how|example|explain|continue|go on|tell me more|elaborate|details?|ok(ay)?|yes|yeah|sure|and\??|then\??|next\??)/.test(q);
  // A short follow-up continues the previous topic.
  const effectiveQ = (isFollowUp && prevUser ? `${prevUser} ${q}` : q).toLowerCase();

  const ctx: MentorContext = {
    report,
    first: report.studentName.split(" ")[0] || "there",
    role: profile.targetRoles[0] || "your target role",
    role2: profile.targetRoles[1] || "a nearby starter role",
    field: profile.normalizedField,
    skills: profile.requiredSkills.length ? profile.requiredSkills : ["your core skill"],
    missing: profile.missingSkills.length ? profile.missingSkills : ["portfolio evidence", "interview readiness"],
    hours: report.answers.weeklyHours || "6",
    studyCountries: report.answers.studyCountries.join(", ") || report.answers.country || "your preferred countries",
    budget: report.answers.budgetRange,
    score: report.skillScore,
    formalStudy: wantsFormalStudy(report),
    proof: mentorProofStrategy(report),
    seed: hashStr(lastUser),
    deeper: isFollowUp,
  };

  // High-priority conversational intents.
  if (q.length <= 24 && GREETINGS.some((g) => q === g || q.startsWith(`${g} `) || q.startsWith(`${g},`))) {
    return lines(
      pick([`Hey ${ctx.first}! 👋 Great to have you.`, `Hi ${ctx.first} — ready when you are.`], ctx.seed),
      "",
      `You're working toward ${ctx.role} in ${ctx.field}, score ${ctx.score}/100. Ask me anything — what to learn first, your weekly plan, closing ${ctx.missing[0]}, projects, universities, or interviews.`,
      "",
      "What would you like to start with?",
    );
  }
  if (q.length <= 30 && THANKS.some((t) => q.includes(t)) && scoreBest(effectiveQ).score === 0) {
    return lines(
      pick([`Anytime, ${ctx.first} — that's what I'm here for. 🙌`, `You're welcome, ${ctx.first}!`], ctx.seed),
      "",
      `Want to keep the momentum? A good next question: "what should I do this week?" or "how do I close ${ctx.missing[0]}?"`,
    );
  }
  if (CONFUSION.some((w) => q.includes(w))) {
    return lines(
      pick([`Totally normal to feel that way, ${ctx.first} — let's shrink it down.`, `Breathe, ${ctx.first}. We'll take one small step.`], ctx.seed),
      "",
      `- One skill this week: ${ctx.missing[0]}.`,
      `- One small proof: ${ctx.proof.smallArtifact}.`,
      "- One person to ask for feedback.",
      "",
      "Clarity comes after a small honest attempt, not before it. What part feels most overwhelming — the goal, the skills, or the plan?",
    );
  }

  // Specific-skill question (mentions one of their required/missing skills).
  const namedSkill = [...profile.requiredSkills, ...profile.missingSkills].find((s) => effectiveQ.includes(s.toLowerCase()));
  const best = scoreBest(effectiveQ);
  if (namedSkill && best.score < 2) {
    return lines(
      `For ${namedSkill}, ${ctx.first}, run a tight loop:`,
      "",
      `- Learn: one focused resource on ${namedSkill}, not five scattered ones.`,
      `- Apply: build ${ctx.proof.smallArtifact} that forces you to use ${namedSkill}.`,
      `- Prove: write what changed and get feedback from ${ctx.proof.reviewer}.`,
      `${namedSkill} is a direct readiness signal for ${ctx.role}.`,
      "",
      `Want a 1-week plan to get going on ${namedSkill}?`,
    );
  }

  if (best.intent && best.score > 0) {
    return best.intent.build(ctx);
  }

  // Reflective default that still moves them forward and invites a sharper question.
  return lines(
    pick([`Good question, ${ctx.first}. Let me anchor it to your goal: ${ctx.role} in ${ctx.field}.`, `Let's connect that to your path toward ${ctx.role}, ${ctx.first}.`], ctx.seed),
    "",
    `- It likely ties back to one of your gaps: ${ctx.missing.slice(0, 2).join(", ")}.`,
    `- The move that always helps: turn it into ${ctx.proof.article} instead of only reading about it.`,
    `- Keep it realistic at ${ctx.hours} hours/week.`,
    "",
    "Tell me a bit more and I'll get specific — are you asking about learning, projects, universities, jobs, or something else?",
  );

  function scoreBest(question: string): { intent: Intent | null; score: number } {
    let bestIntent: Intent | null = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      const score = scoreIntent(intent, question);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    return { intent: bestIntent, score: bestScore };
  }
}

function lines(...parts: string[]) {
  return parts.join("\n");
}

function mentorProofStrategy(report: AimuraStudentReport) {
  const parent = report.domainProfile.parentDomain;
  if (/health/i.test(parent)) {
    return {
      article: "one supervised clinical reflection or research summary",
      smallArtifact: "an anonymised case-style reflection or one-page research summary",
      platform: "your supervised learning log",
      reviewer: "a teacher, supervisor, doctor, or healthcare mentor",
      evidenceLabel: "clinical/research evidence",
      outcome: "a safe, supervisor-reviewed piece of evidence that shows reasoning, ethics, and communication.",
    };
  }
  if (/creative|design|architecture/i.test(parent)) {
    return {
      article: "one portfolio piece or creative case study",
      smallArtifact: "a finished shoot, design, model, layout, or before/after edit",
      platform: "Behance, a PDF portfolio, Adobe Portfolio, or a personal site",
      reviewer: "a teacher, client, senior student, or working creative",
      evidenceLabel: "portfolio evidence",
      outcome: "a curated piece with process, final result, critique, and improvement notes.",
    };
  }
  if (/performing arts/i.test(parent)) {
    return {
      article: "one recording, showreel clip, or rehearsal log",
      smallArtifact: "a polished 60-90 second recording or performance clip",
      platform: "your showreel, SoundCloud, YouTube, or private audition folder",
      reviewer: "a teacher, collaborator, producer, or performer",
      evidenceLabel: "performance evidence",
      outcome: "a listenable sample with credits, notes, feedback, and a next-practice target.",
    };
  }
  if (/research/i.test(parent)) {
    return {
      article: "one literature review, methods memo, or research note",
      smallArtifact: "a one-page paper summary or research interest memo",
      platform: "your research portfolio or writing sample folder",
      reviewer: "a supervisor, professor, lab member, or PhD student",
      evidenceLabel: "research evidence",
      outcome: "a clear writing sample that shows question, evidence, method, and next reading.",
    };
  }
  if (/computer|data|technology|cyber/i.test(parent)) {
    return {
      article: "one working project, notebook, repository, or technical case study",
      smallArtifact: "a small working demo, analysis, notebook, or lab write-up",
      platform: "GitHub or a technical portfolio",
      reviewer: "a mentor, engineer, professor, or technical peer",
      evidenceLabel: "technical portfolio evidence",
      outcome: "a runnable or inspectable project with setup, screenshots, evaluation, and limitations.",
    };
  }
  return {
    article: "one field-relevant artifact or case study",
    smallArtifact: "a small piece of work that proves one target skill",
    platform: "your portfolio, application folder, LinkedIn, or personal site",
    reviewer: "a teacher, mentor, peer, or practitioner",
    evidenceLabel: "portfolio evidence",
    outcome: "a clear artifact with goal, process, result, feedback, and next improvement.",
  };
}

function textToStream(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 14));
      }
      controller.close();
    },
  });
}

function safeHeader(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").slice(0, 600);
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  let body: { report?: AimuraStudentReport; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const report = body?.report;
  const messages = Array.isArray(body?.messages)
    ? body.messages.filter(isValidMessage).slice(-12)
    : [];

  if (!report || !report.domainProfile || messages.length === 0) {
    return Response.json(
      { message: "A generated report and at least one message are required." },
      { status: 400 },
    );
  }

  const system = buildSystemPrompt(report);

  let result: Awaited<ReturnType<typeof streamMentorReply>> = { stream: null, configured: [], failures: [] };
  try {
    result = await streamMentorReply(system, messages);
  } catch {
    result = { stream: null, configured: [], failures: [{ engine: "offline", message: "Mentor provider chain failed before a live provider could start." }] };
  }

  const live = result.stream;
  if (live) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of live.generator) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch {
          // A mid-stream interruption simply ends the response gracefully.
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-aimura-engine": live.engine,
        "x-aimura-configured-providers": result.configured.join(",") || "none",
        "x-aimura-provider-errors": safeHeader(result.failures.map((failure) => `${failure.engine}: ${failure.message}`).join(" | ")),
      },
    });
  }

  const fallbackText = offlineMentorReply(report, messages);

  return new Response(textToStream(fallbackText), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-aimura-engine": "offline",
      "x-aimura-configured-providers": result.configured.join(",") || "none",
      "x-aimura-provider-errors": safeHeader(result.failures.map((failure) => `${failure.engine}: ${failure.message}`).join(" | ")),
    },
  });
}
