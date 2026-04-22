"use client";

import { useState, useEffect } from "react";
import { X, Key, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useSettingsStore, DEFAULT_SUGGESTION_PROMPT, DEFAULT_CHAT_PROMPT } from "@/store/useSettingsStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { groqApiKey, promptSettings, setGroqApiKey, setPromptSettings, resetToDefaults } = useSettingsStore();
  
  const [apiKey, setApiKey] = useState(groqApiKey);
  const [suggestionPrompt, setSuggestionPrompt] = useState(promptSettings.suggestionPrompt);
  const [chatPrompt, setChatPrompt] = useState(promptSettings.chatPrompt);
  const [suggestionContextWindow, setSuggestionContextWindow] = useState(promptSettings.suggestionContextWindow);
  const [chatContextWindow, setChatContextWindow] = useState(promptSettings.chatContextWindow);
  
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(groqApiKey);
    setSuggestionPrompt(promptSettings.suggestionPrompt);
    setChatPrompt(promptSettings.chatPrompt);
    setSuggestionContextWindow(promptSettings.suggestionContextWindow);
    setChatContextWindow(promptSettings.chatContextWindow);
  }, [groqApiKey, promptSettings]);

  const handleSave = () => {
    setGroqApiKey(apiKey);
    setPromptSettings({
      suggestionPrompt,
      chatPrompt,
      suggestionContextWindow,
      chatContextWindow,
    });
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This will not affect your API key.')) {
      resetToDefaults();
      setSuggestionPrompt(DEFAULT_SUGGESTION_PROMPT);
      setChatPrompt(DEFAULT_CHAT_PROMPT);
      setSuggestionContextWindow(5);
      setChatContextWindow(10);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-panel border border-dark-border rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border sticky top-0 bg-dark-panel z-10">
          <h2 className="text-lg font-semibold text-gray-200">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-hover transition-colors"
            aria-label="Close settings"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* API Key Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Key size={16} />
              Groq API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally and never sent to our servers.
            </p>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
            >
              Get your API key from Groq Console →
            </a>
          </div>

          {/* Context Windows */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Suggestion Context Window
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={suggestionContextWindow}
                onChange={(e) => setSuggestionContextWindow(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of recent transcript entries to use (default: 5)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Chat Context Window
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={chatContextWindow}
                onChange={(e) => setChatContextWindow(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of recent transcript entries to use (default: 10)
              </p>
            </div>
          </div>

          {/* Suggestion Prompt Section */}
          <div className="border border-dark-border rounded-lg">
            <button
              onClick={() => toggleSection('suggestion')}
              className="w-full flex items-center justify-between p-4 hover:bg-dark-hover transition-colors"
            >
              <span className="text-sm font-medium text-gray-300">
                Live Suggestion System Prompt
              </span>
              {expandedSection === 'suggestion' ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'suggestion' && (
              <div className="p-4 pt-0">
                <textarea
                  value={suggestionPrompt}
                  onChange={(e) => setSuggestionPrompt(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500/50 transition-colors resize-y"
                  placeholder="Enter system prompt for suggestions..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This prompt guides how AI generates meeting suggestions. Changes apply immediately to new requests.
                </p>
              </div>
            )}
          </div>

          {/* Chat Prompt Section */}
          <div className="border border-dark-border rounded-lg">
            <button
              onClick={() => toggleSection('chat')}
              className="w-full flex items-center justify-between p-4 hover:bg-dark-hover transition-colors"
            >
              <span className="text-sm font-medium text-gray-300">
                Chat System Prompt
              </span>
              {expandedSection === 'chat' ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'chat' && (
              <div className="p-4 pt-0">
                <textarea
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500/50 transition-colors resize-y"
                  placeholder="Enter system prompt for chat..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This prompt defines the AI's behavior in chat conversations. Changes apply immediately to new messages.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-border sticky bottom-0 bg-dark-panel">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-dark-hover rounded-lg transition-all"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
            >
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
