"use client";

import { useRef } from "react";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { 
  extractMessageText, 
  extractLastAssistantMessage, 
  extractModeration,
  sketchilyDetectGuardrailMessage
} from "@/app/lib/sessionUtils";

/**
 * メッセージ関連のイベントハンドラーを管理するカスタムフック
 */
export function useMessageHandlers() {
  const {
    transcriptItems,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItem,
  } = useTranscript();

  const lastSpeechRequestIdRef = useRef<string | null>(null);

  /**
   * 履歴追加時の処理
   */
  const handleHistoryAdded = (item: any) => {
    console.log("[handleHistoryAdded] ", item);
    if (!item || item.type !== 'message') return;

    const { itemId, role, content = [] } = item;
    if (itemId && role) {
      const isUser = role === "user";
      let text = extractMessageText(content);

      if (isUser && !text) {
        text = "[文字起こし中...]";
      }

      addTranscriptMessage(itemId, role, text, false);
    }
  };

  /**
   * 履歴更新時の処理
   */
  const handleHistoryUpdated = (item: any) => {
    if (!item || item.type !== 'message') return;

    const { itemId, content = [] } = item;
    const text = extractMessageText(content);

    if (text && itemId) {
      updateTranscriptMessage(itemId, text, false);
    }
  };

  /**
   * 応答完了時の処理
   */
  const handleResponseDone = (data: any) => {
    const lastMessage = extractLastAssistantMessage(data?.history);
    if (!lastMessage) return;

    const lastResponseId = data?.responseId || lastSpeechRequestIdRef.current;
    if (!lastResponseId) return;

    const existingItem = transcriptItems.find(item => item.itemId === lastResponseId);
    if (existingItem) {
      const responseText = extractMessageText(lastMessage.content);
      updateTranscriptMessage(lastResponseId, responseText, false);
    }
  };

  /**
   * ガードレール失敗時の処理
   */
  const handleGuardrailFailed = (data: any) => {
    const guardrailData = extractModeration(data);
    if (!guardrailData) return;

    const lastMessage = extractLastAssistantMessage(data?.history);
    if (!lastMessage) return;

    const lastResponseId = data?.responseId || lastSpeechRequestIdRef.current;
    const guardrailStr = sketchilyDetectGuardrailMessage(data?.failureDetails);

    let fallbackText = "[ガードレールによりメッセージがブロックされました]";
    if (guardrailStr) {
      try {
        const guardrailObj = JSON.parse(guardrailStr);
        fallbackText = guardrailObj.moderationRationale || fallbackText;
      } catch (error) {
        console.warn("ガードレール情報のパースに失敗:", error);
      }
    }

    if (lastResponseId) {
      const existingItem = transcriptItems.find(item => item.itemId === lastResponseId);
      if (existingItem) {
        updateTranscriptItem(lastResponseId, {
          ...existingItem,
          title: fallbackText,
          guardrailResult: {
            status: "DONE",
            category: guardrailData.moderationCategory || "UNKNOWN",
            rationale: guardrailData.moderationRationale || "詳細情報なし"
          }
        });
      }
    }
  };

  /**
   * 音声要求開始時の処理
   */
  const handleSpeechRequested = (data: any) => {
    if (data?.responseId) {
      lastSpeechRequestIdRef.current = data.responseId;
      addTranscriptMessage(
        data.responseId, 
        "assistant", 
        "[応答を生成中...]", 
        false
      );
    }
  };

  return {
    handleHistoryAdded,
    handleHistoryUpdated,
    handleResponseDone,
    handleGuardrailFailed,
    handleSpeechRequested,
  };
}