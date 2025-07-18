import { storage } from '../storage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'speed' | 'accuracy' | 'creativity' | 'efficiency';
  requirements: any;
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  expiresAt?: Date;
  isActive: boolean;
}

export interface Leaderboard {
  userId: number;
  username: string;
  score: number;
  rank: number;
  badge?: string;
  profileImage?: string;
}

export class GamificationService {
  
  private achievements: Achievement[] = [
    {
      id: 'first_quest',
      name: 'First Steps',
      description: 'Complete your first quest',
      icon: '🎯',
      xpReward: 50,
      rarity: 'common'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete 5 quests in under 10 minutes each',
      icon: '⚡',
      xpReward: 200,
      rarity: 'rare'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete 10 quests without any hints',
      icon: '💎',
      xpReward: 300,
      rarity: 'epic'
    },
    {
      id: 'code_master',
      name: 'Code Master',
      description: 'Complete all quests in the curriculum',
      icon: '👑',
      xpReward: 1000,
      rarity: 'legendary'
    },
    {
      id: 'streak_warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 30-day coding streak',
      icon: '🔥',
      xpReward: 500,
      rarity: 'epic'
    },
    {
      id: 'mentor',
      name: 'Code Mentor',
      description: 'Help 10 other learners through the chat',
      icon: '🎓',
      xpReward: 400,
      rarity: 'rare'
    },
    {
      id: 'efficiency_expert',
      name: 'Efficiency Expert',
      description: 'Write solutions with optimal time complexity',
      icon: '⚙️',
      xpReward: 250,
      rarity: 'rare'
    }
  ];

