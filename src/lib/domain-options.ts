// Client-safe domain inference + per-domain question options.
// The form uses this so that Career Priority, Skills, Dream Companies, and
// Work Style show choices that fit the student's actual field and target role,
// instead of a fixed list where (for example) a coder is shown "Patient impact".

export type DomainKey =
  | "tech"
  | "health"
  | "music"
  | "creative"
  | "design"
  | "research"
  | "business"
  | "law"
  | "education"
  | "engineering"
  | "architecture"
  | "general";

// Order matters: more specific / role-defining domains are tested first.
const DOMAIN_PATTERNS: Array<{ key: DomainKey; pattern: RegExp }> = [
  {
    key: "tech",
    pattern:
      /(\bai\b|artificial intelligence|machine learning|\bml\b|data scien|comput|software|informatics|information tech|developer|frontend|back[- ]?end|full[- ]?stack|programmer|coding|cyber|infosec|devops|\bcloud\b|data analy|analytics|business intelligence|\bbi\b)/i,
  },
  {
    key: "health",
    pattern:
      /(doctor|medicine|medical|mbbs|physician|surgeon|nurse|nursing|dentist|pharmac|clinical|healthcare|public health|physio|psycholog|therap|counsel|mental health)/i,
  },
  {
    key: "music",
    pattern: /(music|musician|singer|composer|producer|audio|sound|guitar|piano|vocal|songwriter|\bdj\b|band|orchestra)/i,
  },
  {
    key: "creative",
    pattern: /(photo|photograph|cinematograph|videograph|\bfilm\b|camera|visual storyteller|filmmaker)/i,
  },
  {
    key: "design",
    pattern: /(design|\bux\b|\bui\b|graphic|illustrat|animation|fashion|interior|branding|motion)/i,
  },
  {
    key: "research",
    pattern: /(phd|doctoral|research|scientist|academic|laborator|\blab\b|biotech|chemistry|physics|biology|thesis)/i,
  },
  {
    key: "law",
    pattern: /(\blaw\b|legal|policy|justice|advocate|lawyer|barrister|solicitor|attorney|paralegal)/i,
  },
  {
    key: "business",
    pattern:
      /(finance|account|investment|banking|economics|actuar|trading|wealth|marketing|entrepreneur|startup|founder|sales|brand|management|\bmba\b|consult|business)/i,
  },
  {
    key: "education",
    pattern: /(teacher|teaching|education|educator|professor|lecturer|tutor|curriculum)/i,
  },
  {
    key: "engineering",
    pattern: /(mechanical|civil|electrical|electronics|robotics|aerospace|automotive|manufactur|\bengineer)/i,
  },
  {
    key: "architecture",
    pattern: /(architect|architecture|urban|construction|built environment|landscape)/i,
  },
];

function matchKey(text: string): DomainKey | null {
  if (!text || !text.trim()) return null;
  const hit = DOMAIN_PATTERNS.find((d) => d.pattern.test(text));
  return hit ? hit.key : null;
}

// Target role is the strongest signal, then field of study, then listed skills.
// Interests/subjects are deliberately NOT used here — they are an add-on.
export function inferDomainKey(role: string, field: string, skills: string[] = []): DomainKey {
  return matchKey(role) || matchKey(field) || matchKey(skills.join(" ")) || "general";
}

const CAREER_PRIORITY_COMMON = [
  "High Salary",
  "Job Stability",
  "Work-Life Balance",
  "Immigration Opportunities",
  "Entrepreneurship",
];

const CAREER_PRIORITY_EXTRA: Record<DomainKey, string[]> = {
  tech: ["Innovation & Impact", "Remote Flexibility", "Technical Mastery"],
  health: ["Patient / Public Impact", "Clinical Specialisation", "Research Impact"],
  music: ["Creative Freedom", "Audience & Recognition", "Artistic Mastery"],
  creative: ["Creative Freedom", "Portfolio & Recognition", "Client Impact"],
  design: ["Creative Freedom", "Product Impact", "Craft Mastery"],
  research: ["Research Impact", "Academic Progression", "Funding & Grants"],
  business: ["Leadership & Management", "High Growth", "Financial Freedom"],
  law: ["Justice & Advocacy", "Public Service", "Specialisation"],
  education: ["Student Impact", "Curriculum Leadership", "Mentoring"],
  engineering: ["Innovation & Impact", "Technical Mastery", "Project Leadership"],
  architecture: ["Design Impact", "Sustainability", "Recognition"],
  general: ["Personal Growth", "Social Impact"],
};

