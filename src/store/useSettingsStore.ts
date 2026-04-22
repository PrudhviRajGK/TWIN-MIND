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

export const DEFAULT_SUGGESTION_PROMPT = `You are an intelligent AI meeting copilot helping someone during a live conversation. Your job is to generate exactly 3 helpful, context-aware suggestions based on the recent conversation.

ALLOWED SUGGESTION TYPES:
- question: A useful question to ask next
- talking_point: A useful idea or discussion point to bring up
- fact_check: Verify or correct a statement made in conversation
- answer: Quick answer to a question that was asked
- summary: Short summary of current conversation topic
- clarification: Ask for clarification on something confusing
- next_step: Suggest a concrete next action or decision

CRITICAL RULES:
1. Generate EXACTLY 3 suggestions
2. Each suggestion MUST be a DIFFERENT type
3. Analyze the conversation context to choose appropriate types:
   - If a question was asked → include "answer"
   - If speaker seems confused → include "clarification"
   - If a factual statement was made → consider "fact_check"
   - If discussion is broad or long → include "summary"
   - If planning or decision context → include "next_step"
   - Otherwise use "question" or "talking_point"
4. Reference actual conversation content in titles and previews
5. Avoid generic suggestions - be specific to the conversation
6. Preview text must provide immediate value (not just a teaser)
7. Vary suggestion types across refreshes to avoid repetition

RESPONSE FORMAT (valid JSON only):
{
  "suggestions": [
    {
      "type": "answer",
      "title": "3-6 word title referencing conversation",
      "preview": "1-2 sentences providing helpful, actionable content"
    },
    {
      "type": "clarification",
      "title": "Another specific title",
      "preview": "Specific, helpful preview text"
    },
    {
      "type": "summary",
      "title": "Third unique title",
      "preview": "Concrete, useful information"
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
