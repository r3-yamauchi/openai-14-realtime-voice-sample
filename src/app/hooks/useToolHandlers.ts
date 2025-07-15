"use client";

import { useTranscript } from "@/app/contexts/TranscriptContext";
import { extractFunctionCallByName, maybeParseJson } from "@/app/lib/sessionUtils";

/**
 * ツール関連のイベントハンドラーを管理するカスタムフック
 */
export function useToolHandlers() {
  const { addTranscriptBreadcrumb } = useTranscript();

  /**
   * ツール開始時の処理
   */
  const handleAgentToolStart = (details: any, _agent: any, functionCall: any) => {
    const lastFunctionCall = extractFunctionCallByName(functionCall.name, details?.context?.history);
    const function_name = lastFunctionCall?.name;
    const function_args = lastFunctionCall?.arguments;

    addTranscriptBreadcrumb(
      `function call: ${function_name}`,
      function_args
    );    
  };

  /**
   * ツール終了時の処理
   */
  const handleAgentToolEnd = (details: any, _agent: any, _functionCall: any, result: any) => {
    const lastFunctionCall = extractFunctionCallByName(_functionCall.name, details?.context?.history);
    addTranscriptBreadcrumb(
      `function call result: ${lastFunctionCall?.name}`,
      maybeParseJson(result)
    );
  };

  return {
    handleAgentToolStart,
    handleAgentToolEnd,
  };
}