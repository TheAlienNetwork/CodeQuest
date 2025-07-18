
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: number;
  message: string;
  isAI: boolean;
  timestamp: Date;
}

interface User {
  id: number;
  level: number;
  xp: number;
  adventurersName: string;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  solutionCode?: string;
}

interface AIChatProps {
  user: User | null;
  quest: Quest | null;
  onUserUpdate?: (user: User) => void;
}

export default function AIChat({ user, quest, onUserUpdate }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const loadChatHistory = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/chat/${user.id}${quest?.id ? `/${quest.id}` : ''}`);
        if (response.ok) {
          const chatHistory = await response.json();
          setMessages(chatHistory);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, [user?.id, quest?.id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      message: inputMessage.trim(),
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/chat', {
        userId: user.id,
        questId: quest?.id,
        message: inputMessage.trim(),
        isAI: false,
      });

      const result = await response.json();

      if (result.aiMessage) {
        setMessages(prev => [...prev, result.aiMessage]);
      }

      if (result.xpEarned > 0 && onUserUpdate) {
        const updatedUser = { ...user, xp: user.xp + result.xpEarned };
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        message: 'Sorry, I\'m having trouble connecting right now. Please try again!',
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGetHint = async () => {
    if (!user || !quest) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          questId: quest.id,
          code: '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const hintMessage = {
          id: Date.now(),
          message: `💡 Hint: ${data.hint}`,
          isAI: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, hintMessage]);

        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSolution = async () => {
    if (!user || !quest || user.xp < 50) return;

    setIsLoading(true);
    try {
      const solutionMessage = {
        id: Date.now(),
        message: `🎯 Solution for "${quest.title}":\n\n\`\`\`python\n${quest.solutionCode || 'No solution available'}\n\`\`\`\n\n*Cost: 50 XP*`,
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, solutionMessage]);

      // Deduct XP for solution
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          xp: user.xp - 50
        }),
      });

      if (response.ok && onUserUpdate) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Failed to get solution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--cyber-gray)]">
      <div className="p-4 border-b border-[var(--cyber-cyan)]/30">
        <h3 className="font-bold text-[var(--cyber-cyan)] flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Tutor
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Your coding companion for hints and guidance
        </p>

        {/* AI Tutor Action Buttons */}
        {user && quest && (
          <div className="mt-3 space-y-2">
            <Button
              onClick={handleGetHint}
              disabled={isLoading}
              size="sm"
              className="w-full bg-[var(--cyber-purple)] text-white hover:bg-[var(--cyber-purple)]/80"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Hint (Free)
            </Button>
            <Button
              onClick={handleGetSolution}
              disabled={isLoading || (user.xp < 50)}
              size="sm"
              className="w-full bg-[var(--cyber-yellow)] text-black hover:bg-[var(--cyber-yellow)]/80"
            >
              <Zap className="w-4 h-4 mr-2" />
              Show Solution (50 XP)
            </Button>
            {user.xp < 50 && (
              <p className="text-xs text-gray-400">Need 50 XP for solution</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-auto chat-scrollbar">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Hi {user?.adventurersName || 'Adventurer'}! 👋</p>
              <p className="text-sm mt-1">Ask me anything about your quest!</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.isAI ? 'items-start' : 'items-start justify-end'
              }`}
            >
              {message.isAI && (
                <div className="w-8 h-8 bg-[var(--cyber-cyan)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-black" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  message.isAI
                    ? 'bg-[var(--cyber-dark)] text-white border border-[var(--cyber-cyan)]/30'
                    : 'bg-[var(--cyber-cyan)] text-black ml-auto'
                }`}
              >
                {message.message}
              </div>
              {!message.isAI && (
                <div className="w-8 h-8 bg-[var(--cyber-purple)] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-[var(--cyber-cyan)]/30">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for help or hints..."
            className="flex-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
