import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { number } from "zod";
export const userRoleEnum = pgEnum("user_role", ["USER", "RECRUITER", "ADMIN"]);
export const challengeDifficultyEnum = pgEnum("challenge_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);

export const challengeTypeEnum = pgEnum("challenge_type", [
  "FRONTEND",
  "BACKEND",
  "DSA",
  "SYSTEM_DESIGN",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "PENDING",
  "AC",
  "WA",
  "TLE",
  "RE",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "SCHEDULED",
  "LIVE",
  "ENDED",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  role: userRoleEnum("role").default("USER").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recruiterProfiles = pgTable("recruiter_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 100 }),
  companyWebsite: varchar("company_website", { length: 255 }),
});

export const challenges = pgTable("challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  challengeType: challengeTypeEnum("challenge_type").notNull(),
  difficulty: challengeDifficultyEnum("difficulty").notNull(), // easy / medium / hard
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  isDraft: boolean("is_draft").default(true).notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const problems = pgTable("problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  statement: text("statement").notNull(),
  problemType: challengeTypeEnum("problem_type").notNull(),
  difficulty: challengeDifficultyEnum("difficulty").notNull(),
  timeLimitMs: integer("time_limit_ms"),
  memoryLimitMb: integer("memory_limit_mb"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeProblems = pgTable("challenge_problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  score: integer("score").default(0),
});

export const frontendChallenges = pgTable("challenge_frontend", {
  challengeId: uuid("challenge_id")
    .primaryKey()
    .references(() => challenges.id, { onDelete: "cascade" }),

  taskDescription: text("task_description").notNull(),
  features: text("features"),
  optionalRequirements: text("optional_requirements"),
  apiDetails: text("api_details"),
  designImages: jsonb("design_images").$type<string[]>(),
  submissionInstructions: text("submission_instructions").notNull(),
  techConstraints: text("tech_constraints"),
  starterCode: text("starter_code"),
  solutionTemplate: text("solution_template"),
  allowedLanguages: jsonb("allowed_languages").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isSample: boolean("is_sample").default(false),
  isHidden: boolean("is_hidden").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeSessions = pgTable("challenge_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: sessionStatusEnum("status").default("SCHEDULED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // ADD THIS LINE
});

export const sessionParticipants = pgTable(
  "session_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => challengeSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqSessionUser: uniqueIndex("uniq_session_user").on(
      table.sessionId,
      table.userId,
    ),
  }),
);

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => challengeSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), 
  problemId: uuid("problem_id")
    .references(() => problems.id, { onDelete: "cascade" }),  
  challengeId: uuid("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" }),  
  language: varchar("language", { length: 30 }).notNull(),
  code: text("code").notNull(),
  status: submissionStatusEnum("status").default("PENDING").notNull(),
  autoSubmitted: boolean("auto_submitted").default(false),  
  runTimeMs: integer("runtime_ms"),
  memoryMb: integer("memory_mb"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  allScore: integer("ai_score"),
  allSummary: text("ai_summary"),
  aiBreakDown: jsonb("ai_breakdown").$type<{
    requirements: number;
    codequality: number;
    features: number;
    optionalFeatures: number;
  }>(),
  aiStrengths: jsonb("ai_strengths").$type<string[]>(),
  aiImprovements: jsonb("ai_improvements").$type<string[]>(),
  featuresCompleted: jsonb("features_completed").$type<string[]>(),
  featuresMissing: jsonb("features_missing").$type<string[]>(),
  evaluatedAt: timestamp("evaluated_at"),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboards = pgTable("leaderboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => challengeSessions.id, { onDelete: "cascade" }),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").notNull(),
  rank: integer("rank").notNull(),
});
