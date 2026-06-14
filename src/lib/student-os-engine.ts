import { buildOfflineIntelligence } from "@/lib/intelligence";
import {
  type AimuraStudentReport,
  type DomainProfile,
  type LiveResource,
  type PortfolioPlan,
  type RoadmapStep,
  type ScoreBreakdown,
  type StudentAnswers,
  type UniversityMatch,
} from "@/lib/student-os-types";

const SAFETY_NOTE =
  "Aimura AI provides educational and career guidance, not guarantees. Verify admissions, visa, scholarship, cost, university, and employment details with official providers.";

type WikipediaResponse = {
  query?: {
    search?: Array<{ title?: string; snippet?: string }>;
  };
};

type OpenAlexWork = {
  id?: string;
  title?: string;
  display_name?: string;
  publication_year?: number;
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  };
};

type GitHubRepo = {
  id?: number;
  full_name?: string;
  html_url?: string;
  description?: string;
  language?: string;
  topics?: string[];
  stargazers_count?: number;
};

type HipolabsUniversity = {
  name?: string;
  country?: string;
  web_pages?: string[];
};

type DomainRule = {
  pattern: RegExp;
  normalizedField: string;
  parentDomain: string;
  targetRoles: string[];
  requiredSkills: string[];
};

const DOMAIN_RULES: DomainRule[] = [
  {
    pattern: /(\bai\b|artificial intelligence|machine learning|\bml\b|ml engineer|deep learning|data science|computer vision|nlp)/i,
    normalizedField: "Artificial Intelligence Engineering",
    parentDomain: "Computer Science",
    targetRoles: ["AI Engineer", "Machine Learning Engineer", "Data Scientist"],
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "MLOps", "System Design"],
  },
  {
    pattern: /(software|developer|web|frontend|backend|full stack|app developer|mobile)/i,
    normalizedField: "Software Engineering",
    parentDomain: "Computer Science",
    targetRoles: ["Software Engineer", "Full Stack Developer", "Backend Engineer"],
    requiredSkills: ["JavaScript", "TypeScript", "Data Structures", "APIs", "Databases", "Testing", "Cloud"],
  },
  {
    pattern: /(cyber|security|soc|ethical hacking|network security)/i,
    normalizedField: "Cybersecurity",
    parentDomain: "Computer Science",
    targetRoles: ["Cybersecurity Analyst", "Cloud Security Engineer", "SOC Analyst"],
    requiredSkills: ["Networking", "Linux", "Python", "Threat Analysis", "SIEM", "Cloud Security"],
  },
  {
    pattern: /(business analyst|product analyst|analytics|data analyst|\bbi\b|power bi|business intelligence)/i,
    normalizedField: "Business Analytics",
    parentDomain: "Business and Data",
    targetRoles: ["Business Analyst", "Product Analyst", "Data Analyst"],
    requiredSkills: ["SQL", "Excel", "Statistics", "Dashboards", "Storytelling", "Experimentation"],
  },
  {
    pattern: /(\bphd\b|doctoral|researcher|research scientist|research assistant|academic researcher|laboratory researcher|lab researcher|thesis|publication|supervisor fit)/i,
    normalizedField: "Research and Academia",
    parentDomain: "Research",
    targetRoles: ["Researcher", "PhD Candidate", "Research Assistant"],
    requiredSkills: [
      "Research Design",
      "Literature Review",
      "Statistics",
      "Academic Writing",
      "Data Analysis",
      "Presentation",
      "Ethics",
      "Grant Awareness",
    ],
  },
  {
    pattern: /(doctor|medicine|medical|mbbs|physician|surgeon|nursing|dentist|pharmacy|clinical|healthcare|public health)/i,
    normalizedField: "Medicine and Clinical Practice",
    parentDomain: "Health Sciences",
    targetRoles: ["Doctor", "Clinical Researcher", "Healthcare Specialist"],
    requiredSkills: [
      "Human Biology",
      "Anatomy",
      "Clinical Reasoning",
      "Patient Communication",
      "Medical Ethics",
      "Evidence-Based Medicine",
      "Research Methods",
      "Resilience",
    ],
  },
  {
    pattern: /(photo|photographer|photography|cinematography|videography|film|camera|visual storyteller)/i,
    normalizedField: "Photography and Visual Storytelling",
    parentDomain: "Creative Arts",
    targetRoles: ["Photographer", "Photo Editor", "Visual Storyteller"],
    requiredSkills: [
      "Composition",
      "Lighting",
      "Camera Operation",
      "Photo Editing",
      "Visual Storytelling",
      "Client Communication",
      "Portfolio Curation",
      "Business Basics",
    ],
  },
  {
    pattern: /(music|musician|singer|composer|producer|audio|sound|guitar|piano|vocal|songwriter|dj)/i,
    normalizedField: "Music Performance and Production",
    parentDomain: "Performing Arts",
    targetRoles: ["Musician", "Music Producer", "Composer"],
    requiredSkills: [
      "Music Theory",
      "Ear Training",
      "Performance Practice",
      "Composition",
      "Audio Production",
      "Collaboration",
      "Stage Presence",
      "Portfolio Curation",
    ],
  },
  {
    pattern: /(design|ux|ui|graphic|illustrat|animation|product design|fashion|interior)/i,
    normalizedField: "Design and Creative Practice",
    parentDomain: "Design",
    targetRoles: ["Designer", "UX Designer", "Creative Director"],
    requiredSkills: [
      "Visual Design",
      "User Research",
      "Prototyping",
      "Design Systems",
      "Critique",
      "Portfolio Curation",
      "Client Communication",
    ],
  },
  {
    pattern: /(teacher|teaching|education|educator|professor|lecturer|tutor|curriculum)/i,
    normalizedField: "Education and Teaching",
    parentDomain: "Education",
    targetRoles: ["Teacher", "Education Specialist", "Curriculum Designer"],
    requiredSkills: [
      "Subject Mastery",
      "Lesson Planning",
      "Classroom Communication",
      "Assessment Design",
      "Inclusive Teaching",
      "Mentoring",
      "Reflective Practice",
    ],
  },
  {
    pattern: /(phd|research|scientist|academic|laboratory|lab|biotech|chemistry|physics|biology)/i,
    normalizedField: "Research and Academia",
    parentDomain: "Research",
    targetRoles: ["Researcher", "PhD Candidate", "Research Assistant"],
    requiredSkills: [
      "Research Design",
      "Literature Review",
      "Statistics",
      "Academic Writing",
      "Data Analysis",
      "Presentation",
      "Ethics",
      "Grant Awareness",
    ],
  },
  {
    pattern: /(architect|architecture|urban|construction|built environment|spatial|landscape)/i,
    normalizedField: "Architecture and Built Environment",
    parentDomain: "Architecture",
    targetRoles: ["Architect", "Urban Designer", "Architectural Assistant"],
    requiredSkills: [
      "Design Thinking",
      "Technical Drawing",
      "CAD",
      "Model Making",
      "Building Systems",
      "Sustainability",
      "Portfolio Curation",
    ],
  },
  {
    pattern: /(mechanical|civil|electrical|electronics|robotics|aerospace|automotive|manufacturing|engineer)/i,
    normalizedField: "Engineering and Applied Technology",
    parentDomain: "Engineering",
    targetRoles: ["Engineer", "Design Engineer", "Project Engineer"],
    requiredSkills: [
      "Mathematics",
      "Physics",
      "CAD",
      "Systems Thinking",
      "Testing",
      "Technical Documentation",
      "Project Management",
    ],
  },
  {
    pattern: /(finance|accounting|investment|banking|economics|actuarial|trading|wealth)/i,
    normalizedField: "Finance and Accounting",
    parentDomain: "Finance",
    targetRoles: ["Financial Analyst", "Accountant", "Investment Analyst"],
    requiredSkills: [
      "Financial Modeling",
      "Accounting",
      "Excel",
      "Statistics",
      "Market Research",
      "Ethics",
      "Communication",
    ],
  },
  {
    pattern: /(marketing|entrepreneur|startup|business owner|founder|sales|brand|management)/i,
    normalizedField: "Business, Marketing and Entrepreneurship",
    parentDomain: "Business",
    targetRoles: ["Entrepreneur", "Marketing Strategist", "Business Manager"],
    requiredSkills: [
      "Market Research",
      "Customer Discovery",
      "Brand Strategy",
      "Sales Communication",
      "Financial Basics",
      "Operations",
      "Storytelling",
    ],
  },
  {
    pattern: /(journal|media|content|writer|author|copywriter|broadcast|public relations|pr|communications)/i,
    normalizedField: "Journalism, Media and Communications",
    parentDomain: "Media",
    targetRoles: ["Journalist", "Content Strategist", "Communications Specialist"],
    requiredSkills: [
      "Research",
      "Writing",
      "Interviewing",
      "Editing",
      "Media Ethics",
      "Audience Strategy",
      "Digital Publishing",
    ],
  },
  {
    pattern: /(psychology|counsel|therapy|therapist|mental health|social work|human behaviour)/i,
    normalizedField: "Psychology and Human Services",
    parentDomain: "Social Sciences",
    targetRoles: ["Psychologist", "Counsellor", "Human Services Specialist"],
    requiredSkills: [
      "Psychology Foundations",
      "Research Methods",
      "Active Listening",
      "Ethics",
      "Case Notes",
      "Empathy",
      "Statistics",
    ],
  },
  {
    pattern: /(law|legal|policy|justice|advocate|lawyer)/i,
    normalizedField: "Law and Public Policy",
    parentDomain: "Legal Studies",
    targetRoles: ["Lawyer", "Policy Analyst", "Legal Tech Specialist"],
    requiredSkills: ["Legal Research", "Writing", "Case Analysis", "Policy Analysis", "Negotiation"],
  },
];

