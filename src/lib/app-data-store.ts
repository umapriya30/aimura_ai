import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { type AimuraStudentReport, type AuthUser } from "@/lib/student-os-types";

type UserRecord = AuthUser & {
  passwordHash: string;
  createdAt: string;
  activatedAt?: string;
  activationToken?: string;
  resetToken?: string;
  resetExpiresAt?: string;
};

type StoredReport = AimuraStudentReport & {
  userId: string;
};

type AppDatabase = {
  users: Record<string, UserRecord>;
  reports: Record<string, StoredReport>;
};

const emptyDatabase: AppDatabase = {
  users: {},
  reports: {},
};

const databasePath = path.join(process.cwd(), "data", "app-database.json");

// In-memory mirror of the database. On hosts with a writable filesystem this
// stays in sync with the JSON file; on read-only/serverless hosts (e.g. a cloud
// deploy so friends can test in their browser) writes silently fall back to
// memory so the app keeps working instead of crashing.
let memoryDatabase: AppDatabase | null = null;

export async function createUser(name: string, email: string, password: string) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = Object.values(database.users).find((user) => user.email === normalizedEmail);
  if (existing) {
    return { success: false as const, message: "This account already exists. Please sign in instead." };
  }

  const id = `user_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const user: UserRecord = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    activationToken: randomToken("activate"),
  };
  database.users[id] = user;
  await writeDatabase(database);
  return {
    success: true as const,
    user: publicUser(user),
    requiresActivation: true,
    activationToken: user.activationToken,
    message: "Account created. Please activate your Aimura profile with the local link before signing in.",
  };
}

export async function authenticateUser(email: string, password: string) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(database.users).find((entry) => entry.email === normalizedEmail);
  if (!user) return { success: false as const, message: "We could not find that account." };
  if (user.passwordHash !== hashPassword(password)) {
    return { success: false as const, message: "The password is incorrect." };
  }
  if (user.activationToken && !user.activatedAt) {
    return {
      success: false as const,
      requiresActivation: true,
      message: "Please activate your Aimura profile with the local link before signing in.",
    };
  }
  return { success: true as const, user: publicUser(user), token: tokenForUser(user.id) };
}

export async function activateUser(token: string) {
  const database = await readDatabase();
  const user = Object.values(database.users).find((entry) => entry.activationToken === token);
  if (!user) return { success: false as const, message: "This activation link is invalid or already used." };

  user.activatedAt = new Date().toISOString();
  delete user.activationToken;
  await writeDatabase(database);
  return {
    success: true as const,
    user: publicUser(user),
    token: tokenForUser(user.id),
    message: "Your Aimura profile is active. You can now sign in.",
  };
}

export async function createPasswordReset(email: string) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(database.users).find((entry) => entry.email === normalizedEmail);
  if (!user) {
    return {
      success: true as const,
      message: "If an Aimura profile exists for that email, a reset link has been prepared.",
    };
  }

  user.resetToken = randomToken("reset");
  user.resetExpiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  await writeDatabase(database);
  return {
    success: true as const,
    resetToken: user.resetToken,
    message: "Password reset link prepared. It expires in 30 minutes.",
  };
}

export async function resetPassword(token: string, password: string) {
  const database = await readDatabase();
  const user = Object.values(database.users).find((entry) => entry.resetToken === token);
  if (!user || !user.resetExpiresAt || new Date(user.resetExpiresAt).getTime() < Date.now()) {
    return { success: false as const, message: "This reset link is invalid or expired." };
  }

  user.passwordHash = hashPassword(password);
  delete user.resetToken;
  delete user.resetExpiresAt;
  if (user.activationToken && !user.activatedAt) {
    user.activatedAt = new Date().toISOString();
    delete user.activationToken;
  }
  await writeDatabase(database);
  return { success: true as const, message: "Password updated. You can sign in now." };
}

export async function saveReport(userId: string, report: AimuraStudentReport) {
  const database = await readDatabase();
  if (!database.users[userId]) {
    return { success: false as const, message: "A valid user is required before saving a report." };
  }
  database.reports[report.id] = { ...report, userId };
  await writeDatabase(database);
  return { success: true as const, report: database.reports[report.id] };
}

export async function getReportsForUser(userId: string) {
  const database = await readDatabase();
  return Object.values(database.reports)
    .filter((report) => report.userId === userId)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

async function readDatabase(): Promise<AppDatabase> {
  if (memoryDatabase) return memoryDatabase;
  try {
    const raw = await readFile(databasePath, "utf8");
    const parsed = JSON.parse(raw) as AppDatabase;
    memoryDatabase = { users: parsed.users || {}, reports: parsed.reports || {} };
  } catch {
    memoryDatabase = { users: {}, reports: {} };
    await writeDatabase(memoryDatabase);
  }
  return memoryDatabase;
}

async function writeDatabase(database: AppDatabase) {
  // Memory is always authoritative for the running instance.
  memoryDatabase = database;
  try {
    await mkdir(path.dirname(databasePath), { recursive: true });
    await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  } catch {
    // Read-only filesystem (e.g. a serverless deploy): keep running in memory.
  }
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function tokenForUser(userId: string) {
  return `aimura_${Buffer.from(userId).toString("base64url")}`;
}

function randomToken(prefix: string) {
  return `${prefix}_${Date.now()}_${randomUUID().replace(/-/g, "")}`;
}

function publicUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
