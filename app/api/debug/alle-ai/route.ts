import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ALLE_AI_API_KEY;
  const endpoint = process.env.ALLE_AI_ENDPOINT;
  
  if (!apiKey || !endpoint) {
    return NextResponse.json({
      error: 'API credentials not configured',
      apiKey: apiKey ? 'Set' : 'Missing',
      endpoint: endpoint || 'Missing'
    });
  }

  const tests = [];

  // Test 1: Original chat completions endpoint
  try {
    console.log('🧪 Testing chat completions...');
    const chatResponse = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Notetaker/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello, can you help with audio transcription?' }],
        max_tokens: 50
      }),
      signal: AbortSignal.timeout(10000)
    });

    const chatText = await chatResponse.text();
    tests.push({
      name: 'Chat Completions',
      url: `${endpoint}/chat/completions`,
      status: chatResponse.status,
      statusText: chatResponse.statusText,
      response: chatText.substring(0, 500),
      headers: Object.fromEntries(chatResponse.headers.entries())
    });

  } catch (error) {
    tests.push({
      name: 'Chat Completions',
      url: `${endpoint}/chat/completions`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Try different base URLs
  const alternativeUrls = [
    'https://api.alle-ai.com',
    'https://api.alle-ai.com/v1',
    'https://api.alle-ai.com/api',
    'https://alle-ai.com/api',
    'https://alle-ai.com/api/v1'
  ];

  for (const baseUrl of alternativeUrls) {
    try {
      console.log(`🧪 Testing base URL: ${baseUrl}`);
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', 
          messages: [{ role: 'user', content: 'test' }]
        }),
        signal: AbortSignal.timeout(5000)
      });

      const text = await response.text();
      tests.push({
        name: `Alternative URL: ${baseUrl}`,
        status: response.status,
        response: text.substring(0, 200)
      });

    } catch (error) {
      tests.push({
        name: `Alternative URL: ${baseUrl}`,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // Test 3: Basic connectivity
  try {
    console.log('🌐 Testing basic connectivity...');
    const connectTest = await fetch('https://api.alle-ai.com', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    tests.push({
      name: 'Basic Connectivity',
      url: 'https://api.alle-ai.com',
      status: connectTest.status,
      accessible: true
    });

  } catch (error) {
    tests.push({
      name: 'Basic Connectivity',
      url: 'https://api.alle-ai.com',
      error: error instanceof Error ? error.message : 'Unknown',
      accessible: false
    });
  }

  return NextResponse.json({
    tests,
    apiKeyProvided: Boolean(apiKey),
    apiKeyPrefix: apiKey?.substring(0, 10),
    endpointProvided: Boolean(endpoint),
    endpoint: endpoint,
    timestamp: new Date().toISOString()
  });
}
