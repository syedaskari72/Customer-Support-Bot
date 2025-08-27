import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { FAQMatcher } from './faq-knowledge-base';
import { EnvironmentValidator } from './env-validation';

// AI Provider interface
export interface AIProvider {
  generateResponse(prompt: string, conversationHistory?: string): Promise<string>;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    const config = EnvironmentValidator.getConfig();
    this.client = new OpenAI({
      apiKey: config.ai.openaiKey,
    });
  }

  async generateResponse(prompt: string, conversationHistory?: string): Promise<string> {
    try {
      // Find relevant FAQs
      const relevantFAQs = FAQMatcher.findRelevantFAQs(prompt);
      const faqContext = FAQMatcher.generateFAQContext(relevantFAQs);

      const systemPrompt = this.getSystemPrompt();
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt }
      ];

      if (conversationHistory) {
        messages.push({ role: 'assistant', content: `Previous conversation context: ${conversationHistory}` });
      }

      if (faqContext) {
        messages.push({ role: 'assistant', content: faqContext });
      }

      messages.push({ role: 'user', content: prompt });

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from OpenAI');
    }
  }

  private getSystemPrompt(): string {
    return `You are a helpful customer support assistant for a food delivery service. You should:

1. Be friendly, empathetic, and professional
2. Respond only in English
3. Remember previous conversations with the same user
4. Provide helpful solutions for common food delivery issues
5. Escalate complex issues when necessary

Common issues you can help with:
- Order delays and tracking
- Refunds and cancellations
- Menu questions
- Delivery address changes
- Payment issues
- Restaurant availability

If you remember previous conversations with this user, acknowledge them naturally and build upon that context.

Always respond in clear, professional English.`;
  }
}

// Anthropic Provider
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    const config = EnvironmentValidator.getConfig();
    this.client = new Anthropic({
      apiKey: config.ai.anthropicKey,
    });
  }

  async generateResponse(prompt: string, conversationHistory?: string): Promise<string> {
    try {
      // Find relevant FAQs
      const relevantFAQs = FAQMatcher.findRelevantFAQs(prompt);
      const faqContext = FAQMatcher.generateFAQContext(relevantFAQs);

      const systemPrompt = this.getSystemPrompt();
      let fullPrompt = systemPrompt + '\n\n';

      if (conversationHistory) {
        fullPrompt += `Previous conversation context: ${conversationHistory}\n\n`;
      }

      if (faqContext) {
        fullPrompt += faqContext + '\n\n';
      }

      fullPrompt += `User message: ${prompt}`;

      const message = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: fullPrompt }],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate response from Anthropic');
    }
  }

  private getSystemPrompt(): string {
    return `You are a helpful customer support assistant for a food delivery service. You should:

1. Be friendly, empathetic, and professional
2. Respond only in English
3. Remember previous conversations with the same user
4. Provide helpful solutions for common food delivery issues
5. Escalate complex issues when necessary

Common issues you can help with:
- Order delays and tracking
- Refunds and cancellations
- Menu questions
- Delivery address changes
- Payment issues
- Restaurant availability

If you remember previous conversations with this user, acknowledge them naturally and build upon that context.

Always respond in clear, professional English.`;
  }
}

// Factory function to get the appropriate AI provider
export function getAIProvider(): AIProvider {
  try {
    const config = EnvironmentValidator.getConfig();

    switch (config.ai.provider.toLowerCase()) {
      case 'anthropic':
        if (!config.ai.anthropicKey) {
          throw new Error('Anthropic API key is not configured');
        }
        return new AnthropicProvider();
      case 'openai':
      default:
        if (!config.ai.openaiKey) {
          throw new Error('OpenAI API key is not configured');
        }
        return new OpenAIProvider();
    }
  } catch (error) {
    console.error('❌ AI Provider Configuration Error:', error);
    throw error;
  }
}
