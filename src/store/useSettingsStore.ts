import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromptSettings {
  suggestionPrompt: string;
  chatPrompt: string;
  suggestionContextWindow: number;
  chatContextWindow: number;
}

interface SettingsStore {
  groqApiKey: string;
  promptSettings: PromptSettings;
  
  setGroqApiKey: (key: string) => void;
  setPromptSettings: (settings: Partial<PromptSettings>) => void;
  resetToDefaults: () => void;
  clearSettings: () => void;
}

export const DEFAULT_SUGGESTION_PROMPT = `You are an AI assistant helping someone during a live meeting or conversation. Your job is to generate exactly 3 helpful suggestions based on the conversation transcript.

Each suggestion must be one of these types:
- question: A relevant question to ask next
- talking_point: A useful point to bring up
- answer: A possible answer to a question that was asked
- fact_check: Verification or correction of something said
- clarification: Help clarify something confusing

Rules:
1. Return EXACTLY 3 suggestions
2. Each preview must deliver immediate value (don't just tease)
3. Adapt to the conversation context
4. Be concise and actionable
5. Return valid JSON only

Response format:
{
  "suggestions": [
    {
      "type": "question",
      "title": "Short title",
      "preview": "Full helpful content that delivers value"
    }
  ]
}`;

export const DEFAULT_CHAT_PROMPT = `You are an AI meeting copilot assistant. Your role is to help users during live conversations and meetings by:

1. Clarifying topics and concepts discussed
2. Answering questions about the conversation
3. Providing insights and context
4. Offering detailed explanations
5. Fact-checking and verifying information
6. Suggesting next steps or actions

Guidelines:
- Be concise but thorough
- Reference the conversation context when relevant
- Provide actionable insights
- Be professional and helpful
- If you're unsure, acknowledge it
- Focus on being a helpful meeting companion

Always consider the full conversation context when responding.`;

const DEFAULT_SETTINGS: PromptSettings = {
  suggestionPrompt: DEFAULT_SUGGESTION_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  suggestionContextWindow: 5,
  chatContextWindow: 10,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      groqApiKey: '',
      promptSettings: DEFAULT_SETTINGS,
      
      setGroqApiKey: (key) => set({ groqApiKey: key }),
      
      setPromptSettings: (settings) => set((state) => ({
        promptSettings: { ...state.promptSettings, ...settings }
      })),
      
      resetToDefaults: () => set({ promptSettings: DEFAULT_SETTINGS }),
      
      clearSettings: () => set({ 
        groqApiKey: '', 
        promptSettings: DEFAULT_SETTINGS 
      }),
    }),
    {
      name: 'twinmind-settings',
    }
  )
);
