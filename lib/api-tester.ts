import { AlleAIService } from './alle-ai';

// Test utility to help debug and validate Alle AI API integration
export class AlleAITester {
  
  static async testEndpoints(): Promise<void> {
    const apiKey = process.env.ALLE_AI_API_KEY;
    const baseEndpoint = process.env.ALLE_AI_ENDPOINT;
    
    if (!apiKey || !baseEndpoint) {
      console.log('❌ Missing API credentials');
      return;
    }

    console.log('🔍 Testing Alle AI API endpoints...');
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`🌐 Base URL: ${baseEndpoint}`);

    // Test various endpoint possibilities
    const endpointsToTest = [
      `${baseEndpoint}/models`,
      `${baseEndpoint}/audio/transcriptions`,
      `${baseEndpoint}/v1/models`,
      `${baseEndpoint}/v1/audio/transcriptions`,
      `${baseEndpoint}/api/v1/models`,
      `${baseEndpoint}/api/v1/audio/transcriptions`,
    ];

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`\n🧪 Testing: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'AI-Notetaker-Test/1.0',
          },
          signal: AbortSignal.timeout(5000),
        });

        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
          const text = await response.text();
          console.log(`✅ Success! Response length: ${text.length} chars`);
        } else if (response.status === 401) {
          console.log(`🔐 Unauthorized - API key might be invalid`);
        } else if (response.status === 404) {
          console.log(`🚫 Not Found - endpoint doesn't exist`);
        } else {
          const text = await response.text();
          console.log(`⚠️  Other response: ${text.substring(0, 200)}`);
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
  }

  static async testWithSmallFile(): Promise<void> {
    console.log('\n🎵 Creating small test audio file...');
    
    try {
      // Create a minimal audio file for testing (if possible in browser environment)
      const testFile = new File(['fake audio data'], 'test.mp3', { type: 'audio/mp3' });
      
      console.log(`📁 Test file: ${testFile.name} (${testFile.size} bytes)`);
      
      const result = await AlleAIService.transcribeAudio(testFile);
      console.log('✅ Transcription test successful!');
      console.log('📝 Result:', result);
      
    } catch (error) {
      console.log('❌ Transcription test failed:', error instanceof Error ? error.message : 'Unknown');
    }
  }

  static async runFullTest(): Promise<void> {
    console.log('🚀 Starting comprehensive Alle AI test...\n');
    
    await this.testEndpoints();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Connection Test Results:');
    
    const connectionTest = await AlleAIService.testConnection();
    console.log(`API Connection: ${connectionTest ? '✅ Success' : '❌ Failed'}`);
    
    if (connectionTest) {
      console.log('\n🎉 API appears to be configured correctly!');
      console.log('💡 Try uploading an audio file in the app.');
    } else {
      console.log('\n⚠️  API connection failed. Check:');
      console.log('   1. API key is correct');
      console.log('   2. Endpoint URL is correct');
      console.log('   3. Network connectivity');
    }
  }
}