const DEFAULT_DOMAIN: DomainRule = {
  pattern: /.*/,
  normalizedField: "Personalized Interdisciplinary Pathway",
  parentDomain: "General Studies",
  targetRoles: ["Target Role", "Junior Specialist", "Project Contributor"],
  requiredSkills: [
    "Research",
    "Communication",
    "Problem Solving",
    "Portfolio Evidence",
    "Professional Networking",
    "Project Planning",
    "Other Field-Specific Skill",
  ],
};

function classifyByText(text: string): DomainRule | null {
  if (!text || !text.trim()) return null;
  return DOMAIN_RULES.find((rule) => rule.pattern.test(text)) || null;
}

// The domain is anchored to the TARGET ROLE first (what the student is aiming
// for), then their field of study, and only then to skills/interests. This is
// why a student who wants "AI Engineer" gets an AI plan even if their current
// study and skills are elsewhere — their readiness score will then reflect that
// gap, instead of the plan silently switching to their current field.
function classifyDomain(a: StudentAnswers): DomainRule {
  const byRole = classifyByText(a.dreamRole);
  if (byRole) return byRole;
  const byField = classifyByText(a.fieldOfStudy);
  if (byField) return byField;

  const skillsText = a.skills.join(" ");
  const scored = DOMAIN_RULES.map((rule) => {
    let s = 0;
    if (skillsText && rule.pattern.test(skillsText)) s += 2;
    const overlap = rule.requiredSkills.filter((rs) => skillsText.toLowerCase().includes(rs.toLowerCase())).length;
    s += Math.min(3, overlap);
    if (a.activities.length && rule.pattern.test(a.activities.join(" "))) s += 1;
    if (a.subjects.length && rule.pattern.test(a.subjects.join(" "))) s += 1;
    return { rule, s };
  });
  scored.sort((x, y) => y.s - x.s);
  return scored[0] && scored[0].s > 0 ? scored[0].rule : DEFAULT_DOMAIN;
}

