import { createClient } from '@supabase/supabase-js';
import { EnvironmentValidator } from './env-validation';

// Validate environment configuration
let config: ReturnType<typeof EnvironmentValidator.getConfig>;
let supabase: ReturnType<typeof createClient>;
let supabaseAdmin: ReturnType<typeof createClient>;

try {
  config = EnvironmentValidator.getConfig();

  // Client for browser/frontend operations
  supabase = createClient(config.supabase.url, config.supabase.anonKey);

  // Admin client for server-side operations
  supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey);
} catch (error) {
  console.error('❌ Supabase Configuration Error:', error);

  if (EnvironmentValidator.isDevelopment()) {
    console.log(EnvironmentValidator.generateSetupInstructions());
  }

  // Create dummy clients to prevent import errors
  supabase = createClient('https://dummy.supabase.co', 'dummy-key');
  supabaseAdmin = createClient('https://dummy.supabase.co', 'dummy-key');
}

export { supabase, supabaseAdmin };

// Database types
export interface ConversationMessage {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  response: string;
  timestamp: string;
  metadata?: {
    language?: string;
    intent?: string;
    sentiment?: string;
  };
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
  metadata?: {
    user_agent?: string;
    ip_address?: string;
  };
}

// Database operations
export class ConversationStore {
  static async saveMessage(
    userId: string,
    sessionId: string,
    message: string,
    response: string,
    metadata?: Record<string, unknown>
  ): Promise<ConversationMessage | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabaseAdmin as any)
        .from('conversations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          message,
          response,
          metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving conversation:', error);
        return null;
      }

      return data as ConversationMessage;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  static async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabaseAdmin as any)
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversation history:', error);

        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.message.includes('table')) {
          console.error('❌ Database tables not found. Please run the SQL schema in Supabase.');
        }

        return [];
      }

      return (data as ConversationMessage[]) || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  static async createOrUpdateSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, unknown>
  ): Promise<UserSession | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabaseAdmin as any)
        .from('user_sessions')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating session:', error);
        return null;
      }

      return data as UserSession;
    } catch (error) {
      console.error('Error creating/updating session:', error);
      return null;
    }
  }

  static async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabaseAdmin as any)
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions:', error);
        return [];
      }

      return (data as UserSession[]) || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }
}
