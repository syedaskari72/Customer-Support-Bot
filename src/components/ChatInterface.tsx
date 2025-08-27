'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    language?: string;
    intent?: string;
  };
}

interface ChatInterfaceProps {
  userId: string;
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export default function ChatInterface({ userId, sessionId, onSessionChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadConversationHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/conversations?userId=${userId}&sessionId=${currentSessionId}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        const historyMessages: Message[] = data.conversations.map((conv: { id: string; message: string; response: string; timestamp: string; metadata?: Record<string, unknown> }) => [
          {
            id: `${conv.id}-user`,
            content: conv.message,
            isUser: true,
            timestamp: new Date(conv.timestamp),
            metadata: conv.metadata,
          },
          {
            id: `${conv.id}-bot`,
            content: conv.response,
            isUser: false,
            timestamp: new Date(conv.timestamp),
            metadata: conv.metadata,
          },
        ]).flat();

        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, [userId, currentSessionId]);

  // Load conversation history on mount
  useEffect(() => {
    if (currentSessionId) {
      loadConversationHistory();
    }
  }, [currentSessionId, loadConversationHistory]);

  // Listen for info card clicks
  useEffect(() => {
    const handleInfoCardClick = (event: CustomEvent) => {
      const message = event.detail.message;
      setInputValue(message);
      // Auto-send the message after a short delay
      setTimeout(() => {
        if (message.trim()) {
          sendAutoMessage(message);
        }
      }, 200);
    };

    const sendAutoMessage = async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            userId,
            sessionId: currentSessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('sendMessage', handleInfoCardClick as EventListener);
    return () => {
      window.removeEventListener('sendMessage', handleInfoCardClick as EventListener);
    };
  }, [userId, currentSessionId, isLoading]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Update session ID if it changed
      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
        onSessionChange?.(data.sessionId);
      }

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Customer Support</h2>
            <p className="text-sm text-blue-100">How can I help you today?</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] bg-gradient-to-b from-gray-50/50 to-white/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">Start a conversation!</p>
            <p className="text-sm text-gray-500">I&apos;m here to help with your food delivery questions.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                message.isUser
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {message.isUser && (
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">Typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-6 bg-white/80 backdrop-blur-sm rounded-b-xl">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
