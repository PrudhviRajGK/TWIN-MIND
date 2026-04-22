import { useEffect, useCallback, useRef } from 'react';
import { useSuggestionsStore } from '@/store/useSuggestionsStore';
import { useTranscriptStore } from '@/store/useTranscriptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SuggestionBatch } from '@/types';

const AUTO_REFRESH_INTERVAL_MS = 30000; // 30 seconds

export function useSuggestions() {
  const { batches, isLoading, error, addBatch, setLoading, setError, setLastUpdateTime } = useSuggestionsStore();
  const { transcripts } = useTranscriptStore();
  const { groqApiKey, promptSettings } = useSettingsStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isGeneratingRef = useRef(false);

  const generateSuggestions = useCallback(async () => {
    // Prevent concurrent requests
    if (isGeneratingRef.current) {
      return;
    }

    // Check if we have transcripts
    if (transcripts.length === 0) {
      return;
    }

    // Check if API key is configured
    if (!groqApiKey || groqApiKey.trim() === '') {
      setError('API key not configured');
      return;
    }

    isGeneratingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Get recent transcript context based on context window setting
      const contextWindow = promptSettings.suggestionContextWindow || 5;
      const recentTranscripts = transcripts.slice(-contextWindow);
      const transcriptContext = recentTranscripts
        .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
        .join('\n');

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': groqApiKey,
        },
        body: JSON.stringify({
          transcriptContext,
          systemPrompt: promptSettings.suggestionPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate suggestions');
      }

      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        const batch: SuggestionBatch = {
          id: `batch-${Date.now()}`,
          suggestions: data.suggestions,
          createdAt: new Date(),
        };

        addBatch(batch);
        setLastUpdateTime(new Date());
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      console.error('Suggestions error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  }, [transcripts, groqApiKey, promptSettings, addBatch, setLoading, setError, setLastUpdateTime]);

  // Auto-refresh every 30 seconds when there are transcripts
  useEffect(() => {
    if (transcripts.length === 0) {
      // Clear interval if no transcripts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Generate initial suggestions
    if (batches.length === 0) {
      generateSuggestions();
    }

    // Set up auto-refresh
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        generateSuggestions();
      }, AUTO_REFRESH_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transcripts.length, batches.length, generateSuggestions]);

  return {
    batches,
    isLoading,
    error,
    refresh: generateSuggestions,
  };
}
