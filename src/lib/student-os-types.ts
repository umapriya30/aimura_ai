export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

// Structured intake covering basic profile, goals, interests, skills,
// study-abroad preferences, learning style, mentorship, and the final focus.
export type StudentAnswers = {
  // 1. Basic profile
  fullName: string;
  age: string;
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  gpa: string;
  // 2. Career goals
  dreamRole: string;
  dreamCompanies: string[];
  careerPriority: string;
  // 3. Interests & preferences
  subjects: string[];
  workStyle: string;
  activities: string[];
  // 4. Skills & experience
  skills: string[];
  hasProjects: string;
  hasInternship: string;
  hasGithub: string;
  hasLinkedin: string;
  careerGap: string;
  // 5. Study-abroad preferences
  studyCountries: string[];
  budgetRange: string;
  needScholarship: string;
  englishTest: string;
  englishScore: string;
  // 6. Learning preferences
  weeklyHours: string;
  learningStyle: string;
  learningSpeed: string;
  // 7. Mentorship & networking
  wantMentor: string;
  wantCommunity: string;
  // Final trigger
  helpFocus: string;
};

export type DomainProfile = {
  normalizedField: string;
  parentDomain: string;
  confidence: number;
  targetRoles: string[];
  requiredSkills: string[];
  missingSkills: string[];
  sources: string[];
  freeApiSignals: string[];
  paidApiReady: string[];
};

export type LiveResource = {
  title: string;
  provider: string;
  url: string;
  description: string;
  format: string;
  level?: string;
};

export type UniversityMatch = {
  name: string;
  country: string;
  fitReason: string;
  url: string;
  tier: "Ambitious" | "Target" | "Safe" | "Live source";
};

export type PortfolioPlan = {
  projectIdeas: Array<{
    title: string;
    outcome: string;
    stack: string[];
  }>;
  githubChecklist: string[];
  linkedInHeadline: string;
  resumeBullets: string[];
  interviewTopics: string[];
};

export type RoadmapStep = {
  phase: string;
  timeframe: string;
  focus: string;
  actions: string[];
};

export type MentorPrompt = {
  question: string;
  answer: string;
};

// Career intelligence is the LLM-enriched layer (with a deterministic offline
// fallback). `source` is an internal, vendor-neutral label only.
export type JobMarketStatus = {
  demandLevel: string;
  outlook: string;
  salaryOutlook: string;
  signals: string[];
  exampleTitles: string[];
};

export type RiskItem = {
  risk: string;
  severity: "Low" | "Medium" | "High";
  mitigation: string;
};

export type FallbackOption = {
  option: string;
  whenToUse: string;
  firstStep: string;
};

export type TimetableWeek = {
  label: string;
  theme: string;
  hoursFocus: string;
  tasks: string[];
};

export type CareerIntelligence = {
  headline: string;
  fitSummary: string;
  jobMarket: JobMarketStatus;
  riskStrategy: RiskItem[];
  fallbackOptions: FallbackOption[];
  detailedTimetable: TimetableWeek[];
  source: "foundry" | "ai" | "offline";
};

export type AimuraStudentReport = {
  id: string;
  generatedAt: string;
  studentName: string;
  summary: string;
  skillScore: number;
  answers: StudentAnswers;
  domainProfile: DomainProfile;
  intelligence: CareerIntelligence;
  learningResources: LiveResource[];
  universityMatches: UniversityMatch[];
  portfolioPlan: PortfolioPlan;
  roadmap: RoadmapStep[];
  mentorPrompts: MentorPrompt[];
  safetyNote: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
};

export type InsightResponse = {
  success: boolean;
  message?: string;
  report?: AimuraStudentReport;
  saved?: boolean;
  sessionInvalid?: boolean;
};
