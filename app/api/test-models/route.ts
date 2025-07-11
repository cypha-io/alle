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

    console.log('🧪 Testing different models formats...');
    
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    const testBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });
    
    const modelsTests = [
      { name: 'JSON string array', value: JSON.stringify(['whisper-1']) },
      { name: 'Simple string', value: 'whisper-1' },
      { name: 'Multiple form fields', value: 'whisper-1', multiple: true },
      { name: 'JSON without array', value: 'whisper-1' },
    ];

    const results = [];

    for (const test of modelsTests) {
      const formData = new FormData();
      formData.append('audio_file', testBlob, 'test.mp3');
      
      if (test.multiple) {
        formData.append('models[]', 'whisper-1');
      } else {
        formData.append('models', test.value);
      }

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
        },
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
      message: 'Models format test completed'
    });

  } catch (error) {
    console.error('❌ Models test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
