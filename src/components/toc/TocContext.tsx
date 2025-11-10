"use client";

import React from "react";

export type TocItem = {
  level: 1 | 2;
  text: string;
  id: string;
};

type TocContextValue = {
  items: TocItem[];
  setItems: (items: TocItem[]) => void;
  summary: string | null;
  setSummary: (s: string | null) => void;
};

const TocContext = React.createContext<TocContextValue>({
  items: [],
  setItems: () => {},
  summary: null,
  setSummary: () => {},
});

export function TocProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [summary, setSummary] = React.useState<string | null>(null);

  return (
    <TocContext.Provider value={{ items, setItems, summary, setSummary }}>
      {children}
    </TocContext.Provider>
  );
}

export function useToc() {
  return React.useContext(TocContext);
}
