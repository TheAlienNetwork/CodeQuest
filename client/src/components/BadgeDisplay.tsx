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
  
  // Level-based badges
  if (user.level >= 2) badges.push({ icon: Star, name: "Rising Star", color: "bg-yellow-500" });
  if (user.level >= 5) badges.push({ icon: Zap, name: "Code Lightning", color: "bg-purple-500" });
  if (user.level >= 10) badges.push({ icon: Crown, name: "Python Royalty", color: "bg-gold-500" });
  
  // Quest completion badges
  const completedCount = user.completedQuests?.length || 0;
  if (completedCount >= 1) badges.push({ icon: Target, name: "First Quest", color: "bg-green-500" });
  if (completedCount >= 5) badges.push({ icon: Award, name: "Quest Master", color: "bg-blue-500" });
  if (completedCount >= 10) badges.push({ icon: Trophy, name: "Champion", color: "bg-red-500" });
  
  // Streak badges
  if (user.streak >= 3) badges.push({ icon: Zap, name: "Hot Streak", color: "bg-orange-500" });
  if (user.streak >= 7) badges.push({ icon: Target, name: "Weekly Warrior", color: "bg-indigo-500" });
  
  // XP badges
  if (user.xp >= 1000) badges.push({ icon: Star, name: "XP Hunter", color: "bg-cyan-500" });
  if (user.xp >= 5000) badges.push({ icon: Crown, name: "XP Legend", color: "bg-pink-500" });

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