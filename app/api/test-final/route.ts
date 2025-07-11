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

    console.log('🧪 Testing complete transcription flow...');
    
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    
    // Create a small test audio file (you could use a real audio file here)
    const testBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });
    
    const formData = new FormData();
    formData.append('audio_file', testBlob, 'test.mp3');
    formData.append('models', JSON.stringify(['whisper-1']));

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'User-Agent': 'AI-Notetaker/1.0',
      },
      body: formData,
    });

    console.log(`📊 Transcription test: ${response.status}`);
    
    const responseText = await response.text();
    console.log('📝 Response:', responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = responseText;
    }

    return NextResponse.json({ 
      success: response.ok,
      status: response.status,
      response: parsedResponse,
      message: response.ok ? 'Transcription API is working!' : 'API error - check response'
    });

  } catch (error) {
    console.error('❌ Transcription test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
