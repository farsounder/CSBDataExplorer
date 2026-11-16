"use client";

import { createContext, useContext, useState } from "react";

const ExplorerUIContext = createContext<{
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
} | null>(null);

export function ExplorerUIProvider({ children }: { children: React.ReactNode }) {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <ExplorerUIContext.Provider value={{ shareOpen, setShareOpen }}>
      {children}
    </ExplorerUIContext.Provider>
  );
}

export function useExplorerUI() {
  const value = useContext(ExplorerUIContext);
  if (!value) throw new Error("Explorer UI requires its provider");
  return value;
}
