import { create } from 'zustand';
import { SuggestionBatch } from '@/types';

interface SuggestionsStore {
  batches: SuggestionBatch[];
  isLoading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
  
  addBatch: (batch: SuggestionBatch) => void;
  clearBatches: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdateTime: (time: Date) => void;
}

export const useSuggestionsStore = create<SuggestionsStore>((set) => ({
  batches: [],
  isLoading: false,
  error: null,
  lastUpdateTime: null,

  addBatch: (batch) => set((state) => ({
    batches: [batch, ...state.batches], // New batches at the top
  })),

  clearBatches: () => set({ batches: [], error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setLastUpdateTime: (time) => set({ lastUpdateTime: time }),
}));
