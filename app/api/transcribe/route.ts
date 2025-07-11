import { NextRequest, NextResponse } from 'next/server';
import { AlleAIService } from '@/lib/alle-ai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ALLE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Alle AI API is not configured. Please set ALLE_AI_API_KEY environment variable.' 
      }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('audio') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '1000') * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    const clearlyNotAudio = fileExtension && ['txt', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'tar', 'gz'].includes(fileExtension);
    
    if (clearlyNotAudio) {
      return NextResponse.json({ 
        error: `File type .${fileExtension} is not supported. Please upload an audio file.` 
      }, { status: 400 });
    }

    console.log(`📥 Processing audio file: ${file.name} (${file.size} bytes, ${file.type})`);

    // Additional validation for very small files
    if (file.size < 1000) { // Less than 1KB
      return NextResponse.json({ 
        error: 'Audio file too small',
        details: 'The audio file appears to be too small to contain meaningful audio content. Please upload a larger audio file with clear speech.'
      }, { status: 400 });
    }

    try {
      const result = await AlleAIService.transcribeAudio(file);
      console.log(`✅ Transcription completed for: ${file.name}`);

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
        if (processingError.message.includes('Insufficient API credits')) {
          return NextResponse.json({ 
            error: 'Insufficient API credits',
            details: 'Your Alle AI account needs to be topped up. Please add credits to continue using the transcription service.'
          }, { status: 402 });
        }
        
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
        
        return NextResponse.json({ 
          error: processingError.message,
          details: 'Please check your audio file and try again.'
        }, { status: 502 });
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
  maxDuration: 300, // 300 seconds (5 minutes) max execution time for large files
};
