"use client";

import { Settings, Download } from "lucide-react";
import { useState } from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import ChatPanel from "@/components/ChatPanel";
import SettingsModal from "@/components/SettingsModal";
import { AppProvider } from "@/components/AppProvider";
import { useExport } from "@/hooks/useExport";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { exportSession, canExport } = useExport();

  const handleExport = () => {
    exportSession();
  };

  return (
    <AppProvider>
      <main className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">TwinMind Live Suggestions</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!canExport}
              className="flex items-center gap-2 px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-sm text-gray-300 hover:bg-dark-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={canExport ? "Export session data" : "No data to export"}
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-sm text-gray-300 hover:bg-dark-hover transition-all duration-200"
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          <TranscriptPanel />
          <SuggestionsPanel />
          <ChatPanel />
        </div>

        {/* Settings Modal */}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </main>
    </AppProvider>
  );
}
