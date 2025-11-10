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
};

const TocContext = React.createContext<TocContextValue>({
  items: [],
  setItems: () => {},
});

export function TocProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<TocItem[]>([]);

  return (
    <TocContext.Provider value={{ items, setItems }}>
      {children}
    </TocContext.Provider>
  );
}

export function useToc() {
  return React.useContext(TocContext);
}
