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

    console.log('🧪 Testing different authentication methods...');
    
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    const testBlob = new Blob(['test'], { type: 'audio/mpeg' });
    
    const authTests = [
      { name: 'Bearer token', headers: { 'Authorization': `Bearer ${API_KEY}` }, query: '' },
      { name: 'API Key header', headers: { 'X-API-Key': API_KEY }, query: '' },
      { name: 'Direct API Key', headers: { 'Authorization': API_KEY }, query: '' },
      { name: 'Alle AI Key', headers: { 'Alle-AI-Key': API_KEY }, query: '' },
      { name: 'API Key in query', headers: {}, query: `?api_key=${API_KEY}` },
    ];

    const results = [];

    for (const test of authTests) {
      const formData = new FormData();
      formData.append('audio_file', testBlob, 'test.mp3');  // Use 'audio_file' not 'file'
      formData.append('models[]', 'whisper-1');             // Use 'models[]' not 'model'

      const url = test.query ? `${testUrl}${test.query}` : testUrl;
      
      // Filter out undefined values from headers
      const cleanHeaders = Object.fromEntries(
        Object.entries(test.headers).filter(([, value]) => value !== undefined)
      );
      
      const response = await fetch(url, {
        method: 'POST',
        headers: cleanHeaders,
        body: formData,
      });

      const responseText = await response.text();
      
      results.push({
        method: test.name,
        status: response.status,
        response: responseText
      });

      console.log(`📊 ${test.name}: ${response.status} - ${responseText}`);
    }

    return NextResponse.json({ 
      success: true,
      results,
      message: 'Authentication test completed'
    });

  } catch (error) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
