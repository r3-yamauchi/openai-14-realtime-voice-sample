"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { GuardrailChip } from "./GuardrailChip";

interface MessageItemProps {
  item: TranscriptItem;
  onToggleExpand: (itemId: string) => void;
}

/**
 * 個別メッセージアイテムを表示するコンポーネント
 * メッセージの種類（ユーザー・システム・アシスタント）とデータタイプに応じて適切な表示を行う
 */
export function MessageItem({ item, onToggleExpand }: MessageItemProps) {
  const {
    itemId,
    type,
    role,
    data,
    expanded,
    timestamp,
    title = "",
    isHidden,
    guardrailResult,
  } = item;

  if (isHidden) {
    return null;
  }

  if (type === "MESSAGE") {
    const isUser = role === "user";
    const containerClasses = `flex justify-end flex-col ${
      isUser ? "items-end" : "items-start"
    }`;
    const bubbleBase = `max-w-lg p-3 ${
      isUser ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-black"
    }`;
    const isBracketedMessage = title.startsWith("[") && title.endsWith("]");
    const messageStyle = isBracketedMessage ? 'italic text-gray-400' : '';
    const displayTitle = isBracketedMessage ? title.slice(1, -1) : title;

    return (
      <div key={itemId} className={containerClasses}>
        <div className="max-w-lg">
          <div
            className={`${bubbleBase} rounded-t-xl ${
              guardrailResult ? "" : "rounded-b-xl"
            }`}
          >
            <div className={messageStyle}>
              <ReactMarkdown>{displayTitle}</ReactMarkdown>
            </div>
          </div>
          {guardrailResult && (
            <div className="mb-1">
              <GuardrailChip guardrailResult={guardrailResult} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ブレッドクラムアイテムの表示
  if (type === "BREADCRUMB") {
    return (
      <div key={itemId} className="flex justify-center">
        <div className="text-sm font-medium text-gray-600 border-2 border-gray-200 bg-gray-50 px-3 py-1 rounded-xl">
          {title}
        </div>
      </div>
    );
  }

  // その他のデータタイプ（JSON等）の表示
  const dataAsText = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const hasData = dataAsText && dataAsText.trim().length > 0;

  return (
    <div key={itemId} className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg">{title}</h4>
        <div className="text-sm text-gray-500">{timestamp}</div>
      </div>
      
      {hasData && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleExpand(itemId)}
            className="w-full bg-gray-50 px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">データを表示</span>
              <span className="text-gray-400">
                {expanded ? "▼" : "▶"}
              </span>
            </div>
          </button>
          
          {expanded && (
            <div className="p-4 bg-white">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-60">
                {dataAsText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}