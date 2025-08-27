'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from '@/components/ChatInterface';
import SessionManager from '@/components/SessionManager';


export default function Home() {
  const [userId, setUserId] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showSessionManager, setShowSessionManager] = useState(false);

  // Initialize user ID on mount
  useEffect(() => {
    let storedUserId = localStorage.getItem('customer-support-user-id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('customer-support-user-id', storedUserId);
    }
    setUserId(storedUserId);

    // Initialize with a new session
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
  }, []);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewSession = () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
  };

  const handleInfoCardClick = (message: string) => {
    // This will be handled by the ChatInterface component
    // We'll pass this function down to trigger a message
    const event = new CustomEvent('sendMessage', { detail: { message } });
    window.dispatchEvent(event);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FoodDelivery Support
                </h1>
              </div>
              <span className="ml-3 px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-sm">
                AI Assistant
              </span>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => setShowSessionManager(!showSessionManager)}
                className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <span className="hidden sm:inline">{showSessionManager ? 'Hide' : 'Show'} Chat History</span>
                <span className="sm:hidden">💬</span>
              </button>

              <div className="text-xs lg:text-sm text-gray-500 bg-gray-100 px-2 lg:px-3 py-1 rounded-full">
                <span className="hidden sm:inline">User: </span>{userId.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          {/* Session Manager Sidebar */}
          {showSessionManager && (
            <div className="lg:w-80 w-full lg:h-auto h-48 lg:overflow-visible overflow-y-auto">
              <SessionManager
                userId={userId}
                currentSessionId={currentSessionId}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
              />
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              userId={userId}
              sessionId={currentSessionId}
              onSessionChange={setCurrentSessionId}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How can I help you today?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <button
              onClick={() => handleInfoCardClick("I have an issue with my order")}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📦</span>
                </div>
                <h3 className="font-semibold text-blue-900 group-hover:text-blue-800">Order Issues</h3>
              </div>
              <p className="text-sm text-blue-700 text-left">
                Track orders, report delays, or request refunds
              </p>
            </button>

            <button
              onClick={() => handleInfoCardClick("I have a question about the menu")}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🍽️</span>
                </div>
                <h3 className="font-semibold text-green-900 group-hover:text-green-800">Menu Questions</h3>
              </div>
              <p className="text-sm text-green-700 text-left">
                Ask about ingredients, availability, or recommendations
              </p>
            </button>

            <button
              onClick={() => handleInfoCardClick("I need help with my account")}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h3 className="font-semibold text-purple-900 group-hover:text-purple-800">Account Help</h3>
              </div>
              <p className="text-sm text-purple-700 text-left">
                Payment issues, address changes, or account settings
              </p>
            </button>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">🤖</div>
                <p className="text-sm text-gray-700 font-medium">
                  <strong>AI-Powered Support:</strong> I&apos;m here 24/7 to help with your food delivery needs.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  I remember our conversations to provide personalized assistance!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
