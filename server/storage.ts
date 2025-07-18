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
    console.log('Loading quests into MemStorage...');
    questsData.forEach(quest => {
      this.quests.set(quest.id, quest as Quest);
    });
    console.log(`Loaded ${questsData.length} quests into MemStorage`);
  }

  private createDefaultUser() {
    // Create a default user for testing
    const defaultUser: User = {
      id: 1,
      email: "hero@codequest.com",
      adventurersName: "Hero",
      password: "password",
      profileImageUrl: null,
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: any): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      email: userData.email,
      adventurersName: userData.adventurersName,
      username: userData.username || userData.adventurersName,
      password: userData.password,
      xp: userData.xp || 0,
      level: userData.level || 1,
      rank: userData.rank || "Code Newbie",
      achievements: userData.achievements || 0,
      streak: userData.streak || 0,
      currentQuest: userData.currentQuest || 1,
      completedQuests: userData.completedQuests || [],
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    console.log(`getQuestForUser called for userId: ${userId}`);
    console.log(`Total quests in memory: ${this.quests.size}`);

    const user = await this.getUser(userId);
    if (!user) {
      console.log(`User ${userId} not found`);
      return undefined;
    }

    console.log(`User ${userId} details:`, { currentQuest: user.currentQuest, level: user.level });

    // If user doesn't have a current quest, assign the first quest
    if (!user.currentQuest) {
      console.log(`User ${userId} has no current quest, assigning first quest`);
      const firstQuest = Array.from(this.quests.values())[0];
      if (firstQuest) {
        await this.updateUser(userId, { currentQuest: firstQuest.id });
        console.log(`Assigned quest ${firstQuest.id} to user ${userId}`);
        return firstQuest;
      }
      console.log('No quests available in memory');
      return undefined;
    }

    const quest = this.quests.get(user.currentQuest);
    console.log(`Retrieved quest ${user.currentQuest} for user ${userId}:`, quest ? `found: ${quest.title}` : 'not found');

    if (!quest) {
      console.log(`Quest ${user.currentQuest} not found, available quest IDs:`, Array.from(this.quests.keys()));
    }

    return quest;
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
    // Use the quest's existing ID if it has one, otherwise assign a new one
    const questId = questData.id || this.currentId++;
    const quest = {
      ...questData,
      id: questId,
    };
    this.quests.set(questId, quest);
    console.log(`Created quest ${questId}: ${quest.title}`);
    return quest;
  }

  async initializeQuests() {
    console.log('Loading quests into MemStorage...');
    // Clear existing quests to ensure fresh data
    this.quests = new Map();

    for (const questData of questsData) {
      await this.createQuest(questData);
    }
    console.log(`Loaded ${questsData.length} quests into MemStorage`);

    const existingQuests = await this.getAllQuests();
    console.log(`Existing quests count: ${existingQuests.length}`);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
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

  async getChatMessages(userId: number, questId?: number): Promise<ChatMessage[]> {
    if (questId) {
      return await db.select().from(chatMessages)
        .where(eq(chatMessages.userId, userId) && eq(chatMessages.questId, questId));
    } else {
      return await db.select().from(chatMessages)
        .where(eq(chatMessages.userId, userId));
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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

// Use DatabaseStorage now that PostgreSQL is properly configured
export const storage = new DatabaseStorage();