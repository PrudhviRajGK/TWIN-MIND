/**
 * API Route Tests for /api/transcribe
 * 
 * These tests verify the transcription endpoint behavior
 */

import { POST } from '../transcribe/route';
import { NextRequest } from 'next/server';

// Mock fetch for Groq API
global.fetch = jest.fn();

describe('/api/transcribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when API key is missing', async () => {
    const formData = new FormData();
    formData.append('audio', new Blob(['test'], { type: 'audio/webm' }));
    formData.append('timestamp', Date.now().toString());

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('API key required');
  });

  it('should return 400 when audio file is missing', async () => {
    const formData = new FormData();
    formData.append('timestamp', Date.now().toString());

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'x-groq-api-key': 'gsk_test123',
      },
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No audio file provided');
  });

  it('should return 401 when API key format is invalid', async () => {
    const formData = new FormData();
    formData.append('audio', new Blob(['test'], { type: 'audio/webm' }));

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'x-groq-api-key': 'invalid_key',
      },
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid API key format');
  });

  it('should return 400 when file size exceeds limit', async () => {
    const largeBlob = new Blob([new ArrayBuffer(26 * 1024 * 1024)], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', largeBlob);

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'x-groq-api-key': 'gsk_test123',
      },
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Audio file too large');
  });

  it('should successfully transcribe audio', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Hello world' }),
    });

    const formData = new FormData();
    formData.append('audio', new Blob(['test'], { type: 'audio/webm' }));
    formData.append('timestamp', '1234567890');

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'x-groq-api-key': 'gsk_test123',
      },
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.transcript).toBe('Hello world');
    expect(data.timestamp).toBe(1234567890);
  });

  it('should handle Groq API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });

    const formData = new FormData();
    formData.append('audio', new Blob(['test'], { type: 'audio/webm' }));

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'x-groq-api-key': 'gsk_test123',
      },
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
  });
});
