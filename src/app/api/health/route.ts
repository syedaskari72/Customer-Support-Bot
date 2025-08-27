import { NextResponse } from 'next/server';
import { EnvironmentValidator } from '@/lib/env-validation';
import { supabaseAdmin } from '@/lib/supabase';
import { getAIProvider } from '@/lib/ai-providers';

export async function GET() {
  const checks = {
    environment: false,
    database: false,
    aiProvider: false,
    overall: false,
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check environment configuration
    try {
      EnvironmentValidator.getConfig();
      checks.environment = true;
    } catch (error) {
      errors.push(`Environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check database connection and tables
    try {
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('table')) {
          errors.push(`Database: Tables not found. Please run the SQL schema in Supabase SQL Editor.`);
        } else {
          errors.push(`Database: ${error.message}`);
        }
      } else {
        // Also check conversations table
        const { error: convError } = await supabaseAdmin
          .from('conversations')
          .select('count')
          .limit(1);

        if (convError) {
          if (convError.code === 'PGRST205' || convError.message.includes('table')) {
            errors.push(`Database: Conversations table not found. Please run the SQL schema.`);
          } else {
            errors.push(`Database: ${convError.message}`);
          }
        } else {
          checks.database = true;
        }
      }
    } catch (error) {
      errors.push(`Database: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }

    // Check AI provider
    try {
      getAIProvider();
      checks.aiProvider = true;
    } catch (error) {
      errors.push(`AI Provider: ${error instanceof Error ? error.message : 'Configuration failed'}`);
    }

    // Overall health
    checks.overall = checks.environment && checks.database && checks.aiProvider;

    const status = checks.overall ? 200 : 503;
    
    return NextResponse.json({
      status: checks.overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      setupInstructions: !checks.overall ? EnvironmentValidator.generateSetupInstructions() : undefined,
    }, { status });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks,
      errors: [`System: ${error instanceof Error ? error.message : 'Unknown system error'}`],
      setupInstructions: EnvironmentValidator.generateSetupInstructions(),
    }, { status: 500 });
  }
}