// Maps free text (e.g. "Computer Science", "Biology", "Business") to a broad
// cluster so study-vs-role alignment works even for generic field names that
// the role-specific patterns don't match.
function textCluster(text: string): string | null {
  const t = text.toLowerCase();
  if (!t.trim()) return null;
  if (/comput|software|\bit\b|data scien|machine learning|\bai\b|artificial intelligence|information tech|cyber|programming|informatics|analytics/.test(t)) return "tech";
  if (/medic|health|nurs|clinic|biomed|pharma|dental|physio|doctor|surgeon|psycholog|therapy/.test(t)) return "health";
  if (/photo|film|video|music|\bart\b|design|fashion|media|creative|architect|drama|theatre|animation|journal/.test(t)) return "creative";
  if (/research|\bphd\b|biolog|chemist|physic|\bscience|laborator|biotech|neuro/.test(t)) return "research";
  if (/business|finance|account|econ|market|management|\bmba\b|commerce|banking|entrepreneur/.test(t)) return "business";
  if (/\blaw\b|legal|justice|policy|polit/.test(t)) return "law";
  if (/educat|teach|pedagog|curriculum/.test(t)) return "education";
  if (/engineer|mechanic|electric|civil|electronic|aerospace|robotic|manufactur/.test(t)) return "engineering";
  if (/sociolog|anthropolog|social work|human services/.test(t)) return "social";
  return null;
}

// Groups parent domains into broad clusters used for study-vs-role alignment.
function clusterOf(parentDomain: string): string {
  const p = parentDomain.toLowerCase();
  if (/computer|data|technology|cyber/.test(p)) return "tech";
  if (/health/.test(p)) return "health";
  if (/creative|design|architecture|performing|media/.test(p)) return "creative";
  if (/research/.test(p)) return "research";
  if (/business|finance/.test(p)) return "business";
  if (/legal/.test(p)) return "law";
  if (/education/.test(p)) return "education";
  if (/engineering/.test(p)) return "engineering";
  if (/social/.test(p)) return "social";
  return "general";
}

const RELATED_CLUSTERS: Record<string, string[]> = {
  tech: ["business", "engineering", "research"],
  business: ["tech", "law"],
  engineering: ["tech", "creative"],
  research: ["tech", "health", "education", "social"],
  health: ["research", "social"],
  creative: ["business", "engineering"],
  law: ["business", "social"],
  education: ["research", "social"],
  social: ["research", "health", "education"],
  general: [],
};

function clustersRelated(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  return (RELATED_CLUSTERS[a] || []).includes(b) || (RELATED_CLUSTERS[b] || []).includes(a);
}

export async function buildStudentOSReport(answers: StudentAnswers): Promise<AimuraStudentReport> {
  const profile = await buildDomainProfile(answers);
  const [learningResources, universityMatches] = await Promise.all([
    buildLearningResources(profile),
    buildUniversityMatches(profile, answers),
  ]);
  const portfolioPlan = buildPortfolioPlan(profile, answers);
  const roadmap = buildRoadmap(profile, answers);
  const readiness = computeReadiness(profile, answers);
  const skillScore = readiness.score;
  const studentName = answers.fullName.trim() || "Student";
  const summary = wantsFormalStudy(answers)
    ? `${studentName}, your plan is built around ${profile.normalizedField}. The next best move is to strengthen ${profile.missingSkills.slice(0, 2).join(" and ")} while creating visible proof for ${profile.targetRoles[0]}.`
    : `${studentName}, you said formal study does not feel right right now. Aimura will not force it; this plan focuses on coaching, flexible routes, and visible proof for ${profile.targetRoles[0]}, and we are here whenever your mind changes.`;

  return {
    id: `report_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    studentName,
    answers,
    domainProfile: profile,
    skillScore,
    scoreBreakdown: readiness.breakdown,
    intelligence: buildOfflineIntelligence(profile, answers, skillScore, roadmap),
    learningResources,
    universityMatches,
    portfolioPlan,
    roadmap,
    mentorPrompts: buildMentorPrompts(profile, answers, skillScore),
    summary,
    safetyNote: SAFETY_NOTE,
  };
}

export async function buildDomainProfile(answers: StudentAnswers): Promise<DomainProfile> {
  // Role and field of study drive the domain; interests are only a tiebreaker.
  const matched = classifyDomain(answers);
  const encoded = encodeURIComponent(answers.dreamRole || matched.normalizedField);
  const includeGithubSignals = isTechnologyDomain(matched.parentDomain);

  const [wiki, github] = await Promise.all([
    fetchJson<WikipediaResponse>(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*`),
    includeGithubSignals
      ? fetchJson<{ items?: GitHubRepo[] }>(`https://api.github.com/search/repositories?q=${encoded}+roadmap+skills&sort=stars&order=desc&per_page=20`)
      : Promise.resolve(null),
  ]);

  const githubSkills = includeGithubSignals ? (github?.items || [])
    .flatMap((repo) => [repo.language, ...(repo.topics || [])])
    .filter(Boolean)
    .slice(0, 4) as string[] : [];
  const requiredSkills = Array.from(new Set([...matched.requiredSkills, ...githubSkills, "Other / self-defined skill"])).slice(0, 10);
  const knownEvidence = knownEvidenceText(answers);
  const missingSkills = requiredSkills.filter((skill) => !hasKnownSkill(skill, knownEvidence)).slice(0, 4);
  const targetRoles = ensureTargetRoles(matched.targetRoles, answers.dreamRole);

  return {
    normalizedField: matched.normalizedField,
    parentDomain: matched.parentDomain,
    confidence: Math.min(0.98, 0.82 + (wiki?.query?.search?.length ? 0.06 : 0) + (github?.items?.length ? 0.05 : 0)),
    targetRoles,
    requiredSkills,
    missingSkills: missingSkills.length ? missingSkills : ["Visible proof", "Application readiness"],
    sources: [
      "Local career intent rules",
      wiki?.query?.search?.length ? "Wikipedia API" : "",
      includeGithubSignals && github?.items?.length ? "GitHub Search API" : "",
    ].filter(Boolean),
    freeApiSignals: [
      "Wikipedia",
      "OpenAlex",
      includeGithubSignals ? "GitHub" : "Curated field search links",
      "Hipolabs",
      "YouTube/Coursera/edX/search links",
    ],
    paidApiReady: ["Primary reasoning", "Backup reasoning", "Tavily", "YouTube Data API", "SerpAPI"],
  };
}

