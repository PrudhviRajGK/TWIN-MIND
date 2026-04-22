import { NextRequest } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // Get API key from request header
    const apiKey = request.headers.get('x-groq-api-key');

    if (!apiKey || apiKey.trim() === '') {
      return new Response(
        JSON.stringify({ 
          error: 'API key required',
          message: 'Please provide your Groq API key in settings'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { message, transcriptContext, systemPrompt } = body;

    if (!message || message.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Message required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use custom system prompt if provided
    const finalSystemPrompt = systemPrompt || `You are an AI meeting copilot assistant. Your role is to help users during live conversations and meetings by:

1. Clarifying topics and concepts discussed
2. Answering questions about the conversation
3. Providing insights and context
4. Offering detailed explanations
5. Fact-checking and verifying information
6. Suggesting next steps or actions

Guidelines:
- Be concise but thorough
- Reference the conversation context when relevant
- Provide actionable insights
- Be professional and helpful
- If you're unsure, acknowledge it
- Focus on being a helpful meeting companion

Always consider the full conversation context when responding.`;

    // Build the user message with context
    let userMessage = message;
    if (transcriptContext && transcriptContext.trim()) {
      userMessage = `Conversation context:\n${transcriptContext}\n\nUser question: ${message}`;
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
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
                { role: 'user', content: userMessage }
              ],
              temperature: 0.7,
              max_tokens: 2000,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  error: true, 
                  message: 'Failed to generate response' 
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                error: true, 
                message: error instanceof Error ? error.message : 'Unknown error' 
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
