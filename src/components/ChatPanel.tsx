"use client";

import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ChatPanelProps {
  className?: string;
}

export default function ChatPanel({ className = "" }: ChatPanelProps) {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col bg-dark-panel border border-dark-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            3. Chat (Detailed Answers)
          </h2>
          {isLoading && (
            <LoadingSpinner size="sm" className="text-green-400" />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4">
          <ErrorBanner
            message={error}
            type="error"
            onDismiss={() => {
              // Error will be cleared on next successful operation
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">
              Click a suggestion or type a question below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg animate-fadeIn ${
                  message.role === "user"
                    ? "bg-blue-500/10 border border-blue-500/30 ml-8"
                    : "bg-dark-bg border border-dark-border mr-8"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    message.role === "user" ? "text-blue-400" : "text-green-400"
                  }`}>
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="p-4 rounded-lg bg-dark-bg border border-dark-border mr-8 animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-green-400">
                    AI Assistant
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" className="text-green-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

