"use client";

import React, { createContext, useContext, useState, useCallback, FC, PropsWithChildren } from "react";
import { v4 as uuidv4 } from "uuid";
import { LoggedEvent } from "@/app/types";
import { formatTimestamp } from "@/app/lib/formatters";

type EventContextValue = {
  loggedEvents: LoggedEvent[];
  logClientEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  logServerEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  logHistoryItem: (item: any) => void;
  toggleExpand: (id: number | string) => void;
};

const EventContext = createContext<EventContextValue | undefined>(undefined);

// 最大保持するイベント数（メモリ使用量制限）
const MAX_EVENTS = 1000;

export const EventProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  const addLoggedEvent = useCallback((direction: "client" | "server", eventName: string, eventData: Record<string, any>) => {
    const id = eventData.event_id || uuidv4();
    setLoggedEvents((prev) => {
      const newEvent: LoggedEvent = {
        id,
        direction,
        eventName,
        eventData,
        timestamp: formatTimestamp(),
        expanded: false,
      };
      
      const updated = [...prev, newEvent];
      
      // メモリ使用量制限のため、古いイベントを削除
      if (updated.length > MAX_EVENTS) {
        return updated.slice(-MAX_EVENTS);
      }
      
      return updated;
    });
  }, []);

  const logClientEvent: EventContextValue["logClientEvent"] = useCallback((eventObj, eventNameSuffix = "") => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("client", name, eventObj);
  }, [addLoggedEvent]);

  const logServerEvent: EventContextValue["logServerEvent"] = useCallback((eventObj, eventNameSuffix = "") => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("server", name, eventObj);
  }, [addLoggedEvent]);

  const logHistoryItem: EventContextValue['logHistoryItem'] = useCallback((item) => {
    let eventName = item.type;
    if (item.type === 'message') {
      eventName = `${item.role}.${item.status}`;
    }
    if (item.type === 'function_call') {
      eventName = `function.${item.name}.${item.status}`;
    }
    addLoggedEvent('server', eventName, item);
  }, [addLoggedEvent]);

  const toggleExpand: EventContextValue['toggleExpand'] = useCallback((id) => {
    setLoggedEvents((prev) => {
      const itemIndex = prev.findIndex(log => log.id === id);
      if (itemIndex === -1) return prev;
      
      const updatedEvents = [...prev];
      const item = updatedEvents[itemIndex];
      updatedEvents[itemIndex] = { ...item, expanded: !item.expanded };
      
      return updatedEvents;
    });
  }, []);


  return (
    <EventContext.Provider
      value={{ loggedEvents, logClientEvent, logServerEvent, logHistoryItem, toggleExpand }}
    >
      {children}
    </EventContext.Provider>
  );
};

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventはEventProvider内で使用する必要があります");
  }
  return context;
}