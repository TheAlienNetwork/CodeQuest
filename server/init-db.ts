import { storage } from "./storage";
import questsData from "./data/comprehensive-quests.json";

export async function initializeDatabase() {
  try {
    // Check if default user exists
    let user = await storage.getUserByEmail("hero@codequest.com");

    if (!user) {
      // Create default user
      user = await storage.createUser({
        email: "hero@codequest.com",
        adventurersName: "Hero",
        password: "password",
        xp: 0,
        level: 1,
        rank: "Code Newbie",
        achievements: 0,
        streak: 0,
        currentQuest: 1,
        completedQuests: []
      });
      console.log("Created default user:", user.adventurersName);
    }

    // Load quests into database
    try {
      const existingQuests = await storage.getAllQuests();
      console.log('Existing quests count:', existingQuests.length);
      
      // Check if we have the new RPG curriculum (first quest should be "The Village Awakening")
      if (existingQuests.length > 0 && existingQuests[0].title !== "🏰 The Village Awakening") {
        console.log('🔄 Clearing existing quests to reload reorganized RPG curriculum...');
        // Clear all existing quests
        for (const quest of existingQuests) {
          await storage.deleteQuest(quest.id);
        }
        console.log('✅ Cleared all existing quests');
      } else if (existingQuests.length === 40) {
        console.log('✅ Expanded RPG curriculum already loaded correctly');
        return;
      }
      
      console.log('🎮 Loading reorganized RPG-themed curriculum...');
      console.log('Found', questsData.length, 'total quests in curriculum');

      for (const questData of questsData) {
        await storage.createQuest(questData);
        console.log(`✅ Added quest ${questData.id}: ${questData.title}`);
      }

      // Verify quests were inserted
      const insertedQuests = await storage.getAllQuests();
      console.log('Total quests in database:', insertedQuests.length);
      console.log("✅ RPG curriculum loaded with", questsData.length, "total quests");
      
      // Reset this flag after first load
      const fs = require('fs');
      const path = require('path');
      const flagPath = path.join(__dirname, 'curriculum-reloaded.flag');
      fs.writeFileSync(flagPath, 'true');
    } catch (error) {
      console.warn("Could not load quests into database, using fallback:", error.message);
      // Force reload quests in MemStorage
      if (storage instanceof Object && 'loadQuests' in storage) {
        console.log('Forcing quest reload in MemStorage');
      }
    }

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@codequest.com';
    try {
      const adminExists = await storage.getUserByEmail(adminEmail);

      if (!adminExists) {
        const adminUser = await storage.createUser({
          email: adminEmail,
          adventurersName: 'Admin',
          password: 'admin123',
          xp: 999999,
          level: 100,
          rank: 'System Administrator',
          achievements: 999,
          streak: 999,
          currentQuest: 1,
          completedQuests: []
        });
        console.log('✅ Admin user created with ID:', adminUser.id);
      } else {
        console.log('✅ Admin user already exists with ID:', adminExists.id);
        // Update admin user with proper values
        await storage.updateUser(adminExists.id, {
          xp: 999999,
          level: 100,
          rank: 'System Administrator',
          achievements: 999,
          streak: 999,
          currentQuest: 1
        });
        console.log('✅ Admin user updated with enhanced privileges');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}