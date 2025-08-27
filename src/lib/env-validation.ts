/**
 * Environment variable validation and configuration
 */

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  ai: {
    provider: 'openai' | 'anthropic';
    openaiKey?: string;
    anthropicKey?: string;
  };
  app: {
    url: string;
    memoryProvider: string;
  };
}

export class EnvironmentValidator {
  private static instance: EnvironmentConfig | null = null;

  static validate(): EnvironmentConfig {
    if (this.instance) {
      return this.instance;
    }

    const errors: string[] = [];
    
    // Validate Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here')) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured. Please set a valid Supabase project URL.');
    }

    if (!supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please set a valid Supabase anonymous key.');
    }

    if (!supabaseServiceKey || supabaseServiceKey.includes('your_supabase_service_role_key_here')) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is not configured. Please set a valid Supabase service role key.');
    }

    // Validate AI provider configuration
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (aiProvider === 'openai') {
      if (!openaiKey || openaiKey.includes('your_openai_api_key_here')) {
        errors.push('OPENAI_API_KEY is not configured. Please set a valid OpenAI API key or switch to Anthropic.');
      }
    } else if (aiProvider === 'anthropic') {
      if (!anthropicKey || anthropicKey.includes('your_anthropic_api_key_here')) {
        errors.push('ANTHROPIC_API_KEY is not configured. Please set a valid Anthropic API key or switch to OpenAI.');
      }
    } else {
      errors.push('AI_PROVIDER must be either "openai" or "anthropic".');
    }

    // Validate app configuration
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const memoryProvider = process.env.MEMORY_PROVIDER || 'supabase';

    if (errors.length > 0) {
      throw new Error(`Environment configuration errors:\n${errors.map(e => `- ${e}`).join('\n')}`);
    }

    this.instance = {
      supabase: {
        url: supabaseUrl!,
        anonKey: supabaseAnonKey!,
        serviceKey: supabaseServiceKey!,
      },
      ai: {
        provider: aiProvider as 'openai' | 'anthropic',
        openaiKey,
        anthropicKey,
      },
      app: {
        url: appUrl,
        memoryProvider,
      },
    };

    return this.instance;
  }

  static getConfig(): EnvironmentConfig {
    if (!this.instance) {
      return this.validate();
    }
    return this.instance;
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static generateSetupInstructions(): string {
    return `
🔧 SETUP INSTRUCTIONS:

1. **Supabase Setup:**
   - Go to https://supabase.com and create a new project
   - Copy your project URL and API keys
   - Run the SQL schema from 'supabase-schema.sql' in your Supabase SQL editor

2. **AI Provider Setup (choose one):**
   
   **Option A - OpenAI:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Set AI_PROVIDER=openai in your .env.local
   
   **Option B - Anthropic:**
   - Go to https://console.anthropic.com
   - Create a new API key
   - Set AI_PROVIDER=anthropic in your .env.local

3. **Update your .env.local file:**
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # AI Provider (choose one)
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your_openai_key_here
   # OR
   # AI_PROVIDER=anthropic
   # ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
   
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MEMORY_PROVIDER=supabase

4. **Restart the development server:**
   npm run dev
`;
  }
}
