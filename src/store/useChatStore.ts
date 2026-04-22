import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: `message-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      },
    ],
  })),

  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      messages[messages.length - 1].content = content;
    }
    return { messages };
  }),

  clearMessages: () => set({ messages: [], error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
