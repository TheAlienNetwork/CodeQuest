import { storage } from "./storage";
import questsData from "./data/comprehensive-quests.json";

export async function initializeDatabase() {
  try {
    // Check if default user exists
    let user = await storage.getUserByUsername("Hero");
    
    if (!user) {
      // Create default user
      user = await storage.createUser({
        username: "Hero",
        password: "password",
        xp: 0,
        level: 1,
        rank: "Code Newbie",
        achievements: 0,
        streak: 0,
        currentQuest: 1,
        completedQuests: []
      });
      console.log("Created default user:", user.username);
    }

    // Load quests into database
    try {
      const existingQuests = await storage.getAllQuests();
      if (existingQuests.length === 0) {
        for (const questData of questsData) {
          await storage.createQuest(questData);
        }
        console.log("Loaded", questsData.length, "quests into database");
      }
    } catch (error) {
      console.warn("Could not load quests into database, using fallback:", error.message);
    }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}