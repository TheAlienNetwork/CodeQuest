import { useQuery } from '@tanstack/react-query';
import CodeEditorWithHighlighting from '@/components/CodeEditorWithHighlighting';
import { TerminalOutput } from '@/components/TerminalOutput';
import AIChat from '@/components/AIChat';
import QuestPanel from '@/components/QuestPanel';
import XPBar from '@/components/XPBar';
import LearningPanel from '@/components/LearningPanel';
import LessonsPanel from '@/components/LessonsPanel';
import BadgeDisplay from '@/components/BadgeDisplay';
import ProfileIcon from '@/components/ProfileIcon';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame } from 'lucide-react';
import MilestonesPanel from '@/components/MilestonesPanel';

interface User {
  id: number;
  email: string;
  adventurersName: string;
  profileImageUrl?: string;
  xp: number;
  level: number;
  rank: string;
  achievements: number;
  streak: number;
  currentQuest: number;
  completedQuests: number[];
}

interface Quest {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  estimatedTime: string;
  startingCode: string;
  solutionCode: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  concepts: string[];
  requiredLevel: number;
}

interface CodeQuestProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
  onShowProfile: () => void;
}

export default function CodeQuest({ user, onUserUpdate, onLogout, onShowProfile }: CodeQuestProps) {
  const [code, setCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalError, setTerminalError] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showXPGain, setShowXPGain] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'quest' | 'learning' | 'lessons' | 'milestones'>('quest');
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [isRedoingQuest, setIsRedoingQuest] = useState(false);
  const { toast } = useToast();

  // Fetch current quest
  const { data: quest, isLoading: questLoading, error: questError, refetch } = useQuery<Quest>({
    queryKey: ['/api/quest', user?.id, selectedQuestId],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');

      // If a specific quest is selected (for redoing), fetch that quest
      if (selectedQuestId) {
        const response = await apiRequest('GET', `/api/quest-by-id/${selectedQuestId}`);
        if (!response.ok) throw new Error('Failed to fetch selected quest');
        return response.json();
      }

      // Otherwise fetch current quest
      const response = await apiRequest('GET', `/api/quest/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch quest');
      return response.json();
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5000,
    cacheTime: 10000,
  });

  // Initialize code editor with quest starting code
  useEffect(() => {
    if (quest && quest.startingCode) {
      // Always reset code when switching quests or redoing
      if (!code || selectedQuestId || isRedoingQuest) {
        setCode(quest.startingCode);
        setQuestCompleted(false);
        setIsRedoingQuest(false);
      }
    }
  }, [quest, selectedQuestId, isRedoingQuest]);

  // Update current user when user data changes
  useEffect(() => {
    if (user) {
      const previousLevel = currentUser?.level || 1;
      setCurrentUser(user);

      // Check for level up
      if (user.level > previousLevel) {
        setShowLevelUp(true);
      }
    }
  }, [user, currentUser]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please write some Python code first.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setShowTerminal(true);
    setTerminalOutput('');
    setTerminalError('');

    try {
      const response = await apiRequest('POST', '/api/run', {
        code,
        userId: user.id,
      });

      const result = await response.json();
      setTerminalOutput(result.output || '');
      setTerminalError(result.error || '');

      // Handle XP reward from running code
      if (result.xpEarned > 0) {
        showXPGainAnimation(result.xpEarned);
        if (result.user) {
          onUserUpdate(result.user);
        }
      }
    } catch (error) {
      setTerminalError('Failed to execute code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please write some Python code first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest('POST', '/api/analyze', {
        userId: user.id,
        code,
        questId: quest?.id,
        isRedoing: !!selectedQuestId, // Pass flag to indicate this is a redo
      });

      const result = await response.json();

      // Only award XP if not redoing a quest
      if (result.xpEarned > 0 && !selectedQuestId) {
        showXPGainAnimation(result.xpEarned);
      }

      // Check if all test cases passed
      const testResults = result.testResults;
      let feedbackMessage = result.feedback;

      if (testResults) {
        if (testResults.allPassed) {
          feedbackMessage += `\n\n✅ PASSED: All ${testResults.total} test case(s) passed!`;
        } else {
          feedbackMessage += `\n\n❌ FAILED: ${testResults.passed}/${testResults.total} test case(s) passed.`;
        }
      }

      if (result.isCorrect) {
        if (selectedQuestId) {
          feedbackMessage += "\n\n🎉 Great job practicing this quest!";
        } else {
          setQuestCompleted(true);
          feedbackMessage += "\n\n🎉 Quest completed! You can move to the next quest.";
        }
      }

      toast({
        title: result.isCorrect ? "Great job! ✅" : "Code analyzed 🔍",
        description: selectedQuestId && result.isCorrect ? "Quest practice completed!" : result.feedback,
      });

      // Update terminal with execution results
      if (result.executionResult) {
        setTerminalOutput(result.executionResult.output || '');
        setTerminalError(result.executionResult.error || '');
        setShowTerminal(true);
      }

      // Update user data only if not redoing
      if (result.user && !selectedQuestId) {
        onUserUpdate(result.user);
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze code at this time.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetHint = async () => {
    try {
      const response = await apiRequest('POST', '/api/hint', {
        userId: user.id,
        code,
      });

      const result = await response.json();

      // Don't show level up popup for AI assistance penalties
      // Just quietly update user data

      toast({
        title: "Hint 💡",
        description: result.hint,
      });

      if (result.user) {
        onUserUpdate(result.user);
      }
    } catch (error) {
      toast({
        title: "Hint unavailable",
        description: "Unable to generate hint at this time.",
        variant: "destructive",
      });
    }
  };

  const handleGetSolution = async () => {
    try {
      const response = await apiRequest('POST', '/api/solution', {
        userId: user.id,
      });

      const result = await response.json();

      // Don't show level up popup for AI assistance penalties
      // Just quietly update user data

      toast({
        title: "Solution 👁️",
        description: result.solution,
      });

      if (result.user) {
        onUserUpdate(result.user);
      }
    } catch (error) {
      toast({
        title: "Solution unavailable",
        description: "Unable to generate solution at this time.",
        variant: "destructive",
      });
    }
  };

  const handleGetExplanation = async () => {
    try {
      const response = await apiRequest('POST', '/api/explanation', {
        userId: user.id,
      });

      const result = await response.json();

      // Don't show level up popup for AI assistance penalties
      // Just quietly update user data

      toast({
        title: "Explanation 🤔",
        description: result.explanation,
      });

      if (result.user) {
        onUserUpdate(result.user);
      }
    } catch (error) {
      toast({
        title: "Explanation unavailable",
        description: "Unable to generate explanation at this time.",
        variant: "destructive",
      });
    }
  };

  const showXPGainAnimation = (xp: number) => {
    setShowXPGain(xp);
    setTimeout(() => {
      setShowXPGain(0);
    }, 3000);
  };

  const handleXPGain = (xp: number) => {
    showXPGainAnimation(xp);
    if (xp > 0) {
      apiRequest('POST', '/api/gain-xp', { userId: user.id, xp })
        .then(response => response.json())
        .then(data => {
          if (data.user) {
            onUserUpdate(data.user);
          }
        })
        .catch(error => {
          console.error("Failed to gain XP:", error);
        });
    }
  };

  const closeLevelUpModal = () => {
    setShowLevelUp(false);
  };

  const handleNextQuest = async () => {
    try {
      // Prevent layout changes during transition
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('quest-transition');
      }

      const response = await apiRequest('POST', '/api/complete-quest', {
        userId: user.id,
        questId: quest?.id,
      });

      const result = await response.json();

      if (result.nextQuest) {
        // Update state in sequence to prevent layout disruption
        setQuestCompleted(false);
        setCode(result.nextQuest.startingCode || '');
        setActiveTab('quest');

        // Refetch quest data
        refetch();

        if (result.user) {
          onUserUpdate(result.user);
        }

        toast({
          title: "New Quest Unlocked! 🚀",
          description: `Starting: ${result.nextQuest.title}`,
        });
      } else {
        toast({
          title: "Congratulations! 🎉",
          description: "You've completed all available quests!",
        });
      }

      // Remove transition class after a brief delay
      setTimeout(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.classList.remove('quest-transition');
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load next quest",
        variant: "destructive",
      });

      // Remove transition class on error too
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.remove('quest-transition');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cyber-cyan)] mx-auto mb-4"></div>
          <p className="text-[var(--cyber-cyan)]">Loading CodeQuest...</p>
        </div>
      </div>
    );
  }

  if (questLoading) {
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
        <div className="text-[var(--cyber-cyan)] text-xl">Loading CodeQuest...</div>
      </div>
    );
  }

  if (questError) {
    console.error('Quest error:', questError);
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-400 text-xl">⚠️ Failed to load quest</div>
          <p className="text-gray-400">There was an issue loading your quest data.</p>
          <div className="bg-[var(--cyber-gray)] p-4 rounded-lg text-left">
            <p className="text-xs text-gray-500 mb-2">Debug info:</p>
            <p className="text-xs text-white">User ID: {user?.id}</p>
            <p className="text-xs text-white">Error: {questError?.message || 'Unknown error'}</p>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => {
                console.log('Retrying quest fetch...');
                refetch();
              }}
              className="btn-cyber"
            >
              Retry Loading Quest
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="btn-cyber bg-[var(--cyber-pink)] hover:bg-[var(--cyber-pink)]/80"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cyber-dark)] text-white min-h-screen flex flex-col">
      {/* Top Header with XP Bar */}
      <header className="bg-[var(--cyber-darker)] border-b border-[var(--cyber-cyan)]/30 px-6 py-4 flex-shrink-0 relative z-40">
        <div className="flex items-center justify-between">
          <XPBar
            user={user}
            showXPGain={showXPGain}
            onXPGainComplete={() => setShowXPGain(0)}
          />
          <ProfileIcon user={user} onLogout={onLogout} onProfileClick={onShowProfile} />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden main-content relative z-10">
        {/* Left Panel - Code Editor */}
        <div className="w-3/5 flex flex-col border-r border-[var(--cyber-cyan)]/30 relative z-10">
          <div className="flex-1 min-h-0">
            <CodeEditorWithHighlighting
              code={code}
              onChange={setCode}
              onRunCode={handleRunCode}
              onAnalyzeCode={handleAnalyzeCode}
              isRunning={isRunning}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Terminal Output */}
          {showTerminal && (
            <div className="h-48 flex-shrink-0 border-t border-[var(--cyber-cyan)]/30">
              <TerminalOutput
                output={terminalOutput}
                error={terminalError}
                isVisible={showTerminal}
                onClose={() => setShowTerminal(false)}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Tabs for Quest/Learning & AI Chat */}
        <div className="w-2/5 flex flex-col min-h-0 max-h-full relative z-10">
          {/* Tab Navigation */}
          <div className="bg-[var(--cyber-gray)] border-b border-[var(--cyber-cyan)]/30 px-2 sm:px-4 py-2 flex-shrink-0 tab-container relative z-40">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('quest')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'quest'
                    ? 'bg-[var(--cyber-cyan)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎯 Quest
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'learning'
                    ? 'bg-[var(--cyber-cyan)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📚 Learning
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'lessons'
                    ? 'bg-[var(--cyber-cyan)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎓 Lessons
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'milestones'
                    ? 'bg-[var(--cyber-cyan)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏆 Milestones
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-[var(--cyber-gray)] overflow-hidden min-h-0 max-h-full relative z-30">
            {activeTab === 'quest' ? (
              <QuestPanel 
                quest={quest} 
                isRedoingQuest={!!selectedQuestId}
                currentQuestId={user.currentQuest}
                onReturnToCurrent={() => {
                  setSelectedQuestId(null);
                  setIsRedoingQuest(false);
                  setCode('');
                  refetch();
                  toast({
                    title: "Returned to Current Quest 🎯",
                    description: "Back to your current progress",
                  });
                }}
              />
            ) : activeTab === 'learning' ? (
              <div className="h-full p-4">
                <LearningPanel
                  quest={quest}
                  userLevel={user?.level || 1}
                  onNextQuest={handleNextQuest}
                  showNextButton={questCompleted}
                />
              </div>
            ) : activeTab === 'lessons' ? (
              <div className="h-full">
                <LessonsPanel
                  userId={user.id}
                  onSelectQuest={(questId) => {
                    setSelectedQuestId(questId);
                    setActiveTab('quest');
                    setIsRedoingQuest(true);
                    setTerminalOutput('');
                    setTerminalError('');
                    setShowTerminal(false);

                    toast({
                      title: "Quest Selected 🎯",
                      description: "Loading quest for practice...",
                    });
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <MilestonesPanel
                  user={user}
                  className="flex-1 min-h-0"
                />
              </div>
            )}
          </div>

          {/* AI Chat - Fixed Height */}
          <div className="h-96 sm:h-[28rem] flex-shrink-0 border-t border-[var(--cyber-cyan)]/30 relative z-30">
            <AIChat 
              user={currentUser || user}
              quest={selectedQuestId ? { id: selectedQuestId, title: '', description: '' } : quest}
              onUserUpdate={onUserUpdate}
            />
          </div>
        </div>
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="bg-[var(--cyber-dark)] border-2 border-[var(--cyber-cyan)] rounded-xl p-8 text-center max-w-md animate-float">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-[var(--cyber-cyan)] mb-2">LEVEL UP!</h2>
            <p className="text-xl text-white mb-4">
              You've reached <span className="text-[var(--cyber-green)] font-bold">Level {user.level}</span>
            </p>
            <div className="bg-[var(--cyber-purple)]/20 border border-[var(--cyber-purple)]/50 rounded-lg p-4 mb-4">
              <p className="text-[var(--cyber-purple)] font-bold">New Rank Unlocked:</p>
              <p className="text-white text-lg">{user.rank}</p>
            </div>
            <button
              onClick={closeLevelUpModal}
              className="btn-cyber px-6 py-3 rounded-lg font-bold text-black"
            >
              Continue Coding!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}