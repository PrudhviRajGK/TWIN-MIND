"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMicrophoneRecorder } from "@/hooks/useMicrophoneRecorder";
import { useTranscriptStore } from "@/store/useTranscriptStore";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface TranscriptPanelProps {
  className?: string;
}

export default function TranscriptPanel({ className = "" }: TranscriptPanelProps) {
  const { isRecording, error, startRecording, stopRecording, retryCount } = useMicrophoneRecorder();
  const { transcripts, isLoading, error: transcriptError } = useTranscriptStore();
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest transcript
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className={`flex flex-col bg-dark-panel border border-dark-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            1. Mic & Transcript
          </h2>
          {isRecording && (
            <span className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Recording
            </span>
          )}
          {isLoading && (
            <span className="flex items-center gap-2 text-xs text-blue-400">
              <LoadingSpinner size="sm" className="text-blue-400" />
              {retryCount > 0 ? `Retrying (${retryCount})...` : 'Processing...'}
            </span>
          )}
        </div>
        <button
          onClick={handleToggleRecording}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Error Display */}
      {(error || transcriptError) && (
        <div className="mx-4 mt-4">
          <ErrorBanner
            message={error?.message || transcriptError || 'An error occurred'}
            type={error?.type === 'network' ? 'warning' : 'error'}
            onDismiss={() => {
              // Error will be cleared on next successful operation
            }}
          />
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
        {transcripts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">
              No transcript yet — start the mic.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-dark-bg rounded-lg border border-dark-border text-sm animate-fadeIn"
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-blue-400 font-mono text-xs">
                    [{entry.timestamp}]
                  </span>
                  <span className="text-gray-500 text-xs">{entry.speaker}:</span>
                </div>
                <p className="text-gray-300">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
