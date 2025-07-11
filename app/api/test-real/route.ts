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

    console.log('🧪 Testing with real audio content simulation...');
    
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    
    // Create a slightly larger test blob to simulate real audio
    const audioData = new Array(1000).fill('audio data ').join('');
    const testBlob = new Blob([audioData], { type: 'audio/mpeg' });
    
    const formData = new FormData();
    formData.append('audio_file', testBlob, 'test-real.mp3');
    formData.append('models[]', 'whisper-1');

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'User-Agent': 'AI-Notetaker/1.0',
      },
      body: formData,
    });

    console.log(`📊 Real content test: ${response.status}`);
    
    const responseText = await response.text();
    console.log('📝 Full response:', responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = responseText;
    }

    // Extract transcription like our updated service does
    let transcriptionText = '';
    if (parsedResponse.responses && parsedResponse.responses.responses) {
      const modelResponses = parsedResponse.responses.responses;
      transcriptionText = modelResponses['whisper-1'] || Object.values(modelResponses)[0] || '';
    }

    return NextResponse.json({ 
      success: response.ok,
      status: response.status,
      response: parsedResponse,
      extractedTranscription: transcriptionText,
      message: response.ok ? `🎉 Transcription: "${transcriptionText}"` : 'API error - check response'
    });

  } catch (error) {
    console.error('❌ Real content test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