async function buildLearningResources(profile: DomainProfile): Promise<LiveResource[]> {
  const query = encodeURIComponent(`${profile.normalizedField} roadmap course`);
  const [openAlex, github] = await Promise.all([
    fetchJson<{ results?: OpenAlexWork[] }>(`https://api.openalex.org/works?search=${query}&per-page=12`),
    isTechnologyDomain(profile.parentDomain)
      ? fetchJson<{ items?: GitHubRepo[] }>(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=8`)
      : Promise.resolve(null),
  ]);

  const searchResources: LiveResource[] = [
    {
      title: `${profile.normalizedField} YouTube learning path`,
      provider: "YouTube",
      url: `https://www.youtube.com/results?search_query=${query}`,
      description: `Opens current lectures, tutorials, critiques, and portfolio walkthroughs for ${profile.normalizedField}.`,
      format: "Video search",
      level: "Open",
    },
    {
      title: `${profile.normalizedField} Coursera pathway`,
      provider: "Coursera",
      url: `https://www.coursera.org/search?query=${query}`,
      description: `Opens structured courses and guided learning for ${profile.normalizedField}.`,
      format: "Course search",
      level: "Beginner to advanced",
    },
    {
      title: `${profile.normalizedField} edX programs`,
      provider: "edX",
      url: `https://www.edx.org/search?q=${query}`,
      description: `Opens university-backed courses and certificates related to ${profile.normalizedField}.`,
      format: "Course search",
      level: "Open",
    },
    ...fieldSpecificResources(profile, query),
  ];

  const repos = (github?.items || []).slice(0, 4).map((repo) => ({
    title: repo.full_name || `${profile.normalizedField} GitHub project`,
    provider: "GitHub",
    url: repo.html_url || `https://github.com/search?q=${query}`,
    description: repo.description || `An open-source repository related to ${profile.normalizedField}. Opens GitHub.`,
    format: "Project",
    level: repo.language || "Open",
  }));

  const papers = (openAlex?.results || [])
    .filter((work) => work.primary_location?.landing_page_url)
    .slice(0, 3)
    .map((work) => ({
      title: work.title || work.display_name || `${profile.normalizedField} research signal`,
      provider: work.primary_location?.source?.display_name || "OpenAlex",
      url: work.primary_location?.landing_page_url || work.id || `https://api.openalex.org/works?search=${query}`,
      description: work.publication_year
        ? `Academic reference from ${work.publication_year}. Opens the publisher page.`
        : "Academic reference from OpenAlex. Opens the publisher page.",
      format: "Research",
      level: "Reference",
    }));

  return [...searchResources, ...repos, ...papers].slice(0, 12);
}

async function buildUniversityMatches(profile: DomainProfile, answers: StudentAnswers): Promise<UniversityMatch[]> {
  if (!wantsFormalStudy(answers)) return [];

  const preferredCountry =
    /stay/i.test(answers.studyLocationIntent)
      ? answers.country.trim() || "United Kingdom"
      : answers.studyCountries[0]?.trim() || answers.country.trim() || "United Kingdom";
  const universities = await fetchJson<HipolabsUniversity[]>(
    `https://universities.hipolabs.com/search?country=${encodeURIComponent(preferredCountry)}`,
  );

  const liveMatches = (universities || []).slice(0, 6).map((item): UniversityMatch => ({
    name: item.name || "University",
    country: item.country || preferredCountry,
    fitReason: `Live university registry match for ${preferredCountry}. Verify ${profile.normalizedField} programs, fees, and deadlines on the official site.`,
    url: item.web_pages?.[0] || `https://www.google.com/search?q=${encodeURIComponent(`${item.name} ${profile.normalizedField}`)}`,
    tier: "Live source",
  }));

  if (liveMatches.length) return liveMatches;

  // Curated fallback so this section is never a single empty search box.
  return curatedUniversities(preferredCountry, profile.normalizedField);
}

function curatedUniversities(country: string, field: string): UniversityMatch[] {
  if (/^india$/i.test(country.trim())) {
    return curatedIndianUniversities(field);
  }

  const lists: Record<string, Array<{ name: string; url: string }>> = {
    "United Kingdom": [
      { name: "University of Oxford", url: "https://www.ox.ac.uk" },
      { name: "Imperial College London", url: "https://www.imperial.ac.uk" },
      { name: "University of Edinburgh", url: "https://www.ed.ac.uk" },
      { name: "University of Manchester", url: "https://www.manchester.ac.uk" },
    ],
    Germany: [
      { name: "Technical University of Munich", url: "https://www.tum.de/en" },
      { name: "RWTH Aachen University", url: "https://www.rwth-aachen.de/go/id/a/?lidx=1" },
      { name: "Heidelberg University", url: "https://www.uni-heidelberg.de/en" },
    ],
    Canada: [
      { name: "University of Toronto", url: "https://www.utoronto.ca" },
      { name: "University of Waterloo", url: "https://uwaterloo.ca" },
      { name: "University of British Columbia", url: "https://www.ubc.ca" },
    ],
    "United States": [
      { name: "Massachusetts Institute of Technology", url: "https://www.mit.edu" },
      { name: "Stanford University", url: "https://www.stanford.edu" },
      { name: "Carnegie Mellon University", url: "https://www.cmu.edu" },
    ],
    Australia: [
      { name: "University of Melbourne", url: "https://www.unimelb.edu.au" },
      { name: "University of New South Wales", url: "https://www.unsw.edu.au" },
      { name: "Australian National University", url: "https://www.anu.edu.au" },
    ],
    Netherlands: [
      { name: "Delft University of Technology", url: "https://www.tudelft.nl/en" },
      { name: "University of Amsterdam", url: "https://www.uva.nl/en" },
      { name: "Eindhoven University of Technology", url: "https://www.tue.nl/en" },
    ],
    Ireland: [
      { name: "Trinity College Dublin", url: "https://www.tcd.ie" },
      { name: "University College Dublin", url: "https://www.ucd.ie" },
    ],
  };

  const picks = lists[country] || [];
  if (picks.length) {
    return picks.map((item) => ({
      name: item.name,
      country,
      fitReason: `Well-regarded ${country} option for ${field}. Always verify program details, fees, and entry requirements on the official site.`,
      url: item.url,
      tier: "Target",
    }));
  }

  return [
    {
      name: `${country} ${field} programs`,
      country,
      fitReason: "Curated registry was unavailable, so this opens a verified web search for matching programs.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${country} ${field} university programs`)}`,
      tier: "Live source",
    },
  ];
}

function curatedIndianUniversities(field: string): UniversityMatch[] {
  const lowerField = field.toLowerCase();
  const lists: Record<string, Array<{ name: string; url: string }>> = {
    health: [
      { name: "All India Institute of Medical Sciences, New Delhi", url: "https://www.aiims.edu" },
      { name: "Christian Medical College Vellore", url: "https://www.cmch-vellore.edu" },
      { name: "JIPMER Puducherry", url: "https://jipmer.edu.in" },
      { name: "Manipal Academy of Higher Education", url: "https://manipal.edu" },
    ],
    creative: [
      { name: "National Institute of Design", url: "https://www.nid.edu" },
      { name: "Srishti Manipal Institute of Art, Design and Technology", url: "https://srishtimanipalinstitute.in" },
      { name: "Film and Television Institute of India", url: "https://www.ftii.ac.in" },
      { name: "KM Music Conservatory", url: "https://kmmc.in" },
    ],
    business: [
      { name: "Indian Institute of Management Bangalore", url: "https://www.iimb.ac.in" },
      { name: "Faculty of Management Studies, University of Delhi", url: "https://fms.edu" },
      { name: "NMIMS Mumbai", url: "https://www.nmims.edu" },
      { name: "Indian School of Business", url: "https://www.isb.edu" },
    ],
    default: [
      { name: "Indian Institute of Science", url: "https://iisc.ac.in" },
      { name: "Indian Institute of Technology Delhi", url: "https://home.iitd.ac.in" },
      { name: "Indian Institute of Technology Bombay", url: "https://www.iitb.ac.in" },
      { name: "University of Delhi", url: "https://www.du.ac.in" },
    ],
  };

  const key =
    /(medicine|clinical|health|doctor|nursing|pharmacy|biology)/i.test(lowerField)
      ? "health"
      : /(design|creative|photo|music|film|visual|performing)/i.test(lowerField)
        ? "creative"
        : /(business|finance|marketing|management|entrepreneur|economics)/i.test(lowerField)
          ? "business"
          : "default";

  return lists[key].map((item) => ({
    name: item.name,
    country: "India",
    fitReason: `India-based option to investigate for ${field}. Verify the exact program, fees, entrance route, and deadlines on the official site.`,
    url: item.url,
    tier: "Target",
  }));
}

function buildPortfolioPlan(profile: DomainProfile, answers: StudentAnswers): PortfolioPlan {
  const role = profile.targetRoles[0];
  const name = answers.fullName.trim() || "Student";
  const proof = proofStrategy(profile);
  return {
    projectIdeas: [
      {
        title: proof.starterTitle,
        outcome: `Show the fundamentals needed for ${role} through ${proof.artifact} with clear context, process notes, and a measurable result.`,
        stack: profile.requiredSkills.slice(0, 4),
      },
      {
        title: proof.caseStudyTitle,
        outcome: `Explain the brief, constraints, decisions, feedback, and improvement loop like a ${role} interview story.`,
        stack: ["Research", "Reflection", "Communication"],
      },
      {
        title: proof.showcaseTitle,
        outcome: `Publish or present your best work on ${proof.platform} so reviewers can inspect your progress directly.`,
        stack: [proof.platform, "Documentation", "Feedback"],
      },
    ],
    githubChecklist: [
      proof.profileTask,
      `Add 3-5 strong pieces of ${proof.artifact} with short captions: goal, method, result, and what you improved.`,
      "Ask a teacher, mentor, peer, supervisor, or practitioner for one round of feedback.",
      "Add an ethics, safety, or limitations note where the work affects people, clients, patients, audiences, or communities.",
    ],
    linkedInHeadline: `${name} | Aspiring ${role} | ${profile.requiredSkills.slice(0, 3).join(" + ")}`,
    resumeBullets: [
      `Created ${proof.artifact} for ${profile.normalizedField} using ${profile.requiredSkills.slice(0, 3).join(", ")}.`,
      "Translated a study goal into a structured learning roadmap with measurable weekly actions.",
      "Documented decisions, feedback, trade-offs, and limitations for reviewers.",
    ],
    interviewTopics: [...profile.requiredSkills.slice(0, 5), "Portfolio storytelling", "Ethical trade-offs"],
  };
}

function buildRoadmap(profile: DomainProfile, answers: StudentAnswers): RoadmapStep[] {
  const hours = answers.weeklyHours || "6";
  const proof = proofStrategy(profile);

  if (!wantsFormalStudy(answers)) {
    return [
      {
        phase: "Coach Check-In",
        timeframe: "Weeks 1-2",
        focus: "Understand why formal study does not feel right and choose a respectful next path.",
        actions: [
          "Ask the AI Mentor to map your reasons: cost, confidence, timing, interest, family pressure, or uncertainty.",
          `Pick one low-pressure experiment related to ${profile.targetRoles[0]}.`,
          "Write what would make you feel ready to reconsider study later, if anything.",
        ],
      },
      {
        phase: "Proof Without Degree",
        timeframe: "Weeks 3-8",
        focus: `Build visible evidence through ${proof.artifact} without forcing a degree decision.`,
        actions: [
          proof.buildAction,
          "Get feedback from a mentor, peer, practitioner, teacher, client, or community.",
          "Save the work in a portfolio so your progress is real even without formal study.",
        ],
      },
      {
        phase: "Flexible Routes",
        timeframe: "Weeks 9-16",
        focus: "Explore apprenticeships, internships, entry projects, certificates, volunteering, or self-led practice.",
        actions: [
          `Shortlist 5 non-degree routes connected to ${profile.normalizedField}.`,
          "Compare cost, time, support, proof required, and risk for each route.",
          "Keep one study option open only if it genuinely helps your goal.",
        ],
      },
      {
        phase: "Decision Review",
        timeframe: "Weeks 17-24",
        focus: "Make a calm next decision: continue, work, study later, or ask for one-to-one guidance.",
        actions: [
          "Review your evidence, energy, budget, and support system.",
          "Ask the AI Mentor what your strongest non-study path looks like now.",
          "If your mind changes, return to Profile Intake and regenerate a formal study plan.",
        ],
      },
    ];
  }

  return [
    {
      phase: "Foundation",
      timeframe: "Weeks 1-4",
      focus: `Use ${hours} hours/week to strengthen the top prerequisites.`,
      actions: [
        `Study ${profile.requiredSkills.slice(0, 2).join(" and ")} with focused practice.`,
        `Save one weekly reflection in your ${proof.platform}.`,
        `Verify ${profile.targetRoles[0]} requirements from current programs, portfolios, job posts, or professional bodies.`,
      ],
    },
    {
      phase: "Visible Proof",
      timeframe: "Weeks 5-10",
      focus: `Build visible proof through ${proof.artifact}.`,
      actions: [
        proof.buildAction,
        "Ask a peer, mentor, professor, supervisor, or practitioner to review it.",
        "Add process notes, evidence, feedback, and limitations.",
      ],
    },
    {
      phase: "Applications and Network",
      timeframe: "Weeks 11-16",
      focus: "Connect the pathway to universities, internships, and communities.",
      actions: [
        "Shortlist 6-9 programs or roles.",
        `Join two relevant communities, societies, clinics, studios, labs, associations, or campus groups for ${profile.normalizedField}.`,
        "Prepare a role-specific resume and LinkedIn summary.",
      ],
    },
    {
      phase: "Interview Readiness",
      timeframe: "Weeks 17-24",
      focus: `Turn ${proof.artifact} into interview, audition, critique, or application stories.`,
      actions: [
        "Practice explaining your decisions, feedback, constraints, and trade-offs.",
        `Review ${profile.missingSkills.join(", ")}.`,
        `Run one mock interview, critique, audition, portfolio review, clinical reflection, or research discussion.`,
      ],
    },
  ];
}

function wantsFormalStudy(answers: StudentAnswers) {
  const text = `${answers.studyGoal} ${answers.studyLocationIntent}`.toLowerCase();
  return !/(do not|don't|dont|not planning formal study)/i.test(text);
}

function buildMentorPrompts(profile: DomainProfile, answers: StudentAnswers, skillScore: number) {
  const proof = proofStrategy(profile);
  return [
    {
      question: "What should I learn first?",
      answer: `Start with ${profile.requiredSkills.slice(0, 2).join(" and ")} because they unlock the fastest progress toward ${profile.targetRoles[0]}.`,
    },
    {
      question: "What should I do this week?",
      answer: `Spend ${answers.weeklyHours || "6"} focused hours: 60% learning, 30% practice, 10% documenting progress in ${proof.platform}.`,
    },
    {
      question: "How strong is my profile right now?",
      answer: `Your current Aimura skill score is ${skillScore}/100. The biggest gaps are ${profile.missingSkills.join(", ")}.`,
    },
    {
      question: `What proof should I build for ${profile.targetRoles[0]}?`,
      answer: `Build ${proof.artifact}: ${proof.buildAction}`,
    },
  ];
}

// Readiness score is driven by (1) how much of the target role's required skill
// set the student can already evidence and (2) how well their education aligns
// with that role. Concrete experience adds to it; interests are only an add-on.
// Mismatched study AND skills deliberately pull the score down.
// Returns the readiness score AND a transparent breakdown of how it was reached.
function computeReadiness(profile: DomainProfile, answers: StudentAnswers): { score: number; breakdown: ScoreBreakdown } {
  const roleCluster = clusterOf(profile.parentDomain);
  const role = profile.targetRoles[0] || answers.dreamRole || "this role";

  // (1) Skills linked to the target role. The curve is generous to beginners —
  // a fresh student is not expected to already have every advanced skill.
  const evidence = knownEvidenceText(answers);
  const matched = profile.requiredSkills.filter((skill) => hasKnownSkill(skill, evidence)).length;
  const coverage = matched / Math.max(1, profile.requiredSkills.length); // 0..1
  const skillPoints = Math.round(Math.min(1, coverage * 1.5) * 40); // up to 40

  // (2) Education aligned with the target role's domain.
  const studyCluster = textCluster(answers.fieldOfStudy);
  let eduPoints: number;
  let eduNote: string;
  if (!answers.fieldOfStudy.trim()) {
    eduPoints = 12;
    eduNote = "Add your field of study to sharpen this score.";
  } else if (studyCluster === roleCluster) {
    eduPoints = 26;
    eduNote = `Your studies in ${answers.fieldOfStudy} align directly with ${role}.`;
  } else if (clustersRelated(studyCluster, roleCluster)) {
    eduPoints = 15;
    eduNote = `Your studies in ${answers.fieldOfStudy} are related to ${role}.`;
  } else {
    eduPoints = 4;
    eduNote = `Your studies in ${answers.fieldOfStudy} differ from ${role}, so this is a bigger leap.`;
  }

  // (3) Concrete evidence of doing the work.
  const yes = (value: string) => value.trim().toLowerCase() === "yes";
  const evidencePoints =
    (yes(answers.hasProjects) ? 12 : 0) +
    (yes(answers.hasInternship) ? 8 : 0) +
    (yes(answers.hasGithub) ? 4 : 0) +
    (yes(answers.hasLinkedin) ? 2 : 0); // up to 26
  const evidenceItems = [
    yes(answers.hasProjects) && "projects",
    yes(answers.hasInternship) && "an internship",
    yes(answers.hasGithub) && "a portfolio",
  ].filter(Boolean) as string[];

  // (4) Interests — an add-on only, never the main driver.
  const interestCluster = textCluster(`${answers.subjects.join(" ")} ${answers.activities.join(" ")}`);
  const interestPoints = interestCluster === roleCluster ? 8 : interestCluster ? 3 : 0; // up to 8

  let total = skillPoints + eduPoints + evidencePoints + interestPoints; // up to 100

  // Penalise genuine mismatch: an unrelated field of study AND skills that don't
  // cover the target role both pull readiness down — hard when both apply.
  const studyMismatch =
    answers.fieldOfStudy.trim().length > 0 &&
    studyCluster !== null &&
    studyCluster !== roleCluster &&
    !clustersRelated(studyCluster, roleCluster);
  const skillsMismatch = answers.skills.length > 0 && coverage < 0.2;
  let penaltyFactor = 1;
  if (studyMismatch && skillsMismatch) penaltyFactor = 0.6;
  else if (studyMismatch || skillsMismatch) penaltyFactor = 0.82;
  total = Math.round(total * penaltyFactor);
  const score = Math.max(18, Math.min(98, total));

  const notes = [
    `Skills: you can evidence ${matched} of ${profile.requiredSkills.length} skills this role needs (${Math.round(coverage * 100)}%).`,
    eduNote,
    evidenceItems.length
      ? `Experience: ${evidenceItems.join(", ")} add real credit.`
      : "Experience: a project or internship would raise this fast.",
  ];
  if (penaltyFactor < 1) {
    notes.push(
      penaltyFactor === 0.6
        ? "Both your studies and current skills differ from this role, so the score is reduced to stay honest."
        : "Your studies or skills don't fully fit this role yet, so the score is slightly reduced.",
    );
  }

  return {
    score,
    breakdown: {
      skills: skillPoints,
      education: eduPoints,
      evidence: evidencePoints,
      interests: interestPoints,
      coveragePct: Math.round(coverage * 100),
      penaltyFactor,
      notes,
    },
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AimuraAI/0.4 student-success-os",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function ensureTargetRoles(baseRoles: string[], dreamRole: string): string[] {
  const cleanedDreamRole = dreamRole.trim();
  const roles = cleanedDreamRole ? [cleanedDreamRole, ...baseRoles] : baseRoles;
  return Array.from(new Set(roles.filter(Boolean))).slice(0, 4);
}

function isTechnologyDomain(parentDomain: string) {
  return /(computer|data|technology|cyber)/i.test(parentDomain);
}

// Concrete capability evidence only: listed skills, field of study, work style,
// and education level. Interests (subjects/activities) are intentionally excluded
// so the score reflects skills linked to the study and target role, not hobbies.
function knownEvidenceText(answers: StudentAnswers) {
  return [
    ...answers.skills,
    answers.fieldOfStudy,
    answers.workStyle,
    answers.educationLevel,
  ]
    .join(" ")
    .toLowerCase();
}

// Common abbreviations / synonyms so "JS" counts as JavaScript, "ML" as Machine
// Learning, etc. — otherwise literal substring matching under-credits students.
const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["js", "node", "nodejs", "react", "es6"],
  typescript: ["ts"],
  python: ["py", "pandas", "numpy"],
  "machine learning": ["ml", "sklearn", "scikit"],
  "deep learning": ["dl", "neural network", "neural networks"],
  "natural language processing": ["nlp", "llm", "llms"],
  "artificial intelligence": ["ai"],
  "data analysis": ["data analytics", "analytics", "data analyst"],
  "data structures": ["dsa", "algorithms"],
  "cloud (aws/azure)": ["aws", "azure", "gcp", "cloud", "kubernetes", "k8s"],
  "user research": ["ux research", "user testing"],
  "ui design": ["ui", "figma"],
  "visual design": ["graphic design"],
  "financial modeling": ["financial modelling", "valuation", "dcf"],
  "academic writing": ["research writing", "thesis", "dissertation"],
  "camera operation": ["dslr", "mirrorless"],
  "photo editing": ["lightroom", "photoshop", "retouching"],
  "audio production": ["mixing", "mastering", "daw", "ableton", "logic pro"],
  "patient communication": ["bedside manner", "clinical communication"],
};

function escapeRe(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Short terms (<=3 chars like "ml", "ai", "js") must match as whole words to
// avoid false positives ("ai" inside "domain"); longer terms match as substrings.
function evidenceHas(evidence: string, term: string) {
  const t = term.toLowerCase().trim();
  if (!t) return false;
  if (t.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${escapeRe(t)}([^a-z0-9]|$)`).test(evidence);
  }
  return evidence.includes(t);
}

function hasKnownSkill(skill: string, evidenceText: string) {
  const normalizedSkill = skill.toLowerCase().replace(/[()]/g, "").trim();
  if (!normalizedSkill || normalizedSkill.includes("other")) return false;
  if (evidenceText.includes(normalizedSkill)) return true;
  // Canonical key for the alias table keeps the parenthetical (e.g. "cloud (aws/azure)").
  const aliasKey = skill.toLowerCase().trim();
  for (const alias of SKILL_ALIASES[aliasKey] || SKILL_ALIASES[normalizedSkill] || []) {
    if (evidenceHas(evidenceText, alias)) return true;
  }
  const tokens = normalizedSkill.split(/[^a-z0-9+#.]+/).filter((token) => token.length > 2);
  return tokens.length > 0 && tokens.every((token) => evidenceText.includes(token));
}

function fieldSpecificResources(profile: DomainProfile, query: string): LiveResource[] {
  if (/creative|design|architecture/i.test(profile.parentDomain)) {
    return [
      {
        title: `${profile.normalizedField} portfolio inspiration`,
        provider: "Behance",
        url: `https://www.behance.net/search/projects/${query}`,
        description: "Opens portfolio examples so you can study presentation, captions, and visual standards in this field.",
        format: "Portfolio search",
        level: "Open",
      },
      {
        title: `${profile.normalizedField} practical workshops`,
        provider: "Skillshare",
        url: `https://www.skillshare.com/en/search?query=${query}`,
        description: "Opens practical workshops for creative process, client-ready work, and portfolio practice.",
        format: "Workshop search",
        level: "Open",
      },
    ];
  }

  if (/performing arts/i.test(profile.parentDomain)) {
    return [
      {
        title: `${profile.normalizedField} music training`,
        provider: "Berklee Online",
        url: `https://online.berklee.edu/courses?query=${query}`,
        description: "Opens music performance, composition, production, and industry courses.",
        format: "Course search",
        level: "Open",
      },
      {
        title: `${profile.normalizedField} listening references`,
        provider: "SoundCloud",
        url: `https://soundcloud.com/search?q=${query}`,
        description: "Opens examples and references for sound, arrangement, production, and artist positioning.",
        format: "Reference search",
        level: "Open",
      },
    ];
  }

  if (/health/i.test(profile.parentDomain)) {
    return [
      {
        title: `${profile.normalizedField} research evidence`,
        provider: "PubMed",
        url: `https://pubmed.ncbi.nlm.nih.gov/?term=${query}`,
        description: "Opens medical research references for evidence-based learning and clinical awareness.",
        format: "Research search",
        level: "Reference",
      },
      {
        title: `${profile.normalizedField} clinical foundations`,
        provider: "Khan Academy",
        url: `https://www.khanacademy.org/search?page_search_query=${query}`,
        description: "Opens accessible foundations for biology, medicine, and health-science prerequisites.",
        format: "Learning search",
        level: "Open",
      },
    ];
  }

  if (/research/i.test(profile.parentDomain)) {
    return [
      {
        title: `${profile.normalizedField} literature search`,
        provider: "Google Scholar",
        url: `https://scholar.google.com/scholar?q=${query}`,
        description: "Opens academic papers and citation trails for research topic discovery.",
        format: "Research search",
        level: "Reference",
      },
    ];
  }

  return [
    {
      title: `${profile.normalizedField} professional learning`,
      provider: "LinkedIn Learning",
      url: `https://www.linkedin.com/learning/search?keywords=${query}`,
      description: "Opens professional courses and skill paths for this career direction.",
      format: "Professional course search",
      level: "Open",
    },
    {
      title: `${profile.normalizedField} FutureLearn courses`,
      provider: "FutureLearn",
      url: `https://www.futurelearn.com/search?q=${query}`,
      description: "Opens university and industry courses across academic, creative, health, business, and social-science fields.",
      format: "Course search",
      level: "Open",
    },
  ];
}

function proofStrategy(profile: DomainProfile) {
  if (/health/i.test(profile.parentDomain)) {
    return {
      artifact: "a clinical learning log, case reflection, or research summary",
      platform: "supervised learning portfolio",
      starterTitle: "Clinical foundations evidence",
      caseStudyTitle: "Patient-scenario or public-health case reflection",
      showcaseTitle: "Supervised learning portfolio",
      profileTask: "Create a private or institution-approved learning log; do not publish patient-identifiable information.",
      buildAction: "Write one anonymised case reflection or research summary with supervisor/teacher feedback.",
    };
  }

  if (/creative|design|architecture/i.test(profile.parentDomain)) {
    return {
      artifact: "a curated visual portfolio piece",
      platform: "Behance, Adobe Portfolio, a personal site, or a PDF portfolio",
      starterTitle: "Portfolio starter piece",
      caseStudyTitle: "Client-style creative case study",
      showcaseTitle: "Public portfolio showcase",
      profileTask: "Set up a clean portfolio space such as Behance, Adobe Portfolio, a personal site, or a polished PDF.",
      buildAction: "Create one finished piece with moodboard, draft, final result, and critique notes.",
    };
  }

  if (/performing arts/i.test(profile.parentDomain)) {
    return {
      artifact: "a recording, showreel, composition, or performance log",
      platform: "SoundCloud, YouTube, a showreel, or a private audition folder",
      starterTitle: "Performance or production sample",
      caseStudyTitle: "Rehearsal-to-release case study",
      showcaseTitle: "Audition-ready showreel",
      profileTask: "Create a clean listening/showreel folder with your best recordings, notes, and credits.",
      buildAction: "Record one polished performance, composition, or production and ask for critique from a teacher or peer.",
    };
  }

  if (/research/i.test(profile.parentDomain)) {
    return {
      artifact: "a research memo, literature review, poster, or lab note",
      platform: "a research portfolio, ORCID profile, poster deck, or writing sample folder",
      starterTitle: "Research foundations memo",
      caseStudyTitle: "Literature-review case study",
      showcaseTitle: "Research writing sample",
      profileTask: "Create a research portfolio with a CV, writing sample, topic interests, and methods evidence.",
      buildAction: "Write one 2-page literature review or methods memo and ask a supervisor/teacher for feedback.",
    };
  }

  if (isTechnologyDomain(profile.parentDomain)) {
    return {
      artifact: "a working project, notebook, repository, or technical case study",
      platform: "GitHub, a deployed demo, or a technical portfolio",
      starterTitle: "Technical starter project",
      caseStudyTitle: "Real-world technical case study",
      showcaseTitle: "Deployable portfolio demo",
      profileTask: "Create or clean up GitHub and pin your two strongest repositories or notebooks.",
      buildAction: "Ship one small project with setup steps, screenshots, tests or evaluation, and a limitations section.",
    };
  }

  return {
    artifact: "a field-relevant portfolio artifact, case study, or project",
    platform: "a portfolio folder, LinkedIn profile, personal site, or application pack",
    starterTitle: "Field-specific starter artifact",
    caseStudyTitle: "Real-world problem case study",
    showcaseTitle: "Application-ready portfolio pack",
    profileTask: "Create a portfolio folder with your best work, notes, references, and feedback.",
    buildAction: "Produce one small field-relevant artifact and document the brief, process, result, and next improvement.",
  };
}
