import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '../useChatStore';

describe('useChatStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.clearMessages();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useChatStore());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should add user message', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        role: 'user',
        content: 'Hello',
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Hello',
    });
    expect(result.current.messages[0].id).toBeDefined();
    expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
  });

  it('should add assistant message', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        role: 'assistant',
        content: 'Hi there',
      });
    });

    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.messages[0].content).toBe('Hi there');
  });

  it('should update last message content', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        role: 'assistant',
        content: 'Initial',
      });
      result.current.updateLastMessage('Updated content');
    });

    expect(result.current.messages[0].content).toBe('Updated content');
  });

  it('should only update assistant messages', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        role: 'user',
        content: 'User message',
      });
      result.current.updateLastMessage('Should not update');
    });

    expect(result.current.messages[0].content).toBe('User message');
  });

  it('should clear messages', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        role: 'user',
        content: 'Test',
      });
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should maintain message order', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({ role: 'user', content: 'First' });
      result.current.addMessage({ role: 'assistant', content: 'Second' });
      result.current.addMessage({ role: 'user', content: 'Third' });
    });

    expect(result.current.messages[0].content).toBe('First');
    expect(result.current.messages[1].content).toBe('Second');
    expect(result.current.messages[2].content).toBe('Third');
  });
});
