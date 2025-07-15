import React from "react";
import { SessionStatus } from "@/app/types";
import { SpeechSpeedLevel } from "@/app/agentConfigs/simpleChat";

/**
 * ボトムツールバーコンポーネントのプロパティ定義
 */
interface BottomToolbarProps {
  sessionStatus: SessionStatus; // セッション接続状態
  onToggleConnection: () => void; // 接続切り替えハンドラー
  isPTTActive: boolean; // Push-to-Talk モードの有効状態
  setIsPTTActive: (val: boolean) => void; // PTTモード切り替え
  isPTTUserSpeaking: boolean; // ユーザーが話している状態
  handleTalkButtonDown: () => void; // トークボタン押下ハンドラー
  handleTalkButtonUp: () => void; // トークボタン解放ハンドラー
  isEventsPaneExpanded: boolean; // イベントペインの展開状態
  setIsEventsPaneExpanded: (val: boolean) => void; // イベントペイン切り替え
  isAudioPlaybackEnabled: boolean; // オーディオ再生の有効状態
  setIsAudioPlaybackEnabled: (val: boolean) => void; // オーディオ再生切り替え
  codec: string; // 現在使用中のオーディオコーデック
  onCodecChange: (newCodec: string) => void; // コーデック変更ハンドラー
  isTranscriptVisible: boolean; // トランスクリプトペインの表示状態
  setIsTranscriptVisible: (val: boolean) => void; // トランスクリプト表示切り替え
  speechSpeed: SpeechSpeedLevel; // 音声速度レベル
  onSpeechSpeedChange: (newSpeed: SpeechSpeedLevel) => void; // 音声速度変更ハンドラー
}

/**
 * ボトムツールバーコンポーネント
 * アプリケーション下部に配置される操作パネル
 * 接続制御、音声設定、ペイン表示切り替えなどの機能を提供
 */
function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
  isTranscriptVisible,
  setIsTranscriptVisible,
  speechSpeed,
  onSpeechSpeedChange,
}: BottomToolbarProps) {
  // セッション状態の判定
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  /**
   * コーデック変更ハンドラー
   */
  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  /**
   * 音声速度変更ハンドラー
   */
  const handleSpeechSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = e.target.value as SpeechSpeedLevel;
    onSpeechSpeedChange(newSpeed);
  };

  /**
   * 音声速度のラベル取得
   */
  const getSpeechSpeedLabel = (speed: SpeechSpeedLevel): string => {
    const labels = {
      very_slow: 'とても遅い',
      slow: '遅い',
      normal: '普通',
      fast: '速い',
      very_fast: 'とても速い'
    };
    return labels[speed];
  };

  /**
   * 接続ボタンのラベル生成
   */
  function getConnectionButtonLabel() {
    if (isConnected) return "切断";
    if (isConnecting) return "接続中...";
    return "接続";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "text-white text-base p-2 w-36 rounded-md h-full";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      // 接続済み -> ラベル「切断」 -> 赤
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    // 切断済みまたは接続中 -> ラベルは「接続」または「接続中」 -> 黒
    return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-4 flex flex-row items-center justify-center gap-x-8">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-2">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={(e) => setIsPTTActive(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4"
        />
        <label
          htmlFor="push-to-talk"
          className="flex items-center cursor-pointer"
        >
          Push-to-Talk
        </label>
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={
            (isPTTUserSpeaking ? "bg-gray-300" : "bg-gray-200") +
            " py-1 px-4 cursor-pointer rounded-md" +
            (!isPTTActive ? " bg-gray-100 text-gray-400" : "")
          }
        >
          話す
        </button>
      </div>

      <div className="flex flex-row items-center gap-1">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4"
        />
        <label
          htmlFor="audio-playback"
          className="flex items-center cursor-pointer"
        >
          オーディオ再生
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="logs" className="flex items-center cursor-pointer">
          ログ
        </label>
      </div>
      <div className="flex flex-row items-center gap-2">
        <input
          id="transcript"
          type="checkbox"
          checked={isTranscriptVisible}
          onChange={(e) => setIsTranscriptVisible(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="transcript" className="flex items-center cursor-pointer">
          トランスクリプト
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div>Codec:</div>
        {/*
          コーデックセレクター – WebRTCトラックに8 kHz PCMU/PCMAを強制的に使用させ、
          電話ネットワーク経由でアクセスされた場合にエージェントがどのように聞こえるか
          （およびASR/VADがどのように機能するか）をプレビューできます。コーデックを選択すると、
          ページが?codec=...でリロードされ、AppレベルのロジックがWebRTCモンキーパッチ
          （codecPatch.tsを参照）を介してそれを取得し適用します。
        */}
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
        >
          <option value="opus">Opus (48 kHz)</option>
          <option value="pcmu">PCMU (8 kHz)</option>
          <option value="pcma">PCMA (8 kHz)</option>
        </select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div>音声速度:</div>
        <select
          id="speech-speed-select"
          value={speechSpeed}
          onChange={handleSpeechSpeedChange}
          disabled={isConnected}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="very_slow">とても遅い</option>
          <option value="slow">遅い</option>
          <option value="normal">普通</option>
          <option value="fast">速い</option>
          <option value="very_fast">とても速い</option>
        </select>
        <span className="text-sm text-gray-600">
          現在: {getSpeechSpeedLabel(speechSpeed)}
        </span>
      </div>
    </div>
  );
}

export default BottomToolbar;
