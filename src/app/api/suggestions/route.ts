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
    const finalSystemPrompt = systemPrompt || `You are an intelligent AI meeting copilot helping someone during a live conversation. Your job is to generate exactly 3 helpful, context-aware suggestions based on the recent conversation.

ALLOWED SUGGESTION TYPES:
- question: A useful question to ask next
- talking_point: A useful idea or discussion point to bring up
- fact_check: Verify or correct a statement made in conversation
- answer: Quick answer to a question that was asked
- summary: Short summary of current conversation topic
- clarification: Ask for clarification on something confusing
- next_step: Suggest a concrete next action or decision

CRITICAL RULES:
1. Generate EXACTLY 3 suggestions
2. Each suggestion MUST be a DIFFERENT type
3. Analyze the conversation context to choose appropriate types:
   - If a question was asked → include "answer"
   - If speaker seems confused → include "clarification"
   - If a factual statement was made → consider "fact_check"
   - If discussion is broad or long → include "summary"
   - If planning or decision context → include "next_step"
   - Otherwise use "question" or "talking_point"
4. Reference actual conversation content in titles and previews
5. Avoid generic suggestions - be specific to the conversation
6. Preview text must provide immediate value (not just a teaser)
7. Vary suggestion types across refreshes to avoid repetition

RESPONSE FORMAT (valid JSON only):
{
  "suggestions": [
    {
      "type": "answer",
      "title": "3-6 word title referencing conversation",
      "preview": "1-2 sentences providing helpful, actionable content"
    },
    {
      "type": "clarification",
      "title": "Another specific title",
      "preview": "Specific, helpful preview text"
    },
    {
      "type": "summary",
      "title": "Third unique title",
      "preview": "Concrete, useful information"
    }
  ]
}

EXAMPLE (for transcript about SBE confusion):
{
  "suggestions": [
    {
      "type": "answer",
      "title": "Explain SBE meaning",
      "preview": "SBE could mean Small Business Enterprise, State Board of Education, or Single Board Computer depending on context."
    },
    {
      "type": "clarification",
      "title": "Clarify SBE context",
      "preview": "Ask what context the user means by SBE since it can refer to several different things."
    },
    {
      "type": "summary",
      "title": "User confusion summary",
      "preview": "The speaker appears confused about what is happening. A quick summary of the situation may help align the conversation."
    }
  ]
}`;

    // Create the prompt with context analysis
    const userPrompt = `Analyze this recent conversation transcript and generate exactly 3 helpful, context-aware suggestions.

TRANSCRIPT:
${transcriptContext}

INSTRUCTIONS:
1. Read the transcript carefully
2. Identify the conversation context (question asked? confusion? planning? factual discussion?)
3. Choose 3 DIFFERENT suggestion types that fit the context
4. Generate specific suggestions that reference actual conversation topics
5. Make previews immediately useful and actionable

Return EXACTLY 3 suggestions in valid JSON format.`;

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
          temperature: 0.8, // Increased for more variety
          max_tokens: 1200,
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
