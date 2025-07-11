import { NextResponse } from 'next/server';
import { AlleAIService } from '@/lib/alle-ai';

export async function GET() {
  try {
    const apiKey = process.env.ALLE_AI_API_KEY;
    const endpoint = process.env.ALLE_AI_ENDPOINT;
    
    if (!apiKey) {
      return NextResponse.json({
        connected: false,
        configured: false,
        error: 'ALLE_AI_API_KEY environment variable is not set'
      });
    }

    if (!endpoint) {
      return NextResponse.json({
        connected: false,
        configured: false,
        error: 'ALLE_AI_ENDPOINT environment variable is not set'
      });
    }

    // Test the connection
    const isConnected = await AlleAIService.testConnection();
    
    return NextResponse.json({
      connected: isConnected,
      configured: true,
      endpoint: endpoint,
      ...(isConnected ? {} : { error: 'Unable to connect to Alle AI API. Please check your credentials.' })
    });

  } catch (error) {
    return NextResponse.json({
      connected: false,
      configured: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
}
