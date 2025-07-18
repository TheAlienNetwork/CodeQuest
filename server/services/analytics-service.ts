import { storage } from '../storage';

export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  executionTime: number;
  memoryUsage: number;
  errorCount: number;
  warningCount: number;
  testCoverage: number;
}

export interface LearningAnalytics {
  conceptMastery: { [concept: string]: number };
  learningVelocity: number;
  strengthAreas: string[];
  improvementAreas: string[];
  predictedNextConcepts: string[];
  studyRecommendations: string[];
}

export interface PerformanceMetrics {
  avgSubmissionTime: number;
  successRate: number;
  hintsUsed: number;
  streakData: { date: string; completed: boolean }[];
  timeSpentCoding: number;
  focusScore: number;
}

export class AnalyticsService {
  
  // Analyze code complexity and quality
  analyzeCodeComplexity(code: string): CodeMetrics {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const linesOfCode = lines.length;
    
    // Calculate cyclomatic complexity
    const complexityKeywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with', 'def', 'class'];
    let complexity = 1; // Base complexity
    
    lines.forEach(line => {
      complexityKeywords.forEach(keyword => {
        if (line.includes(keyword)) {
          complexity += 1;
        }
      });
    });
    
    // Estimate execution performance
    const executionTime = this.estimateExecutionTime(code);
    const memoryUsage = this.estimateMemoryUsage(code);
    
    // Count potential issues
    const errorCount = this.countPotentialErrors(code);
    const warningCount = this.countPotentialWarnings(code);
    
    return {
      linesOfCode,
      complexity,
      executionTime,
      memoryUsage,
      errorCount,
      warningCount,
      testCoverage: this.calculateTestCoverage(code)
    };
  }
  
  // Generate learning analytics for a user
  async generateLearningAnalytics(userId: number): Promise<LearningAnalytics> {
    const user = await storage.getUser(userId);
    const submissions = await storage.getUserSubmissions(userId);
    const allQuests = await storage.getAllQuests();
    
    if (!user || !submissions.length) {
      return {
        conceptMastery: {},
        learningVelocity: 0,
        strengthAreas: [],
        improvementAreas: [],
        predictedNextConcepts: [],
        studyRecommendations: []
      };
    }
    
    // Analyze concept mastery
    const conceptMastery: { [concept: string]: number } = {};
    const completedQuests = allQuests.filter(q => user.completedQuests?.includes(q.id));
    
    completedQuests.forEach(quest => {
      if (quest.concepts) {
        quest.concepts.forEach(concept => {
          conceptMastery[concept] = (conceptMastery[concept] || 0) + 1;
        });
      }
    });
    
    // Calculate learning velocity (quests per day)
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const learningVelocity = (user.completedQuests?.length || 0) / daysSinceStart;
    
    // Identify strength and improvement areas
    const masteryEntries = Object.entries(conceptMastery);
    const strengthAreas = masteryEntries
      .filter(([_, count]) => count >= 3)
      .map(([concept, _]) => concept);
    
    const improvementAreas = masteryEntries
      .filter(([_, count]) => count <= 1)
      .map(([concept, _]) => concept);
    
    // Predict next concepts based on current progress
    const predictedNextConcepts = this.predictNextConcepts(user, allQuests);
    
    // Generate study recommendations
    const studyRecommendations = this.generateStudyRecommendations(user, conceptMastery, submissions);
    
    return {
      conceptMastery,
      learningVelocity,
      strengthAreas,
      improvementAreas,
      predictedNextConcepts,
      studyRecommendations
    };
  }
  
  // Generate performance metrics
  async generatePerformanceMetrics(userId: number): Promise<PerformanceMetrics> {
    const user = await storage.getUser(userId);
    const submissions = await storage.getUserSubmissions(userId);
    
    if (!user || !submissions.length) {
      return {
        avgSubmissionTime: 0,
        successRate: 0,
        hintsUsed: 0,
        streakData: [],
        timeSpentCoding: 0,
        focusScore: 0
      };
    }
    
    // Calculate success rate
    const successfulSubmissions = submissions.filter(s => s.isSuccessful);
    const successRate = (successfulSubmissions.length / submissions.length) * 100;
    
    // Calculate average submission time (mock data for now)
    const avgSubmissionTime = submissions.reduce((sum, s) => sum + (s.executionTime || 0), 0) / submissions.length;
    
    // Generate streak data for the last 30 days
    const streakData = this.generateStreakData(user, 30);
    
    // Calculate focus score based on submission patterns
    const focusScore = this.calculateFocusScore(submissions);
    
    return {
      avgSubmissionTime,
      successRate,
      hintsUsed: user.hintsUsed || 0,
      streakData,
      timeSpentCoding: submissions.length * 15, // Estimate 15 minutes per submission
      focusScore
    };
  }
  
  // Advanced quest recommendation system
  async recommendQuests(userId: number): Promise<any[]> {
    const user = await storage.getUser(userId);
    const allQuests = await storage.getAllQuests();
    const analytics = await this.generateLearningAnalytics(userId);
    
    if (!user || !allQuests.length) return [];
    
    // Filter available quests
    const availableQuests = allQuests.filter(quest => 
      !user.completedQuests?.includes(quest.id) && 
      quest.requiredLevel <= user.level
    );
    
    // Score quests based on multiple factors
    const scoredQuests = availableQuests.map(quest => {
      let score = 0;
      
      // Factor 1: Concept relevance
      if (quest.concepts) {
        quest.concepts.forEach(concept => {
          if (analytics.improvementAreas.includes(concept)) {
            score += 3; // High priority for improvement areas
          } else if (analytics.predictedNextConcepts.includes(concept)) {
            score += 2; // Medium priority for predicted concepts
          }
        });
      }
      
      // Factor 2: Difficulty appropriateness
      const difficultyScore = this.calculateDifficultyScore(quest, user);
      score += difficultyScore;
      
      // Factor 3: Learning path continuity
      const continuityScore = this.calculateContinuityScore(quest, user, allQuests);
      score += continuityScore;
      
      return { ...quest, recommendationScore: score };
    });
    
    // Sort by recommendation score and return top 5
    return scoredQuests
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
  }
  
