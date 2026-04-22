import { useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useTranscriptStore } from '@/store/useTranscriptStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useChat() {
  const { messages, isLoading, error, addMessage, updateLastMessage, setLoading, setError } = useChatStore();
  const { transcripts } = useTranscriptStore();
  const { groqApiKey, promptSettings } = useSettingsStore();

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Check API key
    if (!groqApiKey || groqApiKey.trim() === '') {
      setError('API key not configured');
      return;
    }

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setLoading(true);
    setError(null);

    try {
      // Get transcript context based on context window setting
      const contextWindow = promptSettings.chatContextWindow || 10;
      const recentTranscripts = transcripts.slice(-contextWindow);
      const transcriptContext = recentTranscripts
        .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': groqApiKey,
        },
        body: JSON.stringify({
          message: userMessage,
          transcriptContext,
          systemPrompt: promptSettings.chatPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.message || 'Stream error');
              }
              
              if (parsed.content) {
                assistantMessage += parsed.content;
                
                if (isFirstChunk) {
                  // Add new assistant message
                  addMessage({
                    role: 'assistant',
                    content: assistantMessage,
                  });
                  isFirstChunk = false;
                } else {
                  // Update existing message
                  updateLastMessage(assistantMessage);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      if (!assistantMessage) {
        throw new Error('No response received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Chat error:', errorMessage);
      setError(errorMessage);
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }, [groqApiKey, transcripts, promptSettings, addMessage, updateLastMessage, setLoading, setError]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
