"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  FC,
  PropsWithChildren,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { TranscriptItem } from "@/app/types";
import { formatDetailedTimestamp } from "@/app/lib/formatters";

type TranscriptContextValue = {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (
    itemId: string,
    role: "user" | "assistant",
    text: string,
    isHidden?: boolean,
  ) => void;
  updateTranscriptMessage: (itemId: string, text: string, isDelta: boolean) => void;
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItem: (itemId: string, updatedProperties: Partial<TranscriptItem>) => void;
};

const TranscriptContext = createContext<TranscriptContextValue | undefined>(undefined);

export const TranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  // 効率的な検索のためのMap化されたアイテム（将来の最適化で使用予定）
  // const transcriptItemsMap = useMemo(() => {
  //   const map = new Map<string, TranscriptItem>();
  //   transcriptItems.forEach(item => {
  //     map.set(item.itemId, item);
  //   });
  //   return map;
  // }, [transcriptItems]);

  const addTranscriptMessage: TranscriptContextValue["addTranscriptMessage"] = useCallback((itemId, role, text = "", isHidden = false) => {
    setTranscriptItems((prev) => {
      // Map を使用して効率的な存在確認
      const existingItem = prev.find(log => log.itemId === itemId && log.type === "MESSAGE");
      if (existingItem) {
        console.warn(`[addTranscriptMessage] スキップ中; itemId=${itemId}, role=${role}, text=${text} のメッセージは既に存在します`);
        return prev;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: "MESSAGE",
        role,
        title: text,
        expanded: false,
        timestamp: formatDetailedTimestamp(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
        isHidden,
      };

      return [...prev, newItem];
    });
  }, []);

  const updateTranscriptMessage: TranscriptContextValue["updateTranscriptMessage"] = useCallback((itemId, newText, append = false) => {
    setTranscriptItems((prev) => {
      const itemIndex = prev.findIndex(item => item.itemId === itemId && item.type === "MESSAGE");
      if (itemIndex === -1) return prev;
      
      const updatedItems = [...prev];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = {
        ...item,
        title: append ? (item.title ?? "") + newText : newText,
      };
      
      return updatedItems;
    });
  }, []);

  const addTranscriptBreadcrumb: TranscriptContextValue["addTranscriptBreadcrumb"] = useCallback((title, data) => {
    setTranscriptItems((prev) => [
      ...prev,
      {
        itemId: `breadcrumb-${uuidv4()}`,
        type: "BREADCRUMB",
        title,
        data,
        expanded: false,
        timestamp: formatDetailedTimestamp(),
        createdAtMs: Date.now(),
        status: "DONE",
        isHidden: false,
      },
    ]);
  }, []);

  const toggleTranscriptItemExpand: TranscriptContextValue["toggleTranscriptItemExpand"] = useCallback((itemId) => {
    setTranscriptItems((prev) => {
      const itemIndex = prev.findIndex(item => item.itemId === itemId);
      if (itemIndex === -1) return prev;
      
      const updatedItems = [...prev];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = { ...item, expanded: !item.expanded };
      
      return updatedItems;
    });
  }, []);

  const updateTranscriptItem: TranscriptContextValue["updateTranscriptItem"] = useCallback((itemId, updatedProperties) => {
    setTranscriptItems((prev) => {
      const itemIndex = prev.findIndex(item => item.itemId === itemId);
      if (itemIndex === -1) return prev;
      
      const updatedItems = [...prev];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedProperties };
      
      return updatedItems;
    });
  }, []);

  return (
    <TranscriptContext.Provider
      value={{
        transcriptItems,
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItem,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error("useTranscript must be used within a TranscriptProvider");
  }
  return context;
}
