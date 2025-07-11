import { NextResponse } from 'next/server';
import { AlleAIEndpointDiscovery } from '@/lib/endpoint-discovery';

export async function GET() {
  try {
    console.log('🔍 Starting endpoint discovery for Alle AI...');
    
    const discovery = await AlleAIEndpointDiscovery.discoverWorkingEndpoints();
    
    console.log(`📊 Discovery complete: ${discovery.working.length} working, ${discovery.tested.length} tested`);
    
    // Test formats on working endpoints
    const formatTests = [];
    for (const workingEndpoint of discovery.working.slice(0, 3)) { // Test first 3 working endpoints
      console.log(`🧪 Testing formats for: ${workingEndpoint}`);
      const formats = await AlleAIEndpointDiscovery.testTranscriptionFormats(workingEndpoint);
      formatTests.push({
        endpoint: workingEndpoint,
        formats
      });
    }
    
    return NextResponse.json({
      success: true,
      discovery: {
        working: discovery.working,
        tested: discovery.tested.length,
        formatTests
      },
      recommendations: discovery.working.length > 0 ? 
        `Try using: ${discovery.working[0]}` : 
        'No working endpoints found. Check API documentation.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Discovery Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
