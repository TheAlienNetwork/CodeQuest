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
      
      if (existingQuests.length === 0) {
        console.log('Loading quest data...');
        console.log('Found', questsData.length, 'quests to insert');

        for (const questData of questsData) {
          await storage.createQuest(questData);
        }

        // Verify quests were inserted
        const insertedQuests = await storage.getAllQuests();
        console.log('Total quests in database:', insertedQuests.length);
        console.log("Loaded", questsData.length, "quests into database");
      } else {
        console.log('Quests already loaded, skipping initialization');
      }
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
      const adminExists = await storage.getUser(adminEmail);

      if (!adminExists) {
        await storage.createUser({
          email: adminEmail,
          adventurersName: 'Admin',
          password: 'admin123'
        });
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      // Admin doesn't exist, create it
      await storage.createUser({
        email: adminEmail,
        adventurersName: 'Admin',
        password: 'admin123'
      });
      console.log('✅ Admin user created');
    }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}