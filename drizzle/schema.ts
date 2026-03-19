import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Quiz submission tracking table
export const quizSubmissions = mysqlTable("quiz_submissions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 100 }).notNull(),
  quizId: varchar("quizId", { length: 100 }).notNull(),
  answers: text("answers").notNull(), // JSON string of answers
  score: int("score"),
  percentage: int("percentage"),
  totalQuestions: int("totalQuestions").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizSubmission = typeof quizSubmissions.$inferSelect;
export type InsertQuizSubmission = typeof quizSubmissions.$inferInsert;

// Activity tracking table for monitoring suspicious behavior
export const quizActivity = mysqlTable("quiz_activity", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  studentId: varchar("studentId", { length: 100 }).notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(), // 'tab_switch', 'window_blur', 'print_screen', etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: text("details"), // Additional details about the activity
});

export type QuizActivity = typeof quizActivity.$inferSelect;
export type InsertQuizActivity = typeof quizActivity.$inferInsert;