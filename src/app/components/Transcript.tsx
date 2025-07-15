"use client";

import React, { useEffect, useRef, useState } from "react";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { MessageItem } from "./MessageItem";
import { TranscriptHeader } from "./TranscriptHeader";
import { UserInputSection } from "./UserInputSection";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  downloadRecording: () => void;
  isVisible?: boolean;
}

/**
 * メインのトランスクリプトコンポーネント
 * 会話履歴の表示、ユーザー入力、操作機能を統合管理
 */
function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  downloadRecording,
  isVisible = true,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  return (
    <div
      className={
        (isVisible ? "w-1/2 overflow-auto" : "w-0 overflow-hidden opacity-0") +
        " transition-all rounded-xl duration-200 ease-in-out flex-col bg-white min-h-0 flex"
      }
    >
      <div className="flex flex-col flex-1 min-h-0">
        <TranscriptHeader 
          transcriptRef={transcriptRef}
          onDownloadRecording={downloadRecording}
        />

        {/* Transcript Content */}
        <div
          ref={transcriptRef}
          className="overflow-auto p-4 flex flex-col gap-y-4 h-full"
        >
          {[...transcriptItems]
            .sort((a, b) => a.createdAtMs - b.createdAtMs)
            .map((item) => (
              <MessageItem
                key={item.itemId}
                item={item}
                onToggleExpand={toggleTranscriptItemExpand}
              />
            ))}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200">
        <UserInputSection
          userText={userText}
          setUserText={setUserText}
          onSendMessage={onSendMessage}
          canSend={canSend}
        />
      </div>
    </div>
  );
}

export default Transcript;
