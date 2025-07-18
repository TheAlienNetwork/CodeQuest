import { Application } from "express";
import { createServer } from "http";
import { z } from "zod";
import { insertUserSchema, insertQuestSchema, insertChatMessageSchema, insertCodeSubmissionSchema } from "@shared/schema";
import { IStorage } from "./storage";
import { codeExecutionService } from "./services/code-execution";
import { aiService } from "./services/ai-service";

export function registerRoutes(app: Application, storage: IStorage) {
  // Get current user
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user
  app.put("/api/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get quest for user
  app.get("/api/quest/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`Fetching quest for user ${userId}`);
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`User ${userId} not found`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`User ${userId} found: ${user.adventurersName}, currentQuest: ${user.currentQuest}`);
      
      const allQuests = await storage.getAllQuests();
      console.log(`Total quests available: ${allQuests.length}`);
      
      const quest = await storage.getQuestForUser(userId);
      console.log(`Found quest for user ${userId}:`, quest ? `${quest.id} - ${quest.title}` : 'none');
      
      if (!quest) {
        console.log('No quest found, returning 404');
        return res.status(404).json({ error: "No quest found for user" });
      }

      res.json(quest);
    } catch (error) {
      console.error("Quest fetch error:", error);
      res.status(500).json({ error: "Failed to fetch quest", details: error.message });
    }
  });

  // Get all quests for lessons panel
  app.get("/api/quests", async (req, res) => {
    try {
      const quests = await storage.getAllQuests();
      res.json(quests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  // Get specific quest by ID
  app.get("/api/quest-by-id/:questId", async (req, res) => {
    try {
      const questId = parseInt(req.params.questId);
      const quest = await storage.getQuest(questId);
      
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }

      res.json(quest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quest" });
    }
  });

  // Get all quests for user level
  app.get("/api/quests/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const quests = await storage.getQuestsByLevel(user.level);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  // Execute code
  app.post("/api/run", async (req, res) => {
    try {
      const { code, userId } = req.body;
      
      if (!code || !userId) {
        return res.status(400).json({ error: "Code and userId are required" });
      }

      const result = await codeExecutionService.executeCode(code, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  // Analyze code with AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { code, userId, questId } = req.body;
      
      if (!code || !userId) {
        return res.status(400).json({ error: "Code and userId are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const quest = questId ? await storage.getQuest(questId) : await storage.getQuestForUser(userId);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }

      // Run code execution first
      const executionResult = await codeExecutionService.executeCode(code, userId);
      
      // Get AI analysis
      const testCases = quest.testCases as Array<{input: string, expectedOutput: string}>;
      const analysis = await aiService.analyzeCode(
        code,
        quest.title,
        quest.description,
        testCases[0]?.expectedOutput || ""
      );

      // Check if code is correct based on execution results
      const isCorrect = executionResult.exitCode === 0 && 
                       testCases.some((testCase: any) => 
                         executionResult.output.trim() === testCase.expectedOutput.trim()
                       );

      // Use AI analysis for additional correctness check
      const aiCorrect = analysis.isCorrect && isCorrect;

      // Award XP based on correctness
      let xpEarned = 0;
      let updatedUser = user;
      
      if (aiCorrect) {
        xpEarned = quest.xpReward;
        updatedUser = await storage.updateUserXP(userId, xpEarned) || user;
        
        // Move to next quest if completed
        if (user.currentQuest) {
          const nextQuestId = user.currentQuest + 1;
          const nextQuest = await storage.getQuest(nextQuestId);
          if (nextQuest) {
            const completedQuests = [...(user.completedQuests || []), user.currentQuest];
            updatedUser = await storage.updateUser(userId, { 
              currentQuest: nextQuestId,
              completedQuests
            }) || updatedUser;
          }
        }
      } else if (analysis.xpEarned > 0) {
        xpEarned = analysis.xpEarned;
        updatedUser = await storage.updateUserXP(userId, xpEarned) || user;
      }

      // Save code submission
      await storage.addCodeSubmission({
        userId,
        questId: quest.id,
        code,
        isCorrect: aiCorrect,
        output: executionResult.output,
        feedback: analysis.feedback,
        xpEarned: xpEarned,
      });

      res.json({
        ...analysis,
        isCorrect: aiCorrect,
        executionResult,
        xpEarned: xpEarned,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze code" });
    }
  });

  // Chat with AI
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Save user message
      await storage.addChatMessage(validatedData);

      // Get current quest for context
      const quest = validatedData.questId ? 
        await storage.getQuest(validatedData.questId) : 
        await storage.getQuestForUser(validatedData.userId);

      // Generate AI response
      const aiResponse = await aiService.generateChatResponse(
        validatedData.message,
        user.level,
        quest
      );

      // Save AI response
      const aiMessage = await storage.addChatMessage({
        userId: validatedData.userId,
        questId: validatedData.questId,
        message: aiResponse.message,
        isAI: true,
      });

      // Update user XP for helpful interaction
      let updatedUser = user;
      if (aiResponse.isHelpful && aiResponse.xpEarned > 0) {
        updatedUser = await storage.updateUserXP(validatedData.userId, aiResponse.xpEarned) || user;
      }

      res.json({
        aiMessage,
        xpEarned: aiResponse.xpEarned,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/chat/:userId/:questId?", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const questId = req.params.questId ? parseInt(req.params.questId) : undefined;
      
      const messages = await storage.getChatMessages(userId, questId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Get hint for current quest
  app.post("/api/hint", async (req, res) => {
    try {
      const { userId, code } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const quest = await storage.getQuestForUser(userId);
      if (!quest) {
        return res.status(404).json({ error: "No active quest found" });
      }

      const hint = await aiService.generateHint(quest.title, quest.description, code || "");
      
      // Small XP reward for asking for hints
      const updatedUser = await storage.updateUserXP(userId, 10);

      res.json({
        hint,
        xpEarned: 10,
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate hint" });
    }
  });

  // Complete quest and move to next
  app.post("/api/complete-quest", async (req, res) => {
    try {
      const { userId, questId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const completedQuests = [...(user.completedQuests || []), questId];
      const allQuests = await storage.getAllQuests();
      const nextQuest = allQuests.find(q => q.id === questId + 1);

      const updatedUser = await storage.updateUser(userId, {
        completedQuests,
        currentQuest: nextQuest?.id || null,
        achievements: user.achievements + 1,
      });

      res.json({
        user: updatedUser,
        nextQuest,
        levelUp: false,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete quest" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}