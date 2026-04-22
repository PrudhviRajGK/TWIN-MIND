import { create } from 'zustand';
import { TranscriptEntry } from '@/types';

interface TranscriptStore {
  transcripts: TranscriptEntry[];
  isLoading: boolean;
  error: string | null;
  
  addTranscript: (entry: Omit<TranscriptEntry, 'id' | 'createdAt'>) => void;
  clearTranscripts: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTranscriptStore = create<TranscriptStore>((set) => ({
  transcripts: [],
  isLoading: false,
  error: null,

  addTranscript: (entry) => set((state) => ({
    transcripts: [
      ...state.transcripts,
      {
        ...entry,
        id: `transcript-${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
      },
    ],
  })),

  clearTranscripts: () => set({ transcripts: [], error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
