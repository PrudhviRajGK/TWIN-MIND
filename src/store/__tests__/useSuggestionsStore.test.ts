import { renderHook, act } from '@testing-library/react';
import { useSuggestionsStore } from '../useSuggestionsStore';
import { SuggestionBatch } from '@/types';

describe('useSuggestionsStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSuggestionsStore());
    act(() => {
      result.current.clearBatches();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    expect(result.current.batches).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdateTime).toBeNull();
  });

  it('should add suggestion batch', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    const batch: SuggestionBatch = {
      id: 'batch-1',
      createdAt: new Date(),
      suggestions: [
        {
          id: 'sug-1',
          type: 'question',
          title: 'Test Question',
          preview: 'Test preview',
        },
      ],
    };

    act(() => {
      result.current.addBatch(batch);
    });

    expect(result.current.batches).toHaveLength(1);
    expect(result.current.batches[0]).toEqual(batch);
  });

  it('should add new batches at the top', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    const batch1: SuggestionBatch = {
      id: 'batch-1',
      createdAt: new Date(),
      suggestions: [],
    };

    const batch2: SuggestionBatch = {
      id: 'batch-2',
      createdAt: new Date(),
      suggestions: [],
    };

    act(() => {
      result.current.addBatch(batch1);
      result.current.addBatch(batch2);
    });

    expect(result.current.batches[0].id).toBe('batch-2');
    expect(result.current.batches[1].id).toBe('batch-1');
  });

  it('should clear batches', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    const batch: SuggestionBatch = {
      id: 'batch-1',
      createdAt: new Date(),
      suggestions: [],
    };

    act(() => {
      result.current.addBatch(batch);
      result.current.clearBatches();
    });

    expect(result.current.batches).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  it('should set last update time', () => {
    const { result } = renderHook(() => useSuggestionsStore());
    
    const now = new Date();
    act(() => {
      result.current.setLastUpdateTime(now);
    });

    expect(result.current.lastUpdateTime).toEqual(now);
  });
});