  // Private helper methods
  private estimateExecutionTime(code: string): number {
    const lines = code.split('\n').length;
    const loops = (code.match(/for\s|while\s/g) || []).length;
    return lines * 0.1 + loops * 0.5; // Simple estimation
  }
  
  private estimateMemoryUsage(code: string): number {
    const variables = (code.match(/\w+\s*=/g) || []).length;
    const dataStructures = (code.match(/\[|\{/g) || []).length;
    return variables * 0.1 + dataStructures * 0.5; // KB estimation
  }
  
  private countPotentialErrors(code: string): number {
    const errorPatterns = [
      /print\s*\(/g, // Missing parentheses
      /=\s*=/g, // Assignment instead of comparison
      /\[\s*\]/g, // Empty brackets
    ];
    
    return errorPatterns.reduce((count, pattern) => {
      return count + (code.match(pattern) || []).length;
    }, 0);
  }
  
  private countPotentialWarnings(code: string): number {
    const warningPatterns = [
      /^\s*[a-zA-Z_]/gm, // Potential unused variables
      /\s{8,}/g, // Too much indentation
    ];
    
    return warningPatterns.reduce((count, pattern) => {
      return count + (code.match(pattern) || []).length;
    }, 0);
  }
  
  private calculateTestCoverage(code: string): number {
    const hasTests = code.includes('assert') || code.includes('test') || code.includes('unittest');
    return hasTests ? 80 : 0; // Simple binary test coverage
  }
  
  private predictNextConcepts(user: any, allQuests: any[]): string[] {
    const currentConcepts = new Set();
    const completedQuests = allQuests.filter(q => user.completedQuests?.includes(q.id));
    
    completedQuests.forEach(quest => {
      if (quest.concepts) {
        quest.concepts.forEach(concept => currentConcepts.add(concept));
      }
    });
    
    // Find concepts from next level quests
    const nextLevelQuests = allQuests.filter(q => 
      q.requiredLevel <= user.level + 1 && 
      !user.completedQuests?.includes(q.id)
    );
    
    const nextConcepts = new Set();
    nextLevelQuests.forEach(quest => {
      if (quest.concepts) {
        quest.concepts.forEach(concept => {
          if (!currentConcepts.has(concept)) {
            nextConcepts.add(concept);
          }
        });
      }
    });
    
    return Array.from(nextConcepts).slice(0, 5);
  }
  
  private generateStudyRecommendations(user: any, conceptMastery: any, submissions: any[]): string[] {
    const recommendations = [];
    
    // Based on concept mastery
    const weakConcepts = Object.entries(conceptMastery)
      .filter(([_, count]) => (count as number) <= 1)
      .map(([concept, _]) => concept);
    
    if (weakConcepts.length > 0) {
      recommendations.push(`Focus on mastering: ${weakConcepts.join(', ')}`);
    }
    
    // Based on submission patterns
    if (submissions.length > 0) {
      const recentSubmissions = submissions.slice(-5);
      const errorRate = recentSubmissions.filter(s => !s.isSuccessful).length / recentSubmissions.length;
      
      if (errorRate > 0.4) {
        recommendations.push("Take more time to debug and test your code before submission");
      }
    }
    
    // Based on learning velocity
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const questsPerDay = (user.completedQuests?.length || 0) / daysSinceStart;
    
    if (questsPerDay < 0.1) {
      recommendations.push("Try to complete at least one quest every few days to maintain momentum");
    }
    
    return recommendations;
  }
  
  private generateStreakData(user: any, days: number): { date: string; completed: boolean }[] {
    const streakData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Mock data - in real implementation, track daily completion
      const completed = Math.random() > 0.3; // 70% completion rate
      
      streakData.push({
        date: date.toISOString().split('T')[0],
        completed
      });
    }
    
    return streakData;
  }
  
  private calculateFocusScore(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    
    // Calculate focus based on submission consistency
    const submissionTimes = submissions.map(s => new Date(s.createdAt).getTime());
    const intervals = [];
    
    for (let i = 1; i < submissionTimes.length; i++) {
      intervals.push(submissionTimes[i] - submissionTimes[i-1]);
    }
    
    if (intervals.length === 0) return 100;
    
    // Calculate consistency (lower variance = higher focus)
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to focus score (0-100)
    const focusScore = Math.max(0, 100 - (standardDeviation / avgInterval) * 100);
    return Math.round(focusScore);
  }
  
  private calculateDifficultyScore(quest: any, user: any): number {
    const userLevel = user.level;
    const questLevel = quest.requiredLevel;
    
    if (questLevel === userLevel) return 2;
    if (questLevel === userLevel + 1) return 1;
    if (questLevel < userLevel) return 0;
    return -1;
  }
  
  private calculateContinuityScore(quest: any, user: any, allQuests: any[]): number {
    const completedQuests = allQuests.filter(q => user.completedQuests?.includes(q.id));
    
    if (completedQuests.length === 0) return 0;
    
    const lastCompletedQuest = completedQuests[completedQuests.length - 1];
    
    // Check if quest concepts build on previous concepts
    const sharedConcepts = quest.concepts?.filter(concept => 
      lastCompletedQuest.concepts?.includes(concept)
    ) || [];
    
    return sharedConcepts.length;
  }
}

export const analyticsService = new AnalyticsService();