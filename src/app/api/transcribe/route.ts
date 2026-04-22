import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

export async function POST(request: NextRequest) {
  try {
    // Get API key from request header
    const apiKey = request.headers.get('x-groq-api-key');

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { 
          error: 'API key required',
          message: 'Please provide your Groq API key in settings'
        },
        { status: 401 }
      );
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith('gsk_')) {
      return NextResponse.json(
        { 
          error: 'Invalid API key format',
          message: 'Groq API keys should start with "gsk_"'
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const timestamp = formData.get('timestamp') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate audio file size (max 25MB for Groq)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large', message: 'Maximum file size is 25MB' },
        { status: 400 }
      );
    }

    // Create form data for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('response_format', 'json');
    groqFormData.append('language', 'en');
    groqFormData.append('temperature', '0');

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: groqFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);

        // Handle specific error cases
        if (response.status === 401) {
          return NextResponse.json(
            { 
              error: 'Invalid API key',
              message: 'The provided API key is invalid or expired'
            },
            { status: 401 }
          );
        }

        if (response.status === 429) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.'
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { 
            error: 'Transcription failed',
            message: errorText || 'Failed to transcribe audio'
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      return NextResponse.json({
        transcript: data.text || '',
        timestamp: parseInt(timestamp) || Date.now(),
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            message: 'Transcription request timed out. Please try again.'
          },
          { status: 504 }
        );
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
