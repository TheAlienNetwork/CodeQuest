import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: number;
  message: string;
  isAI: boolean;
  timestamp: Date;
}

interface AIChatProps {
  userId: number;
  questId?: number;
  onXPGain?: (xp: number) => void;
}

export default function AIChat({ userId, questId, onXPGain }: AIChatProps) {
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
      try {
        const response = await fetch(`/api/chat/${userId}${questId ? `/${questId}` : ''}`);
        if (response.ok) {
          const chatHistory = await response.json();
          setMessages(chatHistory);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, [userId, questId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
        userId,
        questId,
        message: inputMessage.trim(),
        isAI: false,
      });

      const result = await response.json();
      
      if (result.aiMessage) {
        setMessages(prev => [...prev, result.aiMessage]);
      }
      
      if (result.xpEarned > 0) {
        onXPGain?.(result.xpEarned);
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-[var(--cyber-gray)] border-b border-[var(--cyber-cyan)]/30 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[var(--cyber-purple)]" />
          <span className="font-bold text-[var(--cyber-purple)]">AI Coding Tutor</span>
          <div className="w-2 h-2 bg-[var(--cyber-green)] rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[var(--cyber-purple)] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai rounded-lg px-4 py-2 max-w-sm">
              <p className="text-sm text-white">
                Hello! I'm your AI coding tutor. I'm here to help you learn Python and complete your quests. 
                Feel free to ask me anything about programming!
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.isAI ? '' : 'justify-end'}`}>
            {message.isAI && (
              <div className="w-8 h-8 bg-[var(--cyber-purple)] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`${message.isAI ? 'chat-bubble-ai' : 'chat-bubble-user'} rounded-lg px-4 py-2 max-w-sm`}>
              <p className="text-sm text-white whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
            
            {!message.isAI && (
              <div className="w-8 h-8 bg-[var(--cyber-cyan)] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[var(--cyber-purple)] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai rounded-lg px-4 py-2 max-w-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="border-t border-[var(--cyber-cyan)]/30 p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask the AI tutor anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/50 text-white placeholder-gray-400 focus:border-[var(--cyber-cyan)] focus:ring-[var(--cyber-cyan)]/50"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="btn-cyber"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center mt-2 text-xs text-gray-400">
          <i className="fas fa-lightbulb mr-1 text-[var(--cyber-cyan)]"></i>
          Pro tip: Ask for hints, explanations, or code reviews!
        </div>
      </div>
    </div>
  );
}
