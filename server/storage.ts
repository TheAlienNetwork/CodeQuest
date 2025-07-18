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
import questsData from "./data/comprehensive-quests.json";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quests: Map<number, Quest>;
  private chatMessages: Map<number, ChatMessage>;
  private codeSubmissions: Map<number, CodeSubmission>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.quests = new Map();
    this.chatMessages = new Map();
    this.codeSubmissions = new Map();
    this.currentId = 1;
    
    // Load initial quests from JSON
    this.loadQuests();
    this.createDefaultUser();
  }

  private loadQuests() {
    questsData.forEach(quest => {
      this.quests.set(quest.id, quest as Quest);
    });
  }

  private createDefaultUser() {
    // Create a default user for testing
    const defaultUser: User = {
      id: 1,
      username: "Hero",
      password: "password",
      xp: 0,
      level: 1,
      rank: "Code Newbie",
      achievements: 0,
      streak: 0,
      currentQuest: 1,
      completedQuests: [],
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentId = 2; // Next ID will be 2
  }

  private calculateLevel(xp: number): number {
    // Level progression: 500 XP per level for faster progression
    return Math.floor(xp / 500) + 1;
  }

  private calculateRank(level: number): string {
    if (level < 3) return "Code Newbie";
    if (level < 5) return "Function Fighter";
    if (level < 8) return "Class Knight";
    if (level < 12) return "Master Hacker";
    return "Legend Coder";
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      xp: 0,
      level: 1,
      rank: "Code Newbie",
      achievements: 0,
      streak: 0,
      currentQuest: 1, // Start with first quest
      completedQuests: [],
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    
    // If currentQuest is being updated, mark previous quest as completed
    if (updates.currentQuest && updates.currentQuest !== user.currentQuest) {
      const completedQuests = [...(user.completedQuests || [])];
      if (user.currentQuest && !completedQuests.includes(user.currentQuest)) {
        completedQuests.push(user.currentQuest);
      }
      updatedUser.completedQuests = completedQuests;
    }
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserXP(id: number, xpGain: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const newXP = user.xp + xpGain;
    const newLevel = this.calculateLevel(newXP);
    const newRank = this.calculateRank(newLevel);

    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel,
      rank: newRank,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Quest methods
  async getQuest(id: number): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async getQuestsByLevel(level: number): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(
      quest => quest.requiredLevel <= level
    );
  }

  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getQuestForUser(userId: number): Promise<Quest | undefined> {
    const user = await this.getUser(userId);
    if (!user || !user.currentQuest) return undefined;
    return this.getQuest(user.currentQuest);
  }

  // Chat methods
  async getChatMessages(userId: number, questId?: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      msg => msg.userId === userId && (!questId || msg.questId === questId)
    );
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      questId: message.questId || null,
      isAI: message.isAI || false,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  // Code submission methods
  async addCodeSubmission(submission: InsertCodeSubmission): Promise<CodeSubmission> {
    const id = this.currentId++;
    const codeSubmission: CodeSubmission = {
      ...submission,
      id,
      output: submission.output || null,
      feedback: submission.feedback || null,
      xpEarned: submission.xpEarned || 0,
      timestamp: new Date(),
    };
    this.codeSubmissions.set(id, codeSubmission);
    return codeSubmission;
  }

  async getUserSubmissions(userId: number): Promise<CodeSubmission[]> {
    return Array.from(this.codeSubmissions.values()).filter(
      submission => submission.userId === userId
    );
  }

  async createQuest(questData: any): Promise<Quest> {
    const quest = {
      id: this.currentId++,
      ...questData,
    };
    this.quests.set(quest.id, quest);
    return quest;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
    if (!user || !user.currentQuest) return undefined;
    
    return await this.getQuest(user.currentQuest);
  }

  async getChatMessages(userId: number, questId?: number): Promise<ChatMessage[]> {
    if (questId) {
      return await db.select().from(chatMessages)
        .where(eq(chatMessages.userId, userId) && eq(chatMessages.questId, questId));
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

  async createQuest(questData: any): Promise<Quest> {
    const [quest] = await db
      .insert(quests)
      .values(questData)
      .returning();
    return quest;
  }
}

// Use MemStorage for now since database connection issues
export const storage = new MemStorage();
