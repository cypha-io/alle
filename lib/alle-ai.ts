export interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  language?: string;
  duration?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface AlleAIError {
  code: string;
  message?: string;
  details?: unknown;
  error?: {
    code: number;
    message: string;
  };
  errors?: {
    audio_file?: string[];
  };
}

export class AlleAIService {
  private static readonly API_KEY = process.env.ALLE_AI_API_KEY;
  private static readonly ENDPOINT = process.env.ALLE_AI_ENDPOINT || 'https://api.alle-ai.com';
  private static readonly VERSION = process.env.ALLE_AI_VERSION || 'v1';
  private static readonly TIMEOUT = parseInt(process.env.ALLE_AI_TIMEOUT || '30000');
  
  static async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
    if (!this.API_KEY) {
      throw new Error('ALLE_AI_API_KEY environment variable is not set');
    }

    if (!this.ENDPOINT) {
      throw new Error('ALLE_AI_ENDPOINT environment variable is not set');
    }

    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('models[]', 'whisper-1');
      
      const language = process.env.ALLE_AI_LANGUAGE;
      if (language && language !== 'auto') {
        formData.append('language', language);
      }
      
      formData.append('response_format', 'verbose_json');

      console.log(`🧠 Sending audio to Alle AI: ${audioFile.name} (${audioFile.size} bytes)`);

      const response = await fetch(`${this.ENDPOINT}/audio/stt`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.API_KEY,
          'User-Agent': 'AI-Notetaker/1.0',
        },
        body: formData,
        signal: AbortSignal.timeout(this.TIMEOUT),
      });

      console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alle AI API Error Response:', errorText);
        
        let errorData: AlleAIError;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            code: `HTTP_${response.status}`,
            message: `API request failed: ${response.status} ${response.statusText}`,
            details: errorText
          };
        }

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your ALLE_AI_API_KEY.');
        } else if (response.status === 402) {
          throw new Error('Insufficient API credits. Please top up your Alle AI account to continue.');
        } else if (response.status === 413) {
          throw new Error('File too large. Please try with a smaller audio file.');
        } else if (response.status === 415) {
          throw new Error('Unsupported audio format. Please use MP3, WAV, M4A, MP4, or WebM.');
        } else if (response.status === 422) {
          throw new Error('Audio file upload failed. The file may be corrupted or in an unsupported format.');
        }

        const errorMessage = errorData.message || 
                            errorData.error?.message || 
                            errorData.errors?.audio_file?.[0] || 
                            'Unknown error';
        
        throw new Error(`Alle AI API error: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Alle AI transcription completed successfully');
      
      let transcriptionText = '';
      if (result.responses && result.responses.responses) {
        const modelResponses = result.responses.responses;
        transcriptionText = modelResponses['whisper-1'] || Object.values(modelResponses)[0] || '';
      } else if (result.text) {
        transcriptionText = result.text;
      }
      
      if (transcriptionText === 'an error occurred') {
        console.log('⚠️ Whisper returned error - likely due to short/silent audio or format issues');
        transcriptionText = '';
      }
      
      console.log('📊 Transcription result:', {
        length: transcriptionText?.length || 0,
        text: transcriptionText?.substring(0, 100) + (transcriptionText?.length > 100 ? '...' : ''),
        language: result.language,
        duration: result.duration
      });

      return {
        transcription: transcriptionText || '',
        confidence: this.calculateAverageConfidence(result.segments),
        language: result.language || 'unknown',
        duration: result.duration || 0,
        words: result.words || []
      };

    } catch (error) {
      console.error('❌ Alle AI service error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: Alle AI took too long to respond');
        }
        throw error;
      }
      
      throw new Error('Unexpected error occurred while processing audio');
    }
  }

  // Alternative method for file-based uploads (if needed)
  static async transcribeAudioFile(filePath: string, originalName: string): Promise<TranscriptionResult> {
    if (!this.API_KEY) {
      throw new Error('ALLE_AI_API_KEY environment variable is not set');
    }

    try {
      const { FormData } = await import('formdata-node');
      const { fileFromPath } = await import('formdata-node/file-from-path');

      console.log(`🧠 Sending file to Alle AI: ${originalName}`);

      // Create form data with file stream
      const formData = new FormData();
      const file = await fileFromPath(filePath, originalName);
      formData.append('audio_file', file);
      formData.append('models[]', 'whisper-1');
      formData.append('language', process.env.ALLE_AI_LANGUAGE || 'auto');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'word');

      // Make API request
      const response = await fetch(`${this.ENDPOINT}/audio/stt`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.API_KEY,
          'User-Agent': 'AI-Notetaker/1.0',
        },
        body: formData as unknown as BodyInit,
        signal: AbortSignal.timeout(this.TIMEOUT),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alle AI API error:', errorText);
        throw new Error(`Alle AI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Alle AI transcription completed successfully');

      return {
        transcription: result.text || '',
        confidence: this.calculateAverageConfidence(result.words),
        language: result.language || 'unknown',
        duration: result.duration || 0,
        words: result.words || []
      };

    } catch (error) {
      console.error('❌ Alle AI file service error:', error);
      throw error;
    }
  }

  // Helper method to calculate average confidence from segments or words
  private static calculateAverageConfidence(segments?: Array<{ avg_logprob?: number; no_speech_prob?: number }>): number {
    if (!segments || segments.length === 0) return 0.85; // Default confidence if no data
    
    // Convert log probabilities to confidence scores
    const confidenceScores = segments.map(segment => {
      if (segment.avg_logprob !== undefined) {
        // Convert log probability to confidence (0-1 range)
        return Math.exp(segment.avg_logprob);
      }
      if (segment.no_speech_prob !== undefined) {
        // Invert no_speech_prob to get speech confidence
        return 1 - segment.no_speech_prob;
      }
      return 0.85; // Default if no confidence data
    });
    
    const totalConfidence = confidenceScores.reduce((sum, conf) => sum + conf, 0);
    return Math.min(totalConfidence / confidenceScores.length, 1.0); // Cap at 1.0
  }

  // Method to check API connection and credentials
  static async testConnection(): Promise<boolean> {
    if (!this.API_KEY || !this.ENDPOINT) {
      return false;
    }

    try {
      // Test with a simple models endpoint or health check
      const response = await fetch(`${this.ENDPOINT}/models`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
          'User-Agent': 'AI-Notetaker/1.0',
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log(`🔍 API Connection Test: ${response.status} ${response.statusText}`);
      
      // Consider 200, 404 (endpoint doesn't exist but auth works), or 403 as "connected"
      // 401 means auth failed, others might be network issues
      return response.status !== 401;
      
    } catch (error) {
      console.error('🔍 API Connection Test Failed:', error);
      return false;
    }
  }
}
