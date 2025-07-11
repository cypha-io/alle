// Alternative Alle AI service implementation
// Testing different API patterns for Alle AI

export interface AlleAIEndpointTest {
  endpoint: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class AlleAIEndpointDiscovery {
  private static readonly API_KEY = process.env.ALLE_AI_API_KEY;
  private static readonly BASE_URL = process.env.ALLE_AI_ENDPOINT;

  static async discoverWorkingEndpoints(): Promise<{ working: string[], tested: string[] }> {
    if (!this.API_KEY || !this.BASE_URL) {
      throw new Error('API credentials not configured');
    }

    // Common patterns for AI transcription APIs
    const endpointPatterns = [
      // OpenAI-style
      '/audio/transcriptions',
      '/v1/audio/transcriptions', 
      '/api/v1/audio/transcriptions',
      
      // Alternative patterns
      '/transcribe',
      '/transcription',
      '/speech-to-text',
      '/stt',
      '/audio/transcribe',
      '/audio/stt',
      '/whisper',
      '/asr',
      
      // Versioned patterns
      '/v1/transcribe',
      '/v1/transcription',
      '/v1/speech-to-text',
      '/v2/audio/transcriptions',
      
      // Chat completions (in case they use text-based transcription)
      '/chat/completions',
      '/v1/chat/completions',
      
      // Generic API patterns
      '/api/transcribe',
      '/api/transcription',
      '/api/audio',
      '/api/stt',
    ];

    const working: string[] = [];
    const tested: string[] = [];

    for (const pattern of endpointPatterns) {
      const fullUrl = `${this.BASE_URL}${pattern}`;
      tested.push(fullUrl);
      
      try {
        console.log(`🧪 Testing endpoint: ${fullUrl}`);
        
        // Test with a simple OPTIONS request first
        const optionsResponse = await fetch(fullUrl, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Origin': 'http://localhost:3000',
          },
          signal: AbortSignal.timeout(5000),
        });
        
        console.log(`OPTIONS ${fullUrl}: ${optionsResponse.status}`);
        
        // If OPTIONS works or returns method not allowed, try POST
        if (optionsResponse.status === 200 || optionsResponse.status === 405) {
          const postResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            signal: AbortSignal.timeout(5000),
          });
          
          console.log(`POST ${fullUrl}: ${postResponse.status}`);
          
          if (postResponse.status !== 404 && postResponse.status !== 401) {
            working.push(fullUrl);
            console.log(`✅ Potential working endpoint: ${fullUrl} (${postResponse.status})`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${fullUrl}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }

    return { working, tested };
  }

  static async testTranscriptionFormats(endpoint: string): Promise<unknown> {
    if (!this.API_KEY) return null;

    console.log(`🎵 Testing transcription formats for: ${endpoint}`);

    // Test different request formats
    const formats = [
      // OpenAI Whisper format
      {
        name: 'OpenAI Whisper Format',
        contentType: 'multipart/form-data',
        body: () => {
          const formData = new FormData();
          formData.append('file', new File(['test'], 'test.mp3', { type: 'audio/mp3' }));
          formData.append('model', 'whisper-1');
          return formData;
        }
      },
      
      // JSON format (for text-based APIs)
      {
        name: 'JSON Format',
        contentType: 'application/json',
        body: () => JSON.stringify({
          model: 'whisper-1',
          input: 'test audio data',
          task: 'transcribe'
        })
      },
      
      // Alternative JSON format
      {
        name: 'Alternative JSON',
        contentType: 'application/json', 
        body: () => JSON.stringify({
          audio: 'base64-encoded-audio-data',
          language: 'en',
          format: 'mp3'
        })
      }
    ];

    const results = [];

    for (const format of formats) {
      try {
        console.log(`  📝 Testing: ${format.name}`);
        
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${this.API_KEY}`,
        };
        
        if (format.contentType !== 'multipart/form-data') {
          headers['Content-Type'] = format.contentType;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: format.body(),
          signal: AbortSignal.timeout(10000),
        });

        const responseText = await response.text();
        
        results.push({
          format: format.name,
          status: response.status,
          statusText: response.statusText,
          response: responseText.substring(0, 500) // Truncate for logging
        });

        console.log(`  📊 ${format.name}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        results.push({
          format: format.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${format.name}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    return results;
  }
}
