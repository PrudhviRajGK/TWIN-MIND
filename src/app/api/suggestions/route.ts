import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
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

    const body = await request.json();
    const { transcriptContext, systemPrompt } = body;

    if (!transcriptContext || transcriptContext.trim() === '') {
      return NextResponse.json(
        { error: 'Transcript context required' },
        { status: 400 }
      );
    }

    // Use custom system prompt if provided
    const finalSystemPrompt = systemPrompt || `You are an AI assistant helping someone during a live meeting or conversation. Your job is to generate exactly 3 helpful suggestions based on the conversation transcript.

Each suggestion must be one of these types:
- question: A relevant question to ask next
- talking_point: A useful point to bring up
- answer: A possible answer to a question that was asked
- fact_check: Verification or correction of something said
- clarification: Help clarify something confusing

Rules:
1. Return EXACTLY 3 suggestions
2. Each preview must deliver immediate value (don't just tease)
3. Adapt to the conversation context
4. Be concise and actionable
5. Return valid JSON only

Response format:
{
  "suggestions": [
    {
      "type": "question",
      "title": "Short title",
      "preview": "Full helpful content that delivers value"
    }
  ]
}`;

    // Create the prompt
    const userPrompt = `Based on this conversation transcript, generate exactly 3 helpful suggestions:

${transcriptContext}

Remember: Return EXACTLY 3 suggestions in valid JSON format.`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);

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
            error: 'Suggestion generation failed',
            message: errorText || 'Failed to generate suggestions'
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      // Parse the JSON response
      const parsed = JSON.parse(content);
      const suggestions = parsed.suggestions || [];

      // Validate we have exactly 3 suggestions
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid suggestions format');
      }

      // Add IDs to suggestions
      const suggestionsWithIds = suggestions.slice(0, 3).map((s: any, index: number) => ({
        id: `suggestion-${Date.now()}-${index}`,
        type: s.type || 'talking_point',
        title: s.title || 'Suggestion',
        preview: s.preview || '',
      }));

      return NextResponse.json({
        suggestions: suggestionsWithIds,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            message: 'Suggestion generation timed out. Please try again.'
          },
          { status: 504 }
        );
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('Suggestions error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
