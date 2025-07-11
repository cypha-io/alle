import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.ALLE_AI_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json({ 
        error: 'API key not configured',
        success: false 
      });
    }

    console.log('🧪 Testing Alle AI audio/stt endpoint...');
    
    // Test the endpoint we discovered
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    
    // First test with OPTIONS to verify the endpoint exists
    const optionsResponse = await fetch(testUrl, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });

    console.log(`📊 OPTIONS ${testUrl}: ${optionsResponse.status}`);

    // Now test with a minimal POST request
    const formData = new FormData();
    
    // Create a minimal test audio file (empty blob)
    const testBlob = new Blob(['test'], { type: 'audio/mpeg' });
    formData.append('file', testBlob, 'test.mp3');
    formData.append('model', 'whisper-1');

    const postResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    console.log(`📊 POST ${testUrl}: ${postResponse.status}`);
    
    const responseText = await postResponse.text();
    console.log('📝 Response:', responseText);

    return NextResponse.json({ 
      success: true,
      endpoint: testUrl,
      optionsStatus: optionsResponse.status,
      postStatus: postResponse.status,
      response: responseText,
      message: 'Test completed - check console for details'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
