'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'error';
  checks: {
    environment: boolean;
    database: boolean;
    aiProvider: boolean;
    overall: boolean;
  };
  errors?: string[];
  setupInstructions?: string;
}

export default function SetupInstructions() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setShowInstructions(!data.checks.overall);
    } catch {
      setHealth({
        status: 'error',
        checks: { environment: false, database: false, aiProvider: false, overall: false },
        errors: ['Failed to check system health'],
      });
      setShowInstructions(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-blue-800">Checking system health...</span>
        </div>
      </div>
    );
  }

  if (!health || health.checks.overall) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">System is properly configured!</span>
          </div>
          <button
            onClick={checkHealth}
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-800 font-semibold mb-2">
            Setup Required - Running in Demo Mode
          </h3>
          
          <p className="text-yellow-700 mb-4">
            The chatbot is currently running with mock responses. To enable full functionality, 
            please configure the required services.
          </p>

          {/* Health Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className={`flex items-center gap-2 p-2 rounded ${
              health.checks.environment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {health.checks.environment ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Environment</span>
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded ${
              health.checks.database ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {health.checks.database ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Database</span>
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded ${
              health.checks.aiProvider ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {health.checks.aiProvider ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">AI Provider</span>
            </div>
          </div>

          {/* Errors */}
          {health.errors && health.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <h4 className="text-red-800 font-medium mb-2">Configuration Issues:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {health.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Toggle Instructions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
            >
              {showInstructions ? 'Hide' : 'Show'} Setup Instructions
            </button>
            
            <button
              onClick={checkHealth}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recheck
            </button>
          </div>

          {/* Setup Instructions */}
          {showInstructions && (
            <div className="mt-4 p-4 bg-white border border-yellow-200 rounded">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Setup Guide:</h4>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">1. Supabase Database Setup</h5>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
                    <li>• Create a new project</li>
                    <li>• Copy your project URL and API keys</li>
                    <li>• <strong>Important:</strong> Go to SQL Editor and run the schema from <code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code></li>
                    <li>• This creates the required tables: <code className="bg-gray-100 px-1 rounded">user_sessions</code> and <code className="bg-gray-100 px-1 rounded">conversations</code></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">2. AI Provider Setup (choose one)</h5>
                  <div className="ml-4">
                    <p className="text-gray-600 mb-2"><strong>Option A - OpenAI:</strong></p>
                    <ul className="text-gray-600 space-y-1 ml-4 mb-3">
                      <li>• Get API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">platform.openai.com <ExternalLink className="w-3 h-3" /></a></li>
                      <li>• Set <code className="bg-gray-100 px-1 rounded">AI_PROVIDER=openai</code></li>
                    </ul>
                    
                    <p className="text-gray-600 mb-2"><strong>Option B - Anthropic:</strong></p>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Get API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">console.anthropic.com <ExternalLink className="w-3 h-3" /></a></li>
                      <li>• Set <code className="bg-gray-100 px-1 rounded">AI_PROVIDER=anthropic</code></li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">3. Update Environment Variables</h5>
                  <p className="text-gray-600 mb-2">Edit your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Provider (choose one)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key_here
# OR
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here`}
                  </pre>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">4. Restart Development Server</h5>
                  <p className="text-gray-600">Run <code className="bg-gray-100 px-1 rounded">npm run dev</code> after updating the configuration.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
