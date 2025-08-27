import { NextRequest, NextResponse } from 'next/server';
import { ConversationStore } from '@/lib/supabase';
import { apiRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { InputValidator } from '@/lib/validation';
import { MockConversationStore } from '@/lib/mock-providers';
import { EnvironmentValidator } from '@/lib/env-validation';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!apiRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((apiRateLimiter.getResetTime(clientId) - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = InputValidator.validateConversationQuery(searchParams);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { userId, sessionId, limit } = validation.sanitizedValue as {
      userId: string;
      sessionId?: string;
      limit: number;
    };

    // Check if we should use mock mode
    const useMockMode = shouldUseMockMode();

    // Get conversation history
    const conversations = useMockMode
      ? await MockConversationStore.getConversationHistory(userId, sessionId || undefined, limit)
      : await ConversationStore.getConversationHistory(userId, sessionId || undefined, limit);

    return NextResponse.json({
      conversations: conversations.reverse(), // Return in chronological order
      count: conversations.length,
    });

  } catch (error) {
    console.error('Conversations API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // This would require implementing a delete method in ConversationStore
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Conversation deletion not implemented yet',
      userId,
      sessionId,
    });

  } catch (error) {
    console.error('Delete conversations API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine if we should use mock mode
function shouldUseMockMode(): boolean {
  try {
    EnvironmentValidator.getConfig();
    return false; // Configuration is valid, use real services
  } catch {
    return true; // Configuration is invalid, use mock mode
  }
}
