import { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';

interface XPBarProps {
  user: {
    xp: number;
    level: number;
    rank: string;
    achievements: number;
    streak: number;
  };
  showXPGain?: number;
  onXPGainComplete?: () => void;
}

export default function XPBar({ user, showXPGain, onXPGainComplete }: XPBarProps) {
  const [displayXP, setDisplayXP] = useState(user.xp);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentLevelXP = (user.level - 1) * 500;
  const nextLevelXP = user.level * 500;
  const progressXP = displayXP - currentLevelXP;
  const maxProgressXP = nextLevelXP - currentLevelXP;
  const xpPercentage = Math.min(100, (progressXP / maxProgressXP) * 100);

  useEffect(() => {
    if (showXPGain && showXPGain > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayXP(user.xp);
        setIsAnimating(false);
        onXPGainComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDisplayXP(user.xp);
    }
  }, [showXPGain, user.xp, onXPGainComplete]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold cyber-text-gradient">
          <i className="fas fa-code mr-2"></i>
          CodeQuest
        </h1>
        <div className="level-badge px-4 py-2 rounded-full text-sm font-bold text-black">
          <span>{user.rank}</span>
          <span className="ml-2">Lvl {user.level}</span>
        </div>
      </div>
      
      {/* XP Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md ml-8">
        <div className="flex-1 bg-[var(--cyber-gray)] rounded-full h-4 overflow-hidden neon-border">
          <div 
            className="xp-bar-fill h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
        <div className="text-sm font-mono text-[var(--cyber-cyan)]">
          <span className={isAnimating ? 'animate-pulse' : ''}>{displayXP}</span> / {nextLevelXP} XP
        </div>
      </div>
      
      {/* User Stats */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-400">
          <Trophy className="w-4 h-4 inline mr-1 text-[var(--cyber-cyan)]" />
          {user.achievements} Achievements
        </div>
        <div className="text-sm text-gray-400">
          <Flame className="w-4 h-4 inline mr-1 text-[var(--cyber-green)]" />
          {user.streak} Day Streak
        </div>
      </div>

      {/* XP Gain Animation */}
      {showXPGain && showXPGain > 0 && (
        <div className="fixed top-20 right-8 bg-[var(--cyber-green)]/90 text-black px-4 py-2 rounded-lg font-bold z-50 animate-bounce">
          <i className="fas fa-star mr-2"></i>
          +{showXPGain} XP
        </div>
      )}
    </div>
  );
}
