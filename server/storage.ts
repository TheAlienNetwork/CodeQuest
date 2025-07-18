import { 
  users, 
  quests, 
  chatMessages, 
  codeSubmissions,
  type User, 
  type Quest,
  type ChatMessage,
  type CodeSubmission,
  type InsertUser,
  type InsertQuest,
  type InsertChatMessage,
  type InsertCodeSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserXP(id: number, xpGain: number): Promise<User | undefined>;

  // Quest methods
  getQuest(id: number): Promise<Quest | undefined>;
  getQuestsByLevel(level: number): Promise<Quest[]>;
  getAllQuests(): Promise<Quest[]>;
  getQuestForUser(userId: number): Promise<Quest | undefined>;
  createQuest(quest: any): Promise<Quest>;

  // Chat methods
  getChatMessages(userId: number, questId?: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Code submission methods
  addCodeSubmission(submission: InsertCodeSubmission): Promise<CodeSubmission>;
  getUserSubmissions(userId: number): Promise<CodeSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with database connection from db.ts
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        adventurersName: userData.adventurersName,
        password: userData.password,
        xp: userData.xp || 0,
        level: userData.level || 1,
        rank: userData.rank || "Code Newbie",
        achievements: userData.achievements || 0,
        streak: userData.streak || 0,
        currentQuest: userData.currentQuest || 1,
        completedQuests: userData.completedQuests || [],
        profileImageUrl: userData.profileImageUrl || null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserXP(id: number, xpGain: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const newXP = user.xp + xpGain;
    const newLevel = Math.floor(newXP / 500) + 1;

    // Update completed quests if user completed current quest
    let completedQuests = user.completedQuests || [];
    const currentQuest = user.currentQuest;

    const ranks = [
      "Code Newbie", "Script Kiddie", "Bug Hunter", "Code Warrior", 
      "Function Master", "Class Hero", "Algorithm Sage", "Data Wizard", 
      "System Architect", "Code Grandmaster"
    ];

    const newRank = ranks[Math.min(newLevel - 1, ranks.length - 1)];

    return await this.updateUser(id, {
      xp: newXP,
      level: newLevel,
      rank: newRank,
      completedQuests
    });
  }

  // Quest methods
  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async getQuestsByLevel(level: number): Promise<Quest[]> {
    return await db.select().from(quests).where(eq(quests.requiredLevel, level));
  }

  async getAllQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }

  async getQuestForUser(userId: number): Promise<Quest | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // If user doesn't have a current quest, assign the first quest
    if (!user.currentQuest) {
      const [firstQuest] = await db.select().from(quests).orderBy(quests.id).limit(1);
      if (firstQuest) {
        await this.updateUser(userId, { currentQuest: firstQuest.id });
        return firstQuest;
      }
      return undefined;
    }

    const [quest] = await db.select().from(quests).where(eq(quests.id, user.currentQuest));
    return quest || undefined;
  }

  async createQuest(questData: any): Promise<Quest> {
    const [quest] = await db
      .insert(quests)
      .values(questData)
      .returning();
    return quest;
  }

  // Chat methods
  async getChatMessages(userId: number, questId?: number): Promise<ChatMessage[]> {
    if (questId) {
      return await db.select().from(chatMessages)
        .where(and(eq(chatMessages.userId, userId), eq(chatMessages.questId, questId)));
    } else {
      return await db.select().from(chatMessages)
        .where(eq(chatMessages.userId, userId));
    }
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  // Code submission methods
  async addCodeSubmission(submission: InsertCodeSubmission): Promise<CodeSubmission> {
    const [codeSubmission] = await db
      .insert(codeSubmissions)
      .values(submission)
      .returning();
    return codeSubmission;
  }

  async getUserSubmissions(userId: number): Promise<CodeSubmission[]> {
    return await db.select().from(codeSubmissions).where(eq(codeSubmissions.userId, userId));
  }
}

// Use DatabaseStorage now that PostgreSQL is properly configured
export const storage = new DatabaseStorage();