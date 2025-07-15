import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import App from "./App";

/**
 * メインページコンポーネント
 * Reactコンテキストプロバイダーでアプリケーションをラップし、
 * グローバル状態管理を提供する
 */
export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      {/* 会話トランスクリプト状態管理 */}
      <TranscriptProvider>
        {/* イベントログ状態管理 */}
        <EventProvider>
          {/* メインアプリケーション */}
          <App />
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}
