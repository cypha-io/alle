import { NextRequest, NextResponse } from 'next/server';
import { AlleAIService } from '@/lib/alle-ai';

export async function POST(request: NextRequest) {
  try {
    // Check if API is properly configured
    const apiKey = process.env.ALLE_AI_API_KEY;
    const endpoint = process.env.ALLE_AI_ENDPOINT;
    
    if (!apiKey || !endpoint) {
      return NextResponse.json({ 
        error: 'Alle AI API is not configured. Please set ALLE_AI_API_KEY and ALLE_AI_ENDPOINT environment variables.' 
      }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('audio') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '50') * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    const supportedFormats = (process.env.SUPPORTED_FORMATS || 'mp3,wav,m4a,mp4,webm').split(',');
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypeParts = file.type.split('/');
    const mimeSubtype = mimeTypeParts[1]?.toLowerCase();
    
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      if (!mimeSubtype || !supportedFormats.includes(mimeSubtype)) {
        return NextResponse.json({ 
          error: `Invalid file type. Please upload one of: ${supportedFormats.join(', ').toUpperCase()}` 
        }, { status: 400 });
      }
    }

    console.log(`📥 Processing audio file: ${file.name} (${file.size} bytes, ${file.type})`);

    try {
      // Step 3: Process with Alle AI directly (no temporary file needed)
      const result = await AlleAIService.transcribeAudio(file);
      console.log(`✅ Transcription completed for: ${file.name}`);

      // Step 4: Return transcription with metadata
      return NextResponse.json({
        transcription: result.transcription,
        fileName: file.name,
        confidence: result.confidence,
        language: result.language,
        duration: result.duration,
        wordCount: result.transcription.split(/\s+/).filter(Boolean).length,
        message: 'Transcription completed successfully'
      });

    } catch (processingError) {
      console.error('❌ Alle AI processing error:', processingError);
      
      if (processingError instanceof Error) {
        // Handle specific API errors
        if (processingError.message.includes('timeout')) {
          return NextResponse.json({ 
            error: 'Processing timeout. Please try with a shorter audio file.',
            details: 'The audio file took too long to process. Try reducing the file size or length.'
          }, { status: 408 });
        }
        
        if (processingError.message.includes('API error')) {
          return NextResponse.json({ 
            error: 'AI service error. Please try again.',
            details: processingError.message
          }, { status: 502 });
        }
        
        if (processingError.message.includes('API_KEY')) {
          return NextResponse.json({ 
            error: 'API configuration error',
            details: 'Please check your Alle AI API configuration'
          }, { status: 500 });
        }
      }
      
      throw processingError;
    }

  } catch (error) {
    console.error('❌ Request processing error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process audio file',
        details: 'An unexpected error occurred. Please try again with a valid audio file.'
      },
      { status: 500 }
    );
  }
}

// API route configuration
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60, // 60 seconds max execution time
};
