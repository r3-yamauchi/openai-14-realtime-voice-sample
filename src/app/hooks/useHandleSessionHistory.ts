"use client";

import { useRef } from "react";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useToolHandlers } from "./useToolHandlers";
import { useMessageHandlers } from "./useMessageHandlers";
import { 
  extractMessageText, 
  extractLastAssistantMessage, 
  extractModeration,
  sketchilyDetectGuardrailMessage
} from "@/app/lib/sessionUtils";

/**
 * セッション履歴処理の統合管理フック
 * 分割されたフックを組み合わせてセッションイベントハンドラーを提供
 */
export function useHandleSessionHistory() {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    updateTranscriptMessage,
    updateTranscriptItem,
  } = useTranscript();

  const { logServerEvent } = useEvent();
  const { handleAgentToolStart, handleAgentToolEnd } = useToolHandlers();
  const { 
    handleHistoryAdded
  } = useMessageHandlers();

  /**
   * 複数の履歴更新を処理
   */
  function handleHistoryUpdated(items: any[]) {
    console.log("[handleHistoryUpdated] ", items);
    items.forEach((item: any) => {
      if (!item || item.type !== 'message') return;

      const { itemId, content = [] } = item;
      const text = extractMessageText(content);

      if (text) {
        updateTranscriptMessage(itemId, text, false);
      }
    });
  }

  /**
   * 音声認識の差分更新を処理
   */
  function handleTranscriptionDelta(item: any) {
    const itemId = item.item_id;
    const deltaText = item.delta || "";
    if (itemId) {
      updateTranscriptMessage(itemId, deltaText, true);
    }
  }

  /**
   * 音声認識完了時の処理
   */
  function handleTranscriptionCompleted(item: any) {
    const itemId = item.item_id;
    const finalTranscript =
        !item.transcript || item.transcript === "\n"
        ? "[聞き取れません]"
        : item.transcript;
    if (itemId) {
      updateTranscriptMessage(itemId, finalTranscript, false);
      const transcriptItem = transcriptItems.find((i) => i.itemId === itemId);
      updateTranscriptItem(itemId, { status: 'DONE' });

      // ガードレール結果がまだ保留中の場合、PASSとマークします。
      if (transcriptItem?.guardrailResult?.status === 'IN_PROGRESS') {
        updateTranscriptItem(itemId, {
          guardrailResult: {
            status: 'DONE',
            category: 'NONE',
            rationale: '',
          },
        });
      }
    }
  }

  /**
   * ガードレール検出時の処理
   */
  function handleGuardrailTripped(details: any, _agent: any, guardrail: any) {
    console.log("[guardrail tripped]", details, _agent, guardrail);
    const moderation = extractModeration(guardrail.result.output.outputInfo);
    logServerEvent({ type: 'guardrail_tripped', payload: moderation });

    const lastAssistant = extractLastAssistantMessage(details?.context?.history);

    if (lastAssistant && moderation) {
      const category = moderation.moderationCategory ?? 'NONE';
      const rationale = moderation.moderationRationale ?? '';
      const offendingText: string | undefined = moderation?.testText;

      updateTranscriptItem(lastAssistant.itemId, {
        guardrailResult: {
          status: 'DONE',
          category,
          rationale,
          testText: offendingText,
        },
      });
    }
  }

  /**
   * 改良されたガードレール検出付き履歴追加処理
   */
  function handleHistoryAddedWithGuardrail(item: any) {
    console.log("[handleHistoryAdded] ", item);
    if (!item || item.type !== 'message') return;

    const { itemId, role, content = [] } = item;
    if (itemId && role) {
      const text = extractMessageText(content);

      // ガードレールがトリップされた場合の特別処理
      const guardrailMessage = sketchilyDetectGuardrailMessage(text);
      if (guardrailMessage) {
        try {
          const failureDetails = JSON.parse(guardrailMessage);
          addTranscriptBreadcrumb('出力ガードレールがアクティブ', { details: failureDetails });
        } catch (error) {
          console.warn("ガードレール詳細のパースに失敗:", error);
          addTranscriptBreadcrumb('出力ガードレールがアクティブ', { details: text });
        }
      } else {
        // 通常の履歴追加処理
        handleHistoryAdded(item);
      }
    }
  }

  const handlersRef = useRef({
    handleAgentToolStart,
    handleAgentToolEnd,
    handleHistoryUpdated,
    handleHistoryAdded: handleHistoryAddedWithGuardrail,
    handleTranscriptionDelta,
    handleTranscriptionCompleted,
    handleGuardrailTripped,
  });

  return handlersRef;
}
