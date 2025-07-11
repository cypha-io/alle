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

    console.log('🧪 Testing audio format compatibility...');
    
    const testUrl = 'https://api.alle-ai.com/api/v1/audio/stt';
    
    // Test different audio formats
    const formatTests = [
      { name: 'WebM small', type: 'audio/webm', data: 'small webm data' },
      { name: 'MP4 small', type: 'audio/mp4', data: 'small mp4 data' },
      { name: 'WebM larger', type: 'audio/webm', data: new Array(100).fill('webm audio data ').join('') },
      { name: 'MP3 format', type: 'audio/mpeg', data: new Array(100).fill('mp3 audio data ').join('') },
    ];

    const results = [];

    for (const test of formatTests) {
      const testBlob = new Blob([test.data], { type: test.type });
      
      const formData = new FormData();
      formData.append('audio_file', testBlob, `test.${test.type.split('/')[1]}`);
      formData.append('models[]', 'whisper-1');

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
        },
        body: formData,
      });

      const responseText = await response.text();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = responseText;
      }

      // Extract transcription
      let transcriptionText = '';
      if (parsedResponse.responses && parsedResponse.responses.responses) {
        const modelResponses = parsedResponse.responses.responses;
        transcriptionText = modelResponses['whisper-1'] || Object.values(modelResponses)[0] || '';
      }
      
      results.push({
        format: test.name,
        status: response.status,
        transcription: transcriptionText,
        blobSize: testBlob.size,
        mimeType: test.type
      });

      console.log(`📊 ${test.name}: ${response.status} - "${transcriptionText}"`);
    }

    return NextResponse.json({ 
      success: true,
      results,
      message: 'Format compatibility test completed'
    });

  } catch (error) {
    console.error('❌ Format test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
}
