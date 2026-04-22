"use client";

import { RefreshCw, Lightbulb, MessageCircle, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useAppContext } from "@/components/AppProvider";
import { SuggestionType } from "@/types";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SuggestionsPanelProps {
  className?: string;
}

const suggestionIcons: Record<SuggestionType, React.ReactNode> = {
  question: <MessageCircle size={16} className="text-blue-400" />,
  talking_point: <Lightbulb size={16} className="text-yellow-400" />,
  answer: <CheckCircle size={16} className="text-green-400" />,
  fact_check: <AlertCircle size={16} className="text-orange-400" />,
  clarification: <HelpCircle size={16} className="text-purple-400" />,
};

const suggestionLabels: Record<SuggestionType, string> = {
  question: 'Question',
  talking_point: 'Talking Point',
  answer: 'Answer',
  fact_check: 'Fact Check',
  clarification: 'Clarification',
};

export default function SuggestionsPanel({ className = "" }: SuggestionsPanelProps) {
  const { batches, isLoading, error, refresh } = useSuggestions();
  const { sendChatMessage } = useAppContext();

  const handleRefresh = () => {
    refresh();
  };

  const handleSuggestionClick = async (title: string, preview: string) => {
    // Send suggestion to chat
    const message = `${title}\n\n${preview}`;
    await sendChatMessage(message);
  };

  return (
    <div className={`flex flex-col bg-dark-panel border border-dark-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              2. Live Suggestions
            </h2>
            {isLoading && (
              <LoadingSpinner size="sm" className="text-blue-400" />
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reload suggestions"
            title="Refresh suggestions"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-xs text-gray-500">Auto refresh every 30 seconds</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4">
          <ErrorBanner
            message={error}
            type="warning"
            onRetry={handleRefresh}
            onDismiss={() => {
              // Error will be cleared on next successful operation
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {batches.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">
              Suggestions appear here once recording starts.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {batches.map((batch, batchIndex) => (
              <div key={batch.id} className="space-y-3 animate-fadeIn">
                {/* Batch timestamp */}
                {batchIndex === 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Latest suggestions
                  </div>
                )}
                {batchIndex > 0 && (
                  <div className="text-xs text-gray-600 pt-3 border-t border-dark-border">
                    {batch.createdAt.toLocaleTimeString()}
                  </div>
                )}

                {/* Suggestions */}
                {batch.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.title, suggestion.preview)}
                    className="w-full p-4 bg-dark-bg rounded-lg border border-dark-border text-left hover:border-blue-500/50 hover:bg-dark-hover transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {suggestionIcons[suggestion.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {suggestionLabels[suggestion.type]}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-200 mb-1 group-hover:text-blue-400 transition-colors">
                          {suggestion.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {suggestion.preview}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



