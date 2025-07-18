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

    // Add user message to chat immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.message,
          userId: user.id,
          questId: quest?.id || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: data.aiMessage.id,
          message: data.aiMessage.message,
          isAI: true,
          timestamp: new Date(data.aiMessage.timestamp),
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update user XP if provided
        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: 'Sorry, I encountered an error. Please try again.',
        isAI: true,
        timestamp: new Date(),
      }]);
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
    if (!user || !quest) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          questId: quest.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const solutionMessage = {
          id: Date.now(),
          message: `🎯 Solution: ${data.solution}`,
          isAI: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, solutionMessage]);

        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to get solution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetExplanation = async () => {
    if (!user || !quest) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          questId: quest.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const explanationMessage = {
          id: Date.now(),
          message: `📖 Explanation: ${data.explanation}`,
          isAI: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, explanationMessage]);

        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to get explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="h-full bg-[var(--cyber-dark)] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-[var(--cyber-primary)]" />
          <h3 className="text-lg font-semibold mb-2">AI Tutor</h3>
          <p className="text-gray-400">Please log in to chat with your AI tutor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-[var(--cyber-dark)] to-[var(--cyber-darker)] text-white flex flex-col shadow-2xl overflow-hidden">
      {/* Modern Header */}
      <div className="p-6 border-b border-[var(--cyber-accent)]/30 bg-gradient-to-r from-[var(--cyber-dark)] to-[var(--cyber-gray)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--cyber-cyan)] via-[var(--cyber-purple)] to-[var(--cyber-pink)] rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--cyber-dark)] animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-purple)]">
                AI Tutor
              </h2>
              <p className="text-sm text-gray-300 font-medium">
                {quest ? `Quest: ${quest.title}` : 'Your intelligent coding companion'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-300 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Modern Quick Actions */}
      <div className="p-6 border-b border-[var(--cyber-accent)]/30 bg-gradient-to-r from-[var(--cyber-dark)]/50 to-[var(--cyber-gray)]/50">
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetHint}
            disabled={isLoading || !quest}
            className="flex items-center gap-2 border-[var(--cyber-cyan)]/50 text-[var(--cyber-cyan)] bg-[var(--cyber-gray)]/50 hover:bg-[var(--cyber-cyan)]/20 rounded-lg px-4 py-2 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-[var(--cyber-cyan)]/30"
          >
            <Lightbulb className="w-4 h-4" />
            Get Hint (-10 XP)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetSolution}
            disabled={isLoading || !quest}
            className="flex items-center gap-2 border-[var(--cyber-purple)]/50 text-[var(--cyber-purple)] bg-[var(--cyber-gray)]/50 hover:bg-[var(--cyber-purple)]/20 rounded-lg px-4 py-2 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-[var(--cyber-purple)]/30"
          >
            <Zap className="w-4 h-4" />
            Get Solution (-50 XP)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetExplanation}
            disabled={isLoading || !quest}
            className="flex items-center gap-2 border-[var(--cyber-blue)]/50 text-[var(--cyber-blue)] bg-[var(--cyber-gray)]/50 hover:bg-[var(--cyber-blue)]/20 rounded-lg px-4 py-2 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-[var(--cyber-blue)]/30"
          >
            <BookOpen className="w-4 h-4" />
            Get Explanation (-20 XP)
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages min-h-0" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--cyber-cyan) var(--cyber-gray)'
      }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-[var(--cyber-primary)]" />
            <p>Hello {user.adventurersName}! I'm your AI tutor.</p>
            <p className="text-sm mt-2">Ask me anything about your coding quest!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-end ${message.isAI ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isAI ? 'bg-gradient-to-br from-[var(--cyber-cyan)] to-[var(--cyber-purple)]' : 'bg-gradient-to-br from-[var(--cyber-accent)] to-[var(--cyber-pink)]'
              }`}>
                {message.isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>
              <div className={`flex flex-col max-w-[75%] ${message.isAI ? 'items-start' : 'items-end'}`}>
                <div className={`relative p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                  message.isAI
                    ? 'bg-gradient-to-br from-[var(--cyber-surface)] to-[var(--cyber-gray)] text-white border border-[var(--cyber-cyan)]/30 rounded-bl-sm'
                    : 'bg-gradient-to-br from-[var(--cyber-primary)] to-[var(--cyber-cyan)] text-black border border-[var(--cyber-primary)]/50 rounded-br-sm'
                }`}>
                  {/* Message bubble tail */}
                  <div className={`absolute bottom-0 w-3 h-3 ${
                    message.isAI 
                      ? 'left-0 -ml-1.5 bg-[var(--cyber-surface)] border-l border-b border-[var(--cyber-cyan)]/30 transform rotate-45' 
                      : 'right-0 -mr-1.5 bg-[var(--cyber-primary)] border-r border-b border-[var(--cyber-primary)]/50 transform rotate-45'
                  }`}></div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                </div>
                <div className={`text-xs text-gray-500 mt-1 px-2 ${message.isAI ? 'text-left' : 'text-right'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--cyber-accent)]">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding..."
            disabled={isLoading}
            className="flex-1 bg-[var(--cyber-surface)] border-[var(--cyber-accent)] text-white placeholder-gray-400"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-[var(--cyber-primary)] hover:bg-[var(--cyber-primary)]/80 text-black"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}