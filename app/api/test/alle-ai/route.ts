import { NextResponse } from 'next/server';
import { AlleAITester } from '@/lib/api-tester';

export async function GET() {
  try {
    console.log('🧪 Starting API test...');
    
    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      const message = args.join(' ');
      logs.push(message);
      originalLog(message);
    };

    await AlleAITester.runFullTest();
    
    // Restore console.log
    console.log = originalLog;
    
    return NextResponse.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