const SKILLS: Record<DomainKey, string[]> = {
  tech: [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "SQL", "Machine Learning", "Deep Learning",
    "Data Analysis", "Statistics", "Cloud (AWS/Azure)", "APIs", "Git/GitHub", "Data Structures",
    "System Design", "Docker", "Linux", "Cybersecurity",
  ],
  health: [
    "Human Biology", "Anatomy", "Physiology", "Clinical Reasoning", "Patient Communication",
    "Medical Ethics", "Pharmacology", "Research Methods", "First Aid / BLS", "Data Recording",
    "Empathy", "Public Health",
  ],
  music: [
    "Music Theory", "Ear Training", "Composition", "Songwriting", "Audio Production",
    "Mixing & Mastering", "Instrument Proficiency", "Vocal Technique", "Performance",
    "DAW (Logic/Ableton)", "Sound Design", "Collaboration",
  ],
  creative: [
    "Photography", "Composition", "Lighting", "Camera Operation", "Photo Editing", "Videography",
    "Color Grading", "Adobe Photoshop", "Adobe Lightroom", "Premiere Pro", "Visual Storytelling",
    "Client Communication",
  ],
  design: [
    "Visual Design", "UX Research", "UI Design", "Prototyping", "Figma", "Adobe Illustrator",
    "Design Systems", "Typography", "Wireframing", "Branding", "User Testing", "Communication",
  ],
  research: [
    "Research Design", "Literature Review", "Statistics", "Academic Writing", "Data Analysis",
    "Lab Techniques", "Referencing (APA/MLA)", "Critical Thinking", "Python / R", "Presentation",
    "Ethics", "Experiment Design",
  ],
  business: [
    "Excel", "Financial Modeling", "Accounting", "SQL", "Power BI", "Market Research", "Marketing",
    "Sales", "Communication", "Project Management", "Strategy", "Negotiation",
  ],
  law: [
    "Legal Research", "Legal Writing", "Case Analysis", "Critical Thinking", "Public Speaking",
    "Negotiation", "Policy Analysis", "Contract Drafting", "Advocacy", "Attention to Detail",
  ],
  education: [
    "Lesson Planning", "Classroom Management", "Subject Mastery", "Assessment Design", "Communication",
    "Mentoring", "Curriculum Design", "Inclusive Teaching", "Public Speaking", "Patience",
  ],
  engineering: [
    "Mathematics", "Physics", "CAD", "SolidWorks", "MATLAB", "AutoCAD", "Systems Thinking",
    "Testing & QA", "Project Management", "Technical Documentation", "Problem Solving", "Programming",
  ],
  architecture: [
    "AutoCAD", "Revit", "SketchUp", "Technical Drawing", "Model Making", "Design Thinking",
    "3D Visualisation", "Building Systems", "Sustainability", "Site Analysis", "Adobe Suite",
    "Communication",
  ],
  general: [
    "Communication", "Problem Solving", "Research", "Teamwork", "Time Management", "Leadership",
    "Writing", "Critical Thinking", "Public Speaking", "Adaptability", "Data Analysis",
    "Project Planning",
  ],
};

const DREAM_COMPANIES: Record<DomainKey, string[]> = {
  tech: ["Google", "Microsoft", "Amazon", "Apple", "Meta", "Nvidia", "OpenAI", "Netflix", "Local Tech Startup"],
  health: ["Hospital / NHS", "Private Clinic", "Research Lab", "Pharma (Pfizer/GSK)", "WHO / Health NGO", "University Hospital"],
  music: ["Record Label", "Music Studio", "Streaming (Spotify)", "Production House", "Live Events Company", "Film / Media Studio"],
  creative: ["Studio / Agency", "Magazine / Editorial", "Museum / Gallery", "Media House", "Brand / Advertising", "Freelance / Own Studio"],
  design: ["Design Studio", "Tech Company", "Advertising Agency", "Product Company", "Freelance / Own Studio"],
  research: ["University", "Research Lab", "R&D Institute", "Government Lab", "Think Tank", "Industry R&D"],
  business: ["Consulting (McKinsey/BCG)", "Bank / Finance", "Big Four (Deloitte/PwC)", "FMCG / Retail", "Marketing Agency", "Startup"],
  law: ["Law Firm", "Corporate Legal Team", "Government / Judiciary", "NGO / Human Rights", "Legal-Tech Company"],
  education: ["School", "University", "EdTech Company", "Coaching / Tutoring", "Government Education Body"],
  engineering: ["Engineering Firm", "Manufacturing Company", "Automotive (Tesla/JLR)", "Aerospace", "Construction / Infrastructure", "R&D Lab"],
  architecture: ["Architecture Firm", "Urban Planning Studio", "Construction Company", "Real Estate Developer", "Government Planning"],
  general: ["Local Company", "Government", "NGO / Non-profit", "University", "Startup / Own Business"],
};

const WORK_STYLE: Record<DomainKey, string[]> = {
  tech: ["Technical Problem Solving", "Product Building", "Research", "Team Collaboration", "Independent Work"],
  health: ["Clinical / Patient-facing Work", "Research", "Teaching / Mentoring", "Lab / Diagnostic Work", "Community / Public Health"],
  music: ["Creative Work", "Performance / Public Presentation", "Collaboration", "Studio / Production Work", "Teaching / Mentoring"],
  creative: ["Creative Work", "Client Service", "Independent Studio Work", "Collaboration", "Performance / Presentation"],
  design: ["Creative Work", "Product Building", "Client Service", "Collaboration", "User Research"],
  research: ["Research", "Lab Work", "Academic Writing", "Teaching / Mentoring", "Independent Analysis"],
  business: ["Leadership / Management", "Client Service", "Analytical Work", "Sales / Persuasion", "Strategy / Planning"],
  law: ["Case Analysis", "Advocacy / Argumentation", "Research & Writing", "Client Service", "Negotiation"],
  education: ["Teaching / Mentoring", "Curriculum Design", "Research", "Leadership / Management", "Community Engagement"],
  engineering: ["Technical Problem Solving", "Design & Build", "Project Management", "Testing / Analysis", "Fieldwork"],
  architecture: ["Creative Work", "Technical Drawing & Design", "Client Service", "Project Management", "Site / Fieldwork"],
  general: ["Problem Solving", "Creative Work", "Research", "Leadership / Management", "Client Service"],
};

function withOther(list: string[]): string[] {
  return [...list, "Other"];
}

export type DomainOptionSet = {
  careerPriority: string[];
  skills: string[];
  dreamCompanies: string[];
  workStyle: string[];
};

export function domainOptions(key: DomainKey): DomainOptionSet {
  return {
    careerPriority: withOther([...CAREER_PRIORITY_EXTRA[key], ...CAREER_PRIORITY_COMMON]),
    skills: withOther(SKILLS[key]),
    dreamCompanies: withOther(DREAM_COMPANIES[key]),
    workStyle: withOther(WORK_STYLE[key]),
  };
}
