/**
 * セッション履歴処理のためのユーティリティ関数集
 */

/**
 * メッセージコンテンツからテキストを抽出
 */
export const extractMessageText = (content: any[] = []): string => {
  if (!Array.isArray(content)) return "";

  return content
    .map((c) => {
      if (!c || typeof c !== "object") return "";
      if (c.type === "input_text") return c.text ?? "";
      if (c.type === "audio") return c.transcript ?? "";
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * 名前で関数呼び出しを抽出
 */
export const extractFunctionCallByName = (name: string, content: any[] = []): any => {
  if (!Array.isArray(content)) return undefined;
  return content.find((c: any) => c.type === 'function_call' && c.name === name);
};

/**
 * JSON文字列を安全にパース
 */
export const maybeParseJson = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      console.warn('JSONのパースに失敗しました:', val);
      return val;
    }
  }
  return val;
};

/**
 * 履歴から最後のアシスタントメッセージを抽出
 */
export const extractLastAssistantMessage = (history: any[] = []): any => {
  if (!Array.isArray(history)) return undefined;
  // 配列をコピーしてからreverseを呼び出し、元の配列を変更しない
  return [...history].reverse().find((c: any) => c.type === 'message' && c.role === 'assistant');
};

/**
 * オブジェクトからモデレーション情報を再帰的に抽出
 */
export const extractModeration = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  if ('moderationCategory' in obj) return obj;
  if ('outputInfo' in obj) return extractModeration(obj.outputInfo);
  if ('output' in obj) return extractModeration(obj.output);
  if ('result' in obj) return extractModeration(obj.result);
  
  return undefined;
};

/**
 * ガードレールメッセージの一時的な検出（SDKの次のバージョンまでの対応）
 */
export const sketchilyDetectGuardrailMessage = (text: string): string | undefined => {
  return text.match(/Failure Details: (\{.*?\})/)?.[1];
};

/**
 * タイムスタンプを日本語形式でフォーマット
 */
export const formatTimestamp = (timestamp?: string | number): string => {
  if (!timestamp) return new Date().toLocaleTimeString('ja-JP');
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleTimeString('ja-JP');
};

/**
 * 一意のIDを生成
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};