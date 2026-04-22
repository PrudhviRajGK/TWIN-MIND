import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Test Utilities for TwinMind Live Suggestions
 */

// Mock Groq API responses
export const mockGroqTranscriptionResponse = {
  text: 'This is a test transcription',
};

export const mockGroqSuggestionsResponse = {
  suggestions: [
    {
      type: 'question',
      title: 'What are the next steps?',
      preview: 'Based on the discussion, consider outlining the action items.',
    },
    {
      type: 'talking_point',
      title: 'Key consideration',
      preview: 'It might be worth discussing the timeline constraints.',
    },
    {
      type: 'fact_check',
      title: 'Verify the metrics',
      preview: 'The numbers mentioned should be cross-referenced with the latest data.',
    },
  ],
};

export const mockGroqChatResponse = {
  choices: [
    {
      message: {
        content: 'This is a helpful response from the AI assistant.',
      },
    },
  ],
};

// Mock MediaRecorder
export class MockMediaRecorder {
  state: string = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({
        data: new Blob(['test audio'], { type: 'audio/webm' }),
      });
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

// Mock MediaStream
export class MockMediaStream {
  getTracks() {
    return [
      {
        stop: jest.fn(),
        kind: 'audio',
      },
    ];
  }
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Mock fetch responses
export function mockFetchSuccess(data: any) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
}

export function mockFetchError(status: number, message: string) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => message,
  });
}

// Mock streaming response
export function mockFetchStream(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
      });
      controller.close();
    },
  });

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    body: stream,
  });
}

// Wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Create mock transcript entries
export function createMockTranscript(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `transcript-${i}`,
    timestamp: `00:${String(i * 30).padStart(2, '0')}`,
    speaker: 'user',
    text: `Test transcript ${i + 1}`,
    createdAt: new Date(),
  }));
}

// Create mock suggestion batch
export function createMockSuggestionBatch() {
  return {
    id: `batch-${Date.now()}`,
    createdAt: new Date(),
    suggestions: [
      {
        id: 'sug-1',
        type: 'question' as const,
        title: 'Test Question',
        preview: 'Test preview',
      },
      {
        id: 'sug-2',
        type: 'talking_point' as const,
        title: 'Test Talking Point',
        preview: 'Test preview 2',
      },
      {
        id: 'sug-3',
        type: 'answer' as const,
        title: 'Test Answer',
        preview: 'Test preview 3',
      },
    ],
  };
}

// Create mock chat messages
export function createMockChatMessages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `message-${i}`,
    role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
    content: `Test message ${i + 1}`,
    timestamp: new Date(),
  }));
}
