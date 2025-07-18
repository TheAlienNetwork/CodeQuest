import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Brain, Clock, Star, TrendingUp, Award, Code, BarChart3 } from 'lucide-react';

interface AdvancedDashboardProps {
  userId: number;
}

interface LearningAnalytics {
  conceptMastery: { [concept: string]: number };
  learningVelocity: number;
  strengthAreas: string[];
  improvementAreas: string[];
  predictedNextConcepts: string[];
  studyRecommendations: string[];
}

interface PerformanceMetrics {
  avgSubmissionTime: number;
  successRate: number;
  hintsUsed: number;
  streakData: { date: string; completed: boolean }[];
  timeSpentCoding: number;
  focusScore: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'speed' | 'accuracy' | 'creativity' | 'efficiency';
  progress: number;
  isCompleted: boolean;
  reward: {
    xp: number;
    badge?: string;
  };
}

interface Leaderboard {
  userId: number;
  username: string;
  score: number;
  rank: number;
  badge?: string;
}

export default function AdvancedDashboard({ userId }: AdvancedDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('analytics');

  const { data: learningAnalytics, isLoading: analyticsLoading } = useQuery<LearningAnalytics>({
    queryKey: [`/api/analytics/learning/${userId}`],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: performanceMetrics, isLoading: performanceLoading } = useQuery<PerformanceMetrics>({
    queryKey: [`/api/analytics/performance/${userId}`],
    refetchInterval: 30000,
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: [`/api/achievements/${userId}`],
    refetchInterval: 10000, // Check achievements more frequently
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: [`/api/challenges/${userId}`],
    refetchInterval: 10000,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<Leaderboard[]>({
    queryKey: ['/api/leaderboard/xp?limit=10'],
    refetchInterval: 60000, // Update every minute
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<any[]>({
    queryKey: [`/api/recommendations/${userId}`],
    refetchInterval: 60000,
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (analyticsLoading || performanceLoading) {
    return (
      <div className="h-full bg-[var(--cyber-dark)] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">🔬 Analyzing your progress...</div>
          <div className="text-gray-400">Generating insights</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--cyber-dark)] text-white p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Advanced Dashboard
          </h1>
          <Badge variant="outline" className="bg-[var(--cyber-primary)] text-black">
            Real-time Analytics
          </Badge>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[var(--cyber-surface)] text-white">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Learning Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5" />
                    Learning Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {learningAnalytics?.learningVelocity?.toFixed(2) || 0}
                  </div>
                  <p className="text-sm text-gray-400">quests per day</p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5" />
                    Concepts Mastered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {Object.keys(learningAnalytics?.conceptMastery || {}).length}
                  </div>
                  <p className="text-sm text-gray-400">programming concepts</p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    Focus Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {performanceMetrics?.focusScore || 0}%
                  </div>
                  <p className="text-sm text-gray-400">coding consistency</p>
                </CardContent>
              </Card>
            </div>

            {/* Concept Mastery */}
            <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
              <CardHeader>
                <CardTitle className="text-white">Concept Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(learningAnalytics?.conceptMastery || {}).map(([concept, count]) => (
                    <div key={concept} className="flex items-center justify-between">
                      <span className="text-white capitalize">{concept}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, count * 20)} className="w-24" />
                        <span className="text-sm text-gray-400">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Recommendations */}
            <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
              <CardHeader>
                <CardTitle className="text-white">AI Study Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningAnalytics?.studyRecommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--cyber-dark)]">
                      <Zap className="w-5 h-5 text-[var(--cyber-primary)] mt-1" />
                      <p className="text-white">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {performanceMetrics?.successRate?.toFixed(1) || 0}%
                  </div>
                  <Progress value={performanceMetrics?.successRate || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    Avg. Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {formatTime(performanceMetrics?.avgSubmissionTime || 0)}
                  </div>
                  <p className="text-sm text-gray-400">per submission</p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5" />
                    Hints Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {performanceMetrics?.hintsUsed || 0}
                  </div>
                  <p className="text-sm text-gray-400">total hints</p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Code className="w-5 h-5" />
                    Time Coding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--cyber-primary)]">
                    {formatTime(performanceMetrics?.timeSpentCoding || 0)}
                  </div>
                  <p className="text-sm text-gray-400">total time</p>
                </CardContent>
              </Card>
            </div>

            {/* Streak Visualization */}
            <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
              <CardHeader>
                <CardTitle className="text-white">Coding Streak (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1">
                  {performanceMetrics?.streakData?.map((day, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-sm ${
                        day.completed ? 'bg-[var(--cyber-primary)]' : 'bg-gray-700'
                      }`}
                      title={`${day.date}: ${day.completed ? 'Completed' : 'No activity'}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {/* Recent Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements?.map((achievement) => (
                <Card key={achievement.id} className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{achievement.icon}</span>
                      {achievement.name}
                    </CardTitle>
                    <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>
                      {achievement.rarity}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--cyber-primary)]">+{achievement.xpReward} XP</span>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            {/* Daily Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges?.map((challenge) => (
                <Card key={challenge.id} className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5" />
                      {challenge.name}
                    </CardTitle>
                    <Badge variant={challenge.isCompleted ? "default" : "outline"}>
                      {challenge.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">{challenge.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Progress</span>
                        <span className="text-sm text-gray-400">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="w-full" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--cyber-primary)]">
                          +{challenge.reward.xp} XP
                        </span>
                        {challenge.isCompleted && (
                          <Badge className="bg-green-500">Completed</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Leaderboard */}
            <Card className="bg-[var(--cyber-surface)] border-[var(--cyber-accent)]">
              <CardHeader>
                <CardTitle className="text-white">Top Coders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard?.map((entry, index) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-[var(--cyber-dark)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{entry.username}</div>
                          {entry.badge && (
                            <div className="text-xs text-gray-400">{entry.badge}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-[var(--cyber-primary)] font-bold">
                        {entry.score.toLocaleString()} XP
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}