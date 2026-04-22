"use client";

import { createContext, useContext, ReactNode } from "react";
import { useChat } from "@/hooks/useChat";

interface AppContextType {
  sendChatMessage: (message: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { sendMessage } = useChat();

  return (
    <AppContext.Provider value={{ sendChatMessage: sendMessage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
