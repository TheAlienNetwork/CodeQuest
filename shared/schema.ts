import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  rank: text("rank").notNull().default("Code Newbie"),
  achievements: integer("achievements").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  currentQuest: integer("current_quest").default(1),
  completedQuests: integer("completed_quests").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
  xpReward: integer("xp_reward").notNull(),
  estimatedTime: text("estimated_time").notNull(),
  startingCode: text("starting_code"),
  solutionCode: text("solution_code"),
  testCases: jsonb("test_cases").notNull(),
  concepts: text("concepts").array().notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id"),
  message: text("message").notNull(),
  isAI: boolean("is_ai").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const codeSubmissions = pgTable("code_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  code: text("code").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  output: text("output"),
  feedback: text("feedback"),
  xpEarned: integer("xp_earned").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertCodeSubmissionSchema = createInsertSchema(codeSubmissions).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Quest = typeof quests.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type CodeSubmission = typeof codeSubmissions.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertCodeSubmission = z.infer<typeof insertCodeSubmissionSchema>;
