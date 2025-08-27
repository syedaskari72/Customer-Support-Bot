import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ConversationStore } from '@/lib/supabase';
import { MockConversationStore } from '@/lib/mock-providers';
import { EnvironmentValidator } from '@/lib/env-validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if we should use mock mode
    const useMockMode = shouldUseMockMode();

    // Get user sessions
    const sessions = useMockMode
      ? await MockConversationStore.getUserSessions(userId)
      : await ConversationStore.getUserSessions(userId);

    return NextResponse.json({
      sessions,
      count: sessions.length,
    });

  } catch (error) {
    console.error('Sessions API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate new session ID
    const sessionId = uuidv4();

    // Check if we should use mock mode
    const useMockMode = shouldUseMockMode();

    // Create new session
    const session = useMockMode
      ? await MockConversationStore.createOrUpdateSession(
          userId,
          sessionId,
          {
            user_agent: request.headers.get('user-agent'),
            created_at: new Date().toISOString(),
          }
        )
      : await ConversationStore.createOrUpdateSession(
          userId,
          sessionId,
          {
            user_agent: request.headers.get('user-agent'),
            created_at: new Date().toISOString(),
          }
        );

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session,
      sessionId,
    });

  } catch (error) {
    console.error('Create session API error:', error);
    
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
