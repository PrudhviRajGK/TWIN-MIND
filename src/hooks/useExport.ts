import { useCallback } from 'react';
import { useTranscriptStore } from '@/store/useTranscriptStore';
import { useSuggestionsStore } from '@/store/useSuggestionsStore';
import { useChatStore } from '@/store/useChatStore';

interface ExportData {
  metadata: {
    exportedAt: string;
    sessionDuration: string;
    totalTranscripts: number;
    totalSuggestionBatches: number;
    totalChatMessages: number;
  };
  transcript: Array<{
    timestamp: string;
    speaker: string;
    text: string;
    createdAt: string;
  }>;
  suggestions: Array<{
    batchId: string;
    createdAt: string;
    suggestions: Array<{
      type: string;
      title: string;
      preview: string;
    }>;
  }>;
  chat: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  timestamps: {
    firstTranscript: string | null;
    lastTranscript: string | null;
    firstSuggestion: string | null;
    lastSuggestion: string | null;
    firstChatMessage: string | null;
    lastChatMessage: string | null;
  };
}

export function useExport() {
  const { transcripts } = useTranscriptStore();
  const { batches } = useSuggestionsStore();
  const { messages } = useChatStore();

  const exportSession = useCallback(() => {
    // Prepare transcript data
    const transcriptData = transcripts.map(t => ({
      timestamp: t.timestamp,
      speaker: t.speaker,
      text: t.text,
      createdAt: t.createdAt.toISOString(),
    }));

    // Prepare suggestions data
    const suggestionsData = batches.map(batch => ({
      batchId: batch.id,
      createdAt: batch.createdAt.toISOString(),
      suggestions: batch.suggestions.map(s => ({
        type: s.type,
        title: s.title,
        preview: s.preview,
      })),
    }));

    // Prepare chat data
    const chatData = messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

    // Calculate timestamps
    const firstTranscript = transcripts.length > 0 ? transcripts[0].createdAt.toISOString() : null;
    const lastTranscript = transcripts.length > 0 ? transcripts[transcripts.length - 1].createdAt.toISOString() : null;
    const firstSuggestion = batches.length > 0 ? batches[batches.length - 1].createdAt.toISOString() : null; // Batches are reversed
    const lastSuggestion = batches.length > 0 ? batches[0].createdAt.toISOString() : null;
    const firstChatMessage = messages.length > 0 ? messages[0].timestamp.toISOString() : null;
    const lastChatMessage = messages.length > 0 ? messages[messages.length - 1].timestamp.toISOString() : null;

    // Calculate session duration
    let sessionDuration = 'N/A';
    if (firstTranscript && lastTranscript) {
      const start = new Date(firstTranscript);
      const end = new Date(lastTranscript);
      const durationMs = end.getTime() - start.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      sessionDuration = `${minutes}m ${seconds}s`;
    }

    // Build export data
    const exportData: ExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        sessionDuration,
        totalTranscripts: transcripts.length,
        totalSuggestionBatches: batches.length,
        totalChatMessages: messages.length,
      },
      transcript: transcriptData,
      suggestions: suggestionsData,
      chat: chatData,
      timestamps: {
        firstTranscript,
        lastTranscript,
        firstSuggestion,
        lastSuggestion,
        firstChatMessage,
        lastChatMessage,
      },
    };

    // Create JSON blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `twinmind-session-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return exportData;
  }, [transcripts, batches, messages]);

  const canExport = transcripts.length > 0 || batches.length > 0 || messages.length > 0;

  return {
    exportSession,
    canExport,
  };
}
