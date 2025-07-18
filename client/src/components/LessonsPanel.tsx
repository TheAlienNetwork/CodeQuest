import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Trophy, Star, Clock, Zap } from 'lucide-react';

interface Quest {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  estimatedTime: string;
  concepts: string[];
  requiredLevel: number;
}

interface User {
  id: number;
  level: number;
  xp: number;
  completedQuests: number[];
  currentQuest: number;
}

interface LessonsPanelProps {
  userId: number;
  onSelectQuest: (questId: number) => void;
}

export default function LessonsPanel({ userId, onSelectQuest }: LessonsPanelProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({ queryKey: [`/api/user/${userId}`] });
  const { data: allQuests, isLoading: questsLoading, error: questsError } = useQuery<Quest[]>({ queryKey: ['/api/quests'] });

  // Show error state if there are errors
  if (userError || questsError) {
    return (
      <div className="h-full bg-[var(--cyber-dark)] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">⚠️ Error loading curriculum</div>
          <div className="text-gray-400">Please refresh the page</div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (userLoading || questsLoading) {
    return (
      <div className="h-full bg-[var(--cyber-dark)] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">📚 Loading curriculum...</div>
          <div className="text-gray-400">Preparing your coding adventure</div>
        </div>
      </div>
    );
  }

  // Show no data message if no data exists
  if (!allQuests || allQuests.length === 0) {
    return (
      <div className="h-full bg-[var(--cyber-dark)] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">📚 No quests available</div>
          <div className="text-gray-400">Please check your connection and try again</div>
        </div>
      </div>
    );
  }

  // Use fallback user data if not available
  const currentUser = user || { id: userId, level: 1, xp: 0, completedQuests: [], currentQuest: 1 };

  const filteredQuests = allQuests.filter(quest => 
    selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQuestStatus = (questId: number) => {
    if (currentUser.completedQuests?.includes(questId)) {
      return 'completed';
    } else if (questId === currentUser.currentQuest) {
      return 'current';
    } else if (questId <= currentUser.currentQuest) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current': return <Zap className="w-5 h-5 text-cyan-500" />;
      case 'available': return <Circle className="w-5 h-5 text-gray-400" />;
      case 'locked': return <Circle className="w-5 h-5 text-gray-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const completedCount = currentUser.completedQuests?.length || 0;
  const totalQuests = allQuests.length;
  const progressPercentage = (completedCount / totalQuests) * 100;

  return (
    <div className="h-full bg-[var(--cyber-dark)] text-white p-6 overflow-auto lessons-scrollbar">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-[var(--cyber-cyan)]">
          🎓 Learning Curriculum
        </h2>
        <p className="text-gray-300 mb-4">
          Track your progress through the complete Python learning journey
        </p>
        
        {/* Overall Progress */}
        <div className="bg-[var(--cyber-gray)] p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-[var(--cyber-cyan)]">
              {completedCount}/{totalQuests} Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>Level {currentUser.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{currentUser.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-4">
          {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((diff) => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(diff)}
              className={`capitalize ${
                selectedDifficulty === diff 
                  ? 'bg-[var(--cyber-cyan)] text-black' 
                  : 'border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]'
              }`}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {filteredQuests.map((quest) => {
          const status = getQuestStatus(quest.id);
          const isAccessible = status === 'completed' || status === 'current' || status === 'available';

          return (
            <Card 
              key={quest.id}
              className={`border-[var(--cyber-cyan)]/30 bg-[var(--cyber-gray)] transition-all duration-200 
                ${isAccessible ? 'hover:border-[var(--cyber-cyan)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                ${status === 'current' ? 'border-[var(--cyber-cyan)] shadow-lg shadow-[var(--cyber-cyan)]/20' : ''}
              `}
              onClick={() => isAccessible && onSelectQuest(quest.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {quest.title}
                        {status === 'completed' && <Badge variant="secondary" className="bg-green-500 text-white">Complete</Badge>}
                        {status === 'current' && <Badge variant="secondary" className="bg-cyan-500 text-white">Current</Badge>}
                      </CardTitle>
                      <p className="text-sm text-gray-300 mt-1">{quest.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getDifficultyColor(quest.difficulty)} text-white border-0`}
                    >
                      {quest.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{quest.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {quest.concepts.slice(0, 3).map((concept) => (
                      <Badge 
                        key={concept} 
                        variant="outline" 
                        className="text-xs text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]/50"
                      >
                        {concept}
                      </Badge>
                    ))}
                    {quest.concepts.length > 3 && (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        +{quest.concepts.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--cyber-cyan)]">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">{quest.xpReward} XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Section */}
      <div className="mt-8 p-4 bg-[var(--cyber-gray)] rounded-lg">
        <h3 className="text-lg font-semibold text-[var(--cyber-cyan)] mb-2">
          🏆 Achievements
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>First Steps: {completedCount > 0 ? 'Complete' : 'Incomplete'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Python Basics: {completedCount >= 5 ? 'Complete' : `${completedCount}/5`}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Data Master: {completedCount >= 10 ? 'Complete' : `${completedCount}/10`}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Code Ninja: {completedCount >= 15 ? 'Complete' : `${completedCount}/15`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}