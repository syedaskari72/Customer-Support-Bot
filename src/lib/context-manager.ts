import { ConversationStore, ConversationMessage } from './supabase';

export interface ConversationContext {
  recentMessages: ConversationMessage[];
  userProfile: UserProfile;
  conversationSummary: string;
  relevantHistory: ConversationMessage[];
}

export interface UserProfile {
  userId: string;
  preferredLanguage?: string;
  commonIssues: string[];
  lastOrderDate?: string;
  totalConversations: number;
}

export class ContextManager {
  /**
   * Build comprehensive context for AI conversation
   */
  static async buildContext(
    userId: string,
    sessionId: string,
    currentMessage: string
  ): Promise<ConversationContext> {
    try {
      // Get recent conversation history
      const recentMessages = await ConversationStore.getConversationHistory(
        userId,
        sessionId,
        10
      );

      // Get broader user history for pattern recognition
      const userHistory = await ConversationStore.getConversationHistory(
        userId,
        undefined,
        50
      );

    // Build user profile
    const userProfile = this.buildUserProfile(userId, userHistory);

    // Find relevant historical conversations
    const relevantHistory = this.findRelevantHistory(currentMessage, userHistory);

    // Generate conversation summary
    const conversationSummary = this.generateConversationSummary(recentMessages);

      return {
        recentMessages,
        userProfile,
        conversationSummary,
        relevantHistory,
      };
    } catch (error) {
      console.error('Error building context, returning empty context:', error);

      // Return empty context if database fails
      return {
        recentMessages: [],
        userProfile: {
          userId,
          totalConversations: 0,
          commonIssues: [],
        },
        conversationSummary: 'This is a new conversation.',
        relevantHistory: [],
      };
    }
  }

  /**
   * Build user profile from conversation history
   */
  private static buildUserProfile(
    userId: string,
    history: ConversationMessage[]
  ): UserProfile {
    const languages = new Map<string, number>();
    const issues = new Map<string, number>();
    let lastOrderDate: string | undefined;

    history.forEach(conv => {
      // Track language preferences
      if (conv.metadata?.language) {
        languages.set(
          conv.metadata.language,
          (languages.get(conv.metadata.language) || 0) + 1
        );
      }

      // Track common issues
      if (conv.metadata?.intent) {
        issues.set(
          conv.metadata.intent,
          (issues.get(conv.metadata.intent) || 0) + 1
        );
      }

      // Find mentions of recent orders
      if (conv.message.toLowerCase().includes('order') && 
          conv.message.toLowerCase().includes('today')) {
        lastOrderDate = conv.timestamp;
      }
    });

    // Get most common language
    const preferredLanguage = Array.from(languages.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Get top 3 common issues
    const commonIssues = Array.from(issues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      userId,
      preferredLanguage,
      commonIssues,
      lastOrderDate,
      totalConversations: history.length,
    };
  }

  /**
   * Find historically relevant conversations based on current message
   */
  private static findRelevantHistory(
    currentMessage: string,
    history: ConversationMessage[]
  ): ConversationMessage[] {
    const keywords = this.extractKeywords(currentMessage);
    const relevantConversations: Array<{ conv: ConversationMessage; score: number }> = [];

    history.forEach(conv => {
      let score = 0;

      // Check for keyword matches in message and response
      keywords.forEach(keyword => {
        if (conv.message.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        }
        if (conv.response.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      // Boost score for same intent
      const currentIntent = this.detectIntent(currentMessage);
      if (conv.metadata?.intent === currentIntent) {
        score += 3;
      }

      // Boost score for recent conversations
      const daysSince = (Date.now() - new Date(conv.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        score += 2;
      } else if (daysSince < 30) {
        score += 1;
      }

      if (score > 0) {
        relevantConversations.push({ conv, score });
      }
    });

    // Return top 3 most relevant conversations
    return relevantConversations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.conv);
  }

  /**
   * Extract keywords from message
   */
  private static extractKeywords(message: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its',
      'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Detect intent from message
   */
  private static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
      return 'refund_request';
    }
    if (lowerMessage.includes('cancel')) {
      return 'cancellation';
    }
    if (lowerMessage.includes('late') || lowerMessage.includes('delay')) {
      return 'delivery_delay';
    }
    if (lowerMessage.includes('track') || lowerMessage.includes('where')) {
      return 'order_tracking';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'general_help';
    }

    return 'general_inquiry';
  }

  /**
   * Generate a summary of recent conversation
   */
  private static generateConversationSummary(messages: ConversationMessage[]): string {
    if (messages.length === 0) {
      return 'This is a new conversation.';
    }

    const recentMessages = messages.slice(-5); // Last 5 messages
    const issues = new Set<string>();
    const topics = new Set<string>();

    recentMessages.forEach(msg => {
      if (msg.metadata?.intent) {
        issues.add(msg.metadata.intent);
      }

      // Extract topics from messages
      const keywords = this.extractKeywords(msg.message);
      keywords.slice(0, 3).forEach(keyword => topics.add(keyword));
    });

    let summary = `Recent conversation context: `;
    
    if (issues.size > 0) {
      summary += `User has discussed: ${Array.from(issues).join(', ')}. `;
    }
    
    if (topics.size > 0) {
      summary += `Key topics mentioned: ${Array.from(topics).join(', ')}. `;
    }

    summary += `Total messages in this session: ${messages.length}.`;

    return summary;
  }

  /**
   * Format context for AI prompt
   */
  static formatContextForAI(context: ConversationContext): string {
    let prompt = '';

    // User profile information
    if (context.userProfile.totalConversations > 0) {
      prompt += `User Profile: This user has had ${context.userProfile.totalConversations} previous conversations. `;
      
      if (context.userProfile.preferredLanguage) {
        prompt += `Preferred language: ${context.userProfile.preferredLanguage}. `;
      }
      
      if (context.userProfile.commonIssues.length > 0) {
        prompt += `Common issues: ${context.userProfile.commonIssues.join(', ')}. `;
      }
    }

    // Conversation summary
    if (context.conversationSummary) {
      prompt += `\n\n${context.conversationSummary}`;
    }

    // Relevant historical context
    if (context.relevantHistory.length > 0) {
      prompt += `\n\nRelevant past conversations:\n`;
      context.relevantHistory.forEach((conv, index) => {
        prompt += `${index + 1}. User: "${conv.message}" → Assistant: "${conv.response}"\n`;
      });
    }

    // Recent conversation
    if (context.recentMessages.length > 0) {
      prompt += `\n\nRecent conversation in this session:\n`;
      context.recentMessages.reverse().forEach((conv, index) => {
        prompt += `${index + 1}. User: "${conv.message}" → Assistant: "${conv.response}"\n`;
      });
    }

    return prompt;
  }
}
