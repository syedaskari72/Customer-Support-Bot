'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageCircle, Clock } from 'lucide-react';

interface Session {
  id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
  metadata?: {
    user_agent?: string;
  };
}

interface SessionManagerProps {
  userId: string;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
}

export default function SessionManager({
  userId,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      try {
        // If there's an onDeleteSession callback, use it
        if (onDeleteSession) {
          onDeleteSession(sessionId);
        }

        // Remove from local state
        setSessions(prev => prev.filter(session => session.session_id !== sessionId));

        // If this was the current session, create a new one
        if (sessionId === currentSessionId) {
          onNewSession();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(prev => [data.session, ...prev]);
        onNewSession();
        onSessionSelect(data.sessionId);
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-full lg:w-80 bg-gradient-to-b from-white to-gray-50 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 flex flex-col shadow-lg h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Chat Sessions</h3>
          <button
            onClick={createNewSession}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Start new conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Your conversation history is saved and remembered.
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new chat to begin!</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.session_id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-lg hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => onSessionSelect(session.session_id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentSessionId === session.session_id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}>
                        <MessageCircle className={`w-4 h-4 ${
                          currentSessionId === session.session_id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        Session {session.session_id.slice(-8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Last active: {formatDate(session.last_activity)}</span>
                    </div>

                    <div className="text-xs text-gray-400">
                      Created: {formatDate(session.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentSessionId === session.session_id && (
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.session_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          <p>All conversations are securely stored</p>
          <p>and can be resumed anytime.</p>
        </div>
      </div>
    </div>
  );
}
