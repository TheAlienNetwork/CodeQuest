import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Crown, Award } from 'lucide-react';

interface BadgeDisplayProps {
  user: {
    level: number;
    xp: number;
    completedQuests: number[];
    achievements: number;
    streak: number;
  };
  className?: string;
}

export default function BadgeDisplay({ user, className = "" }: BadgeDisplayProps) {
  const badges = [];
  
  // Level-based badges (keep existing system)
  if (user.level >= 2) badges.push({ icon: Star, name: "Rising Star", color: "bg-yellow-500" });
  if (user.level >= 5) badges.push({ icon: Zap, name: "Code Lightning", color: "bg-purple-500" });
  if (user.level >= 10) badges.push({ icon: Crown, name: "Python Royalty", color: "bg-gold-500" });
  
  // XP Milestone badges (new reward system)
  if (user.xp >= 100) badges.push({ icon: Star, name: "First Steps", color: "bg-yellow-400" });
  if (user.xp >= 500) badges.push({ icon: Target, name: "Code Explorer", color: "bg-green-400" });
  if (user.xp >= 1000) badges.push({ icon: Trophy, name: "XP Hunter", color: "bg-blue-400" });
  if (user.xp >= 2500) badges.push({ icon: Award, name: "Code Warrior", color: "bg-red-400" });
  if (user.xp >= 5000) badges.push({ icon: Crown, name: "Master Coder", color: "bg-purple-400" });
  if (user.xp >= 10000) badges.push({ icon: Star, name: "Code Legend", color: "bg-pink-400" });
  if (user.xp >= 25000) badges.push({ icon: Crown, name: "Grand Master", color: "bg-gradient-to-r from-yellow-400 to-orange-500" });
  
  // Quest completion milestone badges
  const completedCount = user.completedQuests?.length || 0;
  if (completedCount >= 1) badges.push({ icon: Target, name: "First Quest", color: "bg-green-500" });
  if (completedCount >= 5) badges.push({ icon: Target, name: "Quest Starter", color: "bg-cyan-500" });
  if (completedCount >= 10) badges.push({ icon: Award, name: "Quest Explorer", color: "bg-indigo-500" });
  if (completedCount >= 20) badges.push({ icon: Trophy, name: "Quest Champion", color: "bg-orange-500" });
  
  // Streak milestone badges
  if (user.streak >= 3) badges.push({ icon: Zap, name: "Hot Streak", color: "bg-yellow-600" });
  if (user.streak >= 7) badges.push({ icon: Star, name: "Weekly Warrior", color: "bg-green-600" });
  if (user.streak >= 30) badges.push({ icon: Crown, name: "Monthly Master", color: "bg-purple-600" });

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={`${badge.color} text-white flex items-center gap-1 px-2 py-1`}
        >
          <badge.icon className="w-3 h-3" />
          <span className="text-xs">{badge.name}</span>
        </Badge>
      ))}
      {badges.length === 0 && (
        <Badge variant="outline" className="text-gray-400 border-gray-600">
          <Star className="w-3 h-3 mr-1" />
          <span className="text-xs">Complete your first quest to earn badges!</span>
        </Badge>
      )}
    </div>
  );
}