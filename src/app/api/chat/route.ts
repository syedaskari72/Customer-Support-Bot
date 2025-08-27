import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ConversationStore } from '@/lib/supabase';
import { getAIProvider } from '@/lib/ai-providers';

import { chatRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { InputValidator, ContentFilter } from '@/lib/validation';
import { MockAIProvider, MockConversationStore } from '@/lib/mock-providers';
import { EnvironmentValidator } from '@/lib/env-validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!chatRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before sending another message.',
          retryAfter: Math.ceil((chatRateLimiter.getResetTime(clientId) - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = InputValidator.validateChatRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { message, userId, sessionId } = validation.sanitizedValue as {
      message: string;
      userId: string;
      sessionId?: string;
    };

    // Content filtering
    if (!ContentFilter.isAppropriate(message)) {
      return NextResponse.json(
        {
          error: 'Inappropriate content detected',
          message: 'Please keep the conversation professional and appropriate.'
        },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || uuidv4();

    // For now, let's use a simplified approach that always works
    console.log('Processing chat message:', message);

    let aiResponse: string;
    let useMockMode = true; // Start with mock mode for reliability

    try {
      // Try to use real AI if configured
      EnvironmentValidator.getConfig();
      const aiProvider = getAIProvider();

      // Simple context without database dependency
      const simpleContext = `User message: ${message}`;

      aiResponse = await aiProvider.generateResponse(message, simpleContext);
      useMockMode = false;
      console.log('✅ Used real AI provider');

    } catch (error) {
      console.log('🔧 AI provider failed, using mock mode:', error);
      // Fallback to mock mode
      const mockAI = new MockAIProvider();
      aiResponse = await mockAI.generateResponse(message);
      useMockMode = true;
    }

    // Detect intent (basic implementation)
    const metadata = {
      intent: detectIntent(message),
      timestamp: new Date().toISOString(),
    };

    // Save conversation to database
    let savedConversation: { id: string } | null = null;

    if (useMockMode) {
      savedConversation = await MockConversationStore.saveMessage(
        userId,
        currentSessionId,
        message,
        aiResponse,
        metadata
      );

      // Update session activity
      await MockConversationStore.createOrUpdateSession(userId, currentSessionId, {
        user_agent: request.headers.get('user-agent'),
        last_message_at: new Date().toISOString(),
      });
    } else {
      savedConversation = await ConversationStore.saveMessage(
        userId,
        currentSessionId,
        message,
        aiResponse,
        metadata
      );

      // Update session activity
      await ConversationStore.createOrUpdateSession(userId, currentSessionId, {
        user_agent: request.headers.get('user-agent'),
        last_message_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      response: aiResponse,
      sessionId: currentSessionId,
      conversationId: savedConversation?.id,
      metadata,
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('configuration')) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'The chatbot is not properly configured. Please check the environment variables.',
          details: error.message
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Sorry, I encountered an error while processing your message. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Simple intent detection based on keywords
function detectIntent(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('refund') || lowerText.includes('money back') || lowerText.includes('return')) {
    return 'refund_request';
  }

  if (lowerText.includes('cancel') || lowerText.includes('stop') || lowerText.includes('abort')) {
    return 'cancellation';
  }

  if (lowerText.includes('late') || lowerText.includes('delay') || lowerText.includes('slow')) {
    return 'delivery_delay';
  }

  if (lowerText.includes('track') || lowerText.includes('where') || lowerText.includes('status')) {
    return 'order_tracking';
  }

  if (lowerText.includes('payment') || lowerText.includes('billing') || lowerText.includes('charge')) {
    return 'payment_issue';
  }

  if (lowerText.includes('help') || lowerText.includes('support') || lowerText.includes('assist')) {
    return 'general_help';
  }

  return 'general_inquiry';
}

// Helper function to determine if we should use mock mode (currently unused)
// async function shouldUseMockMode(): Promise<boolean> {
  // try {
  //   EnvironmentValidator.getConfig();

  //   // Also test if database is accessible by trying a simple query
  //   try {
  //     await ConversationStore.getUserSessions('test-user');
  //     return false; // Database is accessible, use real services
  //   } catch (dbError) {
  //     console.log('🔧 Database error, using mock mode:', dbError);
  //     return true; // Database not accessible, use mock mode
  //   }
  // } catch (error) {
  //   console.log('🔧 Configuration error, using mock mode:', error);
  //   return true; // Configuration is invalid, use mock mode
  // }
// }