  private dailyChallenges: Challenge[] = [
    {
      id: 'daily_speed',
      name: 'Lightning Round',
      description: 'Complete 3 quests in under 30 minutes total',
      type: 'speed',
      requirements: { questsCount: 3, timeLimit: 1800 },
      reward: { xp: 100, badge: 'Speed Racer' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: 'daily_accuracy',
      name: 'Precision Practice',
      description: 'Complete 5 quests with 100% accuracy',
      type: 'accuracy',
      requirements: { questsCount: 5, accuracyRate: 100 },
      reward: { xp: 150, badge: 'Sharpshooter' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: 'daily_creativity',
      name: 'Creative Coder',
      description: 'Solve a quest using an alternative approach',
      type: 'creativity',
      requirements: { uniqueApproach: true },
      reward: { xp: 200, badge: 'Innovator' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  // Check for new achievements
  async checkAchievements(userId: number): Promise<Achievement[]> {
    const user = await storage.getUser(userId);
    const submissions = await storage.getUserSubmissions(userId);
    
    if (!user) return [];
    
    const newAchievements: Achievement[] = [];
    const userAchievements = user.unlockedAchievements || [];
    
    for (const achievement of this.achievements) {
      if (!userAchievements.includes(achievement.id)) {
        if (await this.isAchievementUnlocked(achievement, user, submissions)) {
          newAchievements.push({
            ...achievement,
            unlockedAt: new Date()
          });
          
          // Update user achievements
          await storage.updateUser(userId, {
            unlockedAchievements: [...userAchievements, achievement.id],
            xp: user.xp + achievement.xpReward
          });
        }
      }
    }
    
    return newAchievements;
  }

  // Get daily challenges
  async getDailyChallenges(userId: number): Promise<Challenge[]> {
    const user = await storage.getUser(userId);
    if (!user) return [];
    
    // Filter active challenges
    const activeChallenges = this.dailyChallenges.filter(challenge => 
      challenge.isActive && 
      (!challenge.expiresAt || challenge.expiresAt > new Date())
    );
    
    // Check progress for each challenge
    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const progress = await this.getChallengeProgress(challenge, userId);
        return {
          ...challenge,
          progress,
          isCompleted: progress >= 100
        };
      })
    );
    
    return challengesWithProgress;
  }

  // Generate leaderboard
  async generateLeaderboard(type: 'xp' | 'streak' | 'speed' = 'xp', limit: number = 10): Promise<Leaderboard[]> {
    const users = await storage.getAllUsers();
    
    let sortedUsers: any[] = [];
    
    switch (type) {
      case 'xp':
        sortedUsers = users.sort((a, b) => b.xp - a.xp);
        break;
      case 'streak':
        sortedUsers = users.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        break;
      case 'speed':
        // Sort by average completion time (mock data)
        sortedUsers = users.sort((a, b) => {
          const aAvgTime = a.averageCompletionTime || 3600;
          const bAvgTime = b.averageCompletionTime || 3600;
          return aAvgTime - bAvgTime;
        });
        break;
    }
    
    return sortedUsers.slice(0, limit).map((user, index) => ({
      userId: user.id,
      username: user.adventurersName,
      score: type === 'xp' ? user.xp : type === 'streak' ? user.streak : user.averageCompletionTime,
      rank: index + 1,
      badge: user.currentBadge,
      profileImage: user.profileImageUrl
    }));
  }

  // Calculate XP multiplier based on various factors
  calculateXPMultiplier(user: any, questDifficulty: string, timeTaken: number, hintsUsed: number): number {
    let multiplier = 1.0;
    
    // Difficulty bonus
    const difficultyMultipliers = {
      'beginner': 1.0,
      'intermediate': 1.2,
      'advanced': 1.5,
      'expert': 2.0
    };
    multiplier *= difficultyMultipliers[questDifficulty] || 1.0;
    
    // Speed bonus
    if (timeTaken < 300) { // Under 5 minutes
      multiplier *= 1.5;
    } else if (timeTaken < 600) { // Under 10 minutes
      multiplier *= 1.2;
    }
    
    // Hints penalty
    if (hintsUsed === 0) {
      multiplier *= 1.3; // No hints bonus
    } else {
      multiplier *= Math.max(0.5, 1 - (hintsUsed * 0.1));
    }
    
    // Streak bonus
    if (user.streak > 0) {
      const streakBonus = Math.min(0.5, user.streak * 0.05);
      multiplier *= (1 + streakBonus);
    }
    
    return Math.round(multiplier * 100) / 100;
  }

  // Generate personalized rewards
  async generatePersonalizedRewards(userId: number): Promise<any[]> {
    const user = await storage.getUser(userId);
    const submissions = await storage.getUserSubmissions(userId);
    
    if (!user) return [];
    
    const rewards = [];
    
    // Milestone rewards
    if (user.xp >= 1000 && user.xp < 1100) {
      rewards.push({
        type: 'milestone',
        title: 'XP Milestone',
        description: 'Reached 1000 XP!',
        reward: 'New profile frame',
        claimed: false
      });
    }
    
    // Streak rewards
    if (user.streak >= 7) {
      rewards.push({
        type: 'streak',
        title: 'Weekly Warrior',
        description: `${user.streak} day streak!`,
        reward: 'XP Booster (24h)',
        claimed: false
      });
    }
    
    // Performance rewards
    if (submissions.length >= 10) {
      const successRate = (submissions.filter(s => s.isSuccessful).length / submissions.length) * 100;
      if (successRate >= 90) {
        rewards.push({
          type: 'performance',
          title: 'Accuracy Master',
          description: `${successRate.toFixed(1)}% success rate!`,
          reward: 'Golden cursor theme',
          claimed: false
        });
      }
    }
    
    return rewards;
  }

  // Private helper methods
  private async isAchievementUnlocked(achievement: Achievement, user: any, submissions: any[]): Promise<boolean> {
    switch (achievement.id) {
      case 'first_quest':
        return (user.completedQuests?.length || 0) >= 1;
      
      case 'speed_demon':
        // Check if user completed 5 quests in under 10 minutes each
        const fastSubmissions = submissions.filter(s => s.executionTime < 600);
        return fastSubmissions.length >= 5;
      
      case 'perfectionist':
        // Check if user completed 10 quests without hints
        const perfectSubmissions = submissions.filter(s => s.hintsUsed === 0);
        return perfectSubmissions.length >= 10;
      
      case 'code_master':
        const allQuests = await storage.getAllQuests();
        return (user.completedQuests?.length || 0) >= allQuests.length;
      
      case 'streak_warrior':
        return (user.streak || 0) >= 30;
      
      case 'mentor':
        // Mock check for helping others
        return (user.helpfulMessages || 0) >= 10;
      
      case 'efficiency_expert':
        // Check for optimal solutions
        const efficientSolutions = submissions.filter(s => s.isOptimal);
        return efficientSolutions.length >= 5;
      
      default:
        return false;
    }
  }

  private async getChallengeProgress(challenge: Challenge, userId: number): Promise<number> {
    const user = await storage.getUser(userId);
    const submissions = await storage.getUserSubmissions(userId);
    
    if (!user || !submissions.length) return 0;
    
    // Get today's submissions
    const today = new Date().toDateString();
    const todaysSubmissions = submissions.filter(s => 
      new Date(s.createdAt).toDateString() === today
    );
    
    switch (challenge.type) {
      case 'speed':
        const speedRequirement = challenge.requirements as { questsCount: number; timeLimit: number };
        const fastSubmissions = todaysSubmissions.filter(s => 
          s.executionTime < speedRequirement.timeLimit / speedRequirement.questsCount
        );
        return Math.min(100, (fastSubmissions.length / speedRequirement.questsCount) * 100);
      
      case 'accuracy':
        const accuracyRequirement = challenge.requirements as { questsCount: number; accuracyRate: number };
        const successfulSubmissions = todaysSubmissions.filter(s => s.isSuccessful);
        return Math.min(100, (successfulSubmissions.length / accuracyRequirement.questsCount) * 100);
      
      case 'creativity':
        // Mock creativity check
        const creativeSubmissions = todaysSubmissions.filter(s => s.isCreative);
        return creativeSubmissions.length > 0 ? 100 : 0;
      
      case 'efficiency':
        const efficientSubmissions = todaysSubmissions.filter(s => s.isOptimal);
        return efficientSubmissions.length > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  }
}

export const gamificationService = new GamificationService();