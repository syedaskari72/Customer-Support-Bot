import { NextRequest, NextResponse } from 'next/server';
import { MockAIProvider } from '@/lib/mock-providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Simple chat API called with message:', message);

    // Use mock AI provider directly
    const mockAI = new MockAIProvider();
    const response = await mockAI.generateResponse(message);

    console.log('Generated response:', response);

    return NextResponse.json({
      response,
      status: 'success',
      mode: 'simple-mock',
    });

  } catch (error) {
    console.error('Simple chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Sorry, I encountered an error.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
