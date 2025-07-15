"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface UserInputSectionProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
}

/**
 * ユーザーテキスト入力とメッセージ送信機能を提供するコンポーネント
 */
export function UserInputSection({ 
  userText, 
  setUserText, 
  onSendMessage, 
  canSend 
}: UserInputSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 送信可能になったらオートフォーカス
  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSend && userText.trim()) {
      onSendMessage();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-lg px-4 py-2 text-base border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder={canSend ? "メッセージを入力..." : "接続中..."}
          disabled={!canSend}
        />
        <button
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Image
            src="/arrow.svg"
            alt="送信"
            width={16}
            height={16}
            className="filter invert"
          />
          送信
        </button>
      </div>
    </div>
  );
}