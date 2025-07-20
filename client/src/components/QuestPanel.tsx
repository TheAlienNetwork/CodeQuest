import { Clock, Gem, Star, Target } from 'lucide-react';

interface QuestPanelProps {
  quest: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    estimatedTime: string;
    testCases?: Array<{
      input: string;
      expectedOutput: string;
    }>;
  } | null;
}

export default function QuestPanel({ quest }: QuestPanelProps) {
  if (!quest) {
    return (
      <div className="bg-[var(--cyber-gray)] p-4 rounded-lg m-4">
        <div className="text-center text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-2" />
          <p>No quest available</p>
          <p className="text-sm mt-2">Check your connection or try refreshing</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-[var(--cyber-green)] text-black';
      case 'intermediate':
        return 'bg-[var(--cyber-purple)] text-white';
      case 'advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-[var(--cyber-gray)] border-b border-[var(--cyber-cyan)]/30 p-3 sm:p-4 lg:p-6">
      <div className="quest-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--cyber-cyan)]">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
            Current Quest
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty}
          </div>
        </div>

        <h4 className="font-bold text-white mb-2">{quest.title}</h4>

        <p className="text-gray-300 text-sm mb-3">
          {quest.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-[var(--cyber-green)]">
            <Gem className="w-4 h-4 inline mr-1" />
            Reward: {quest.xpReward} XP
          </div>
          <div className="text-sm text-[var(--cyber-cyan)]">
            <Clock className="w-4 h-4 inline mr-1" />
            Est. {quest.estimatedTime}
          </div>
        </div>

        {/* Expected Output Section */}
        {quest.testCases && quest.testCases.length > 0 && (
          <div className="mt-4 p-3 bg-[var(--cyber-dark)] rounded-lg border border-[var(--cyber-cyan)]/30">
            <h5 className="font-bold text-[var(--cyber-cyan)] mb-2 text-sm">Expected Output:</h5>
            <div className="space-y-2">
              {quest.testCases.map((testCase, index) => (
                <div key={index} className="text-sm">
                  {testCase.input && (
                    <div className="text-gray-400">
                      <span className="font-medium">Input:</span> {testCase.input}
                    </div>
                  )}
                  <div className="text-[var(--cyber-green)] font-mono">
                    <div className="font-medium text-gray-400 mb-1">Output:</div>
                    <pre className="whitespace-pre-wrap">{testCase.expectedOutput}</pre>
                  </div>
                  {index < quest.testCases.length - 1 && <div className="border-t border-gray-600 my-2"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}