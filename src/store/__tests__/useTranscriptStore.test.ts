import { renderHook, act } from '@testing-library/react';
import { useTranscriptStore } from '../useTranscriptStore';

describe('useTranscriptStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTranscriptStore());
    act(() => {
      result.current.clearTranscripts();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    expect(result.current.transcripts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should add transcript entry', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.addTranscript({
        timestamp: '00:30',
        speaker: 'user',
        text: 'Hello world',
      });
    });

    expect(result.current.transcripts).toHaveLength(1);
    expect(result.current.transcripts[0]).toMatchObject({
      timestamp: '00:30',
      speaker: 'user',
      text: 'Hello world',
    });
    expect(result.current.transcripts[0].id).toBeDefined();
    expect(result.current.transcripts[0].createdAt).toBeInstanceOf(Date);
  });

  it('should add multiple transcript entries', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.addTranscript({
        timestamp: '00:30',
        speaker: 'user',
        text: 'First message',
      });
      result.current.addTranscript({
        timestamp: '01:00',
        speaker: 'user',
        text: 'Second message',
      });
    });

    expect(result.current.transcripts).toHaveLength(2);
    expect(result.current.transcripts[0].text).toBe('First message');
    expect(result.current.transcripts[1].text).toBe('Second message');
  });

  it('should clear transcripts', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.addTranscript({
        timestamp: '00:30',
        speaker: 'user',
        text: 'Test',
      });
      result.current.clearTranscripts();
    });

    expect(result.current.transcripts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should generate unique IDs for each transcript', () => {
    const { result } = renderHook(() => useTranscriptStore());
    
    act(() => {
      result.current.addTranscript({
        timestamp: '00:30',
        speaker: 'user',
        text: 'First',
      });
      result.current.addTranscript({
        timestamp: '00:31',
        speaker: 'user',
        text: 'Second',
      });
    });

    const ids = result.current.transcripts.map(t => t.id);
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
  });
});
