/**
 * Mock providers for development when real services are not configured
 */

import { AIProvider } from './ai-providers';
import { ConversationMessage, UserSession } from './supabase';

export class MockAIProvider implements AIProvider {
  async generateResponse(prompt: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate contextual mock responses in English only
    const responses = this.getMockResponses(prompt);

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getMockResponses(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();

    // Order delay responses
    if (lowerPrompt.includes('late') || lowerPrompt.includes('delay') || lowerPrompt.includes('slow')) {
      return [
        'I apologize for the delay with your order. I can help you get a refund or free delivery credit for your next order.',
        'Sorry about the late delivery. Let me track your order and provide you with a solution - either a refund or compensation.',
        'I understand your frustration with the delayed order. Let me check the status and offer you appropriate compensation.'
      ];
    }

    // Refund responses
    if (lowerPrompt.includes('refund') || lowerPrompt.includes('money') || lowerPrompt.includes('return')) {
      return [
        'I can process your refund right away. It will be credited to your account within 3-5 business days.',
        'No problem with the refund. Let me initiate the process for you immediately.',
        'I\'ll help you get your money back. Refunds typically take 3-5 business days to appear in your account.'
      ];
    }

    // Order tracking responses
    if (lowerPrompt.includes('track') || lowerPrompt.includes('where') || lowerPrompt.includes('status')) {
      return [
        'Your order is on the way and will arrive in 15-20 minutes. You can track it live in the app.',
        'Your food is ready and the delivery person has left. It should arrive shortly.',
        'Let me check your order status. It looks like your order is being prepared and will be delivered soon.'
      ];
    }

    // Cancellation responses
    if (lowerPrompt.includes('cancel') || lowerPrompt.includes('stop')) {
      return [
        'I can help you cancel your order if it hasn\'t started preparation yet. Let me check the status.',
        'Cancellation is possible within the first few minutes. Let me see if we can still cancel your order.',
        'I\'ll check if your order can be cancelled. If not, I can arrange a refund for you.'
      ];
    }

    // Payment issues
    if (lowerPrompt.includes('payment') || lowerPrompt.includes('charge') || lowerPrompt.includes('billing')) {
      return [
        'I can help resolve any payment issues. What specific problem are you experiencing?',
        'Payment problems can usually be fixed quickly. Let me assist you with that.',
        'Don\'t worry about payment issues - I\'m here to help sort that out for you.'
      ];
    }

    // General help responses
    return [
      'Hello! I\'m here to help you with your food delivery questions. You can ask about orders, refunds, tracking, or any other concerns.',
      'Welcome! I\'m your customer support assistant. How can I help you today?',
      'Hi there! I can help you with order issues, refunds, delivery questions, and more. What do you need assistance with?',
      'I\'m here to assist you with any food delivery related questions or concerns. What can I help you with?'
    ];
  }
}

export class MockConversationStore {
  private static conversations: ConversationMessage[] = [];
  private static sessions: UserSession[] = [];

  static async saveMessage(
    userId: string,
    sessionId: string,
    message: string,
    response: string,
    metadata?: Record<string, unknown>
  ): Promise<ConversationMessage | null> {
    const conversation: ConversationMessage = {
      id: `mock-${Date.now()}`,
      user_id: userId,
      session_id: sessionId,
      message,
      response,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.conversations.push(conversation);
    return conversation;
  }

  static async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    let filtered = this.conversations.filter(conv => conv.user_id === userId);
    
    if (sessionId) {
      filtered = filtered.filter(conv => conv.session_id === sessionId);
    }

    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  static async createOrUpdateSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, unknown>
  ): Promise<UserSession | null> {
    const existingSession = this.sessions.find(s => s.session_id === sessionId);
    
    if (existingSession) {
      existingSession.last_activity = new Date().toISOString();
      existingSession.metadata = { ...existingSession.metadata, ...metadata };
      return existingSession;
    }

    const session: UserSession = {
      id: `mock-session-${Date.now()}`,
      user_id: userId,
      session_id: sessionId,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      metadata,
    };

    this.sessions.push(session);
    return session;
  }

  static async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessions
      .filter(session => session.user_id === userId)
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
  }
}
