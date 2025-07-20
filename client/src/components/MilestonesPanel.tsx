
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target, Crown, Award, Medal, Gift, Gem, Shield } from 'lucide-react';

interface User {
  id: number;
  xp: number;
  level: number;
  completedQuests: number[];
  achievements: number;
  streak: number;
}

interface MilestonesPanelProps {
  user: User;
  className?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  xpRequired: number;
  icon: any;
  color: string;
  badge: string;
  reward: string;
  category: 'xp' | 'quests' | 'streak' | 'special';
}

const milestones: Milestone[] = [
  // XP Milestones
  { id: 'xp_100', name: 'First Steps', description: 'Reach 100 XP', xpRequired: 100, icon: Star, color: 'bg-yellow-500', badge: 'Beginner', reward: '🎯 First Steps Badge', category: 'xp' },
  { id: 'xp_500', name: 'Code Explorer', description: 'Reach 500 XP', xpRequired: 500, icon: Target, color: 'bg-green-500', badge: 'Explorer', reward: '🗺️ Explorer Badge', category: 'xp' },
  { id: 'xp_1000', name: 'XP Hunter', description: 'Reach 1,000 XP', xpRequired: 1000, icon: Trophy, color: 'bg-blue-500', badge: 'Hunter', reward: '🏹 Hunter Badge', category: 'xp' },
  { id: 'xp_2500', name: 'Code Warrior', description: 'Reach 2,500 XP', xpRequired: 2500, icon: Shield, color: 'bg-red-500', badge: 'Warrior', reward: '⚔️ Warrior Badge', category: 'xp' },
  { id: 'xp_5000', name: 'Master Coder', description: 'Reach 5,000 XP', xpRequired: 5000, icon: Crown, color: 'bg-purple-500', badge: 'Master', reward: '👑 Master Badge', category: 'xp' },
  { id: 'xp_10000', name: 'Code Legend', description: 'Reach 10,000 XP', xpRequired: 10000, icon: Gem, color: 'bg-pink-500', badge: 'Legend', reward: '💎 Legend Badge', category: 'xp' },
  { id: 'xp_25000', name: 'Grand Master', description: 'Reach 25,000 XP', xpRequired: 25000, icon: Award, color: 'bg-gradient-to-r from-yellow-400 to-orange-500', badge: 'Grand Master', reward: '🌟 Grand Master Badge', category: 'xp' },
  
  // Quest Milestones
  { id: 'quest_5', name: 'Quest Starter', description: 'Complete 5 quests', xpRequired: 0, icon: Target, color: 'bg-cyan-500', badge: 'Starter', reward: '🎯 Quest Starter Badge', category: 'quests' },
  { id: 'quest_10', name: 'Quest Explorer', description: 'Complete 10 quests', xpRequired: 0, icon: Medal, color: 'bg-indigo-500', badge: 'Explorer', reward: '🏅 Quest Explorer Badge', category: 'quests' },
  { id: 'quest_20', name: 'Quest Champion', description: 'Complete 20 quests', xpRequired: 0, icon: Trophy, color: 'bg-orange-500', badge: 'Champion', reward: '🏆 Quest Champion Badge', category: 'quests' },
  
  // Streak Milestones
  { id: 'streak_3', name: 'Hot Streak', description: 'Maintain 3-day streak', xpRequired: 0, icon: Zap, color: 'bg-yellow-400', badge: 'Streaker', reward: '🔥 Hot Streak Badge', category: 'streak' },
  { id: 'streak_7', name: 'Weekly Warrior', description: 'Maintain 7-day streak', xpRequired: 0, icon: Star, color: 'bg-green-400', badge: 'Weekly Warrior', reward: '⭐ Weekly Badge', category: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain 30-day streak', xpRequired: 0, icon: Crown, color: 'bg-purple-600', badge: 'Monthly Master', reward: '👑 Monthly Badge', category: 'streak' },
  
  // Special Milestones
  { id: 'special_perfectionist', name: 'Perfectionist', description: 'Complete 5 quests without hints', xpRequired: 0, icon: Gem, color: 'bg-pink-400', badge: 'Perfectionist', reward: '💎 Perfect Badge', category: 'special' },
];

export default function MilestonesPanel({ user, className = "" }: MilestonesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Handle case where user data is not available
  if (!user) {
    return (
      <div className={`h-full bg-[var(--cyber-dark)] text-white overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--cyber-cyan)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading milestones...</p>
        </div>
      </div>
    );
  }

  const getMilestoneProgress = (milestone: Milestone): { isUnlocked: boolean; progress: number } => {
    switch (milestone.category) {
      case 'xp':
        const userXP = user?.xp || 0;
        return {
          isUnlocked: userXP >= milestone.xpRequired,
          progress: Math.min(100, (userXP / milestone.xpRequired) * 100)
        };
      case 'quests':
        const questCount = user?.completedQuests?.length || 0;
        const requiredQuests = parseInt(milestone.id.split('_')[1]);
        return {
          isUnlocked: questCount >= requiredQuests,
          progress: Math.min(100, (questCount / requiredQuests) * 100)
        };
      case 'streak':
        const requiredStreak = parseInt(milestone.id.split('_')[1]);
        const userStreak = user?.streak || 0;
        return {
          isUnlocked: userStreak >= requiredStreak,
          progress: Math.min(100, (userStreak / requiredStreak) * 100)
        };
      case 'special':
        // Mock special milestone progress
        const xpForSpecial = user?.xp || 0;
        return {
          isUnlocked: xpForSpecial >= 500, // Simple check for demo
          progress: xpForSpecial >= 500 ? 100 : 50
        };
      default:
        return { isUnlocked: false, progress: 0 };
    }
  };

  const filteredMilestones = selectedCategory === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === selectedCategory);

  const unlockedCount = milestones.filter(m => getMilestoneProgress(m).isUnlocked).length;
  const totalCount = milestones.length;
  const completionRate = (unlockedCount / totalCount) * 100;

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'xp', name: 'XP', icon: Star },
    { id: 'quests', name: 'Quests', icon: Target },
    { id: 'streak', name: 'Streaks', icon: Zap },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  return (
    <div className={`h-full bg-[var(--cyber-dark)] text-white overflow-hidden flex flex-col ${className}`}>
      <div className="p-3 sm:p-4 lg:p-6 flex-shrink-0">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-[var(--cyber-cyan)]">
            🏆 Milestones & Achievements
          </h2>
          <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
            Unlock special badges and rewards by reaching XP milestones
          </p>
          
          {/* Progress Overview */}
          <Card className="bg-[var(--cyber-darker)] border-[var(--cyber-blue)] mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                <span className="text-sm font-bold text-[var(--cyber-cyan)]">
                  {unlockedCount}/{totalCount} Unlocked
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="text-xs text-gray-400 mt-1">
                {completionRate.toFixed(1)}% Complete
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-[var(--cyber-cyan)] text-black'
                  : 'bg-[var(--cyber-darker)] text-gray-300 hover:bg-[var(--cyber-blue)] hover:text-white'
              }`}
            >
              <category.icon className="w-3 h-3" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Milestones List */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 pb-4 scrollbar-thin scrollbar-thumb-[var(--cyber-cyan)] scrollbar-track-[var(--cyber-darker)] hover:scrollbar-thumb-[var(--cyber-blue)]">
        <div className="space-y-3">
          {filteredMilestones.map((milestone) => {
            const { isUnlocked, progress } = getMilestoneProgress(milestone);
            const IconComponent = milestone.icon;
            
            return (
              <Card 
                key={milestone.id} 
                className={`border transition-all ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-[var(--cyber-darker)] to-[var(--cyber-blue)]/20 border-[var(--cyber-cyan)] shadow-md' 
                    : 'bg-[var(--cyber-darker)] border-gray-600'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isUnlocked ? milestone.color : 'bg-gray-600'}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${isUnlocked ? 'text-[var(--cyber-cyan)]' : 'text-gray-300'}`}>
                          {milestone.name}
                        </h3>
                        {isUnlocked && (
                          <Badge className="bg-green-500 text-white text-xs">
                            ✓ Unlocked
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        {milestone.description}
                      </p>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]">
                            {milestone.badge}
                          </Badge>
                        </div>
                        <span className="text-gray-400">
                          {milestone.reward}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
