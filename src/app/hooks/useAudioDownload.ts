import { useRef, useCallback, useEffect } from "react";
import { convertWebMBlobToWav } from "../lib/audioUtils";

/**
 * 音声録音とダウンロード機能を提供するカスタムフック
 * メモリリーク対策とリソースの適切なクリーンアップを含む
 */
function useAudioDownload() {
  // MediaRecorderインスタンスを保存するためのRef
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // 記録されたすべてのBlobチャンクを収集するためのRef
  const recordedChunksRef = useRef<Blob[]>([]);
  // AudioContextインスタンスを保存するためのRef（クリーンアップ用）
  const audioContextRef = useRef<AudioContext | null>(null);
  // MediaStreamインスタンスを保存するためのRef（クリーンアップ用）
  const streamsRef = useRef<MediaStream[]>([]);

  /**
   * リソースの完全なクリーンアップ
   */
  const cleanup = useCallback(() => {
    // MediaRecorderの停止
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // AudioContextの閉じる
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(err => 
        console.warn("AudioContextクローズエラー:", err)
      );
    }
    audioContextRef.current = null;

    // MediaStreamのクリーンアップ
    streamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    streamsRef.current = [];

    // 記録チャンクのクリア
    recordedChunksRef.current = [];
  }, []);

  /**
   * 提供されたリモートストリームとマイクオーディオを組み合わせて録音を開始
   * @param remoteStream - リモートMediaStream（例：オーディオ要素から）
   */
  const startRecording = useCallback(async (remoteStream: MediaStream) => {
    // 既存のセッションがある場合はクリーンアップ
    cleanup();

    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamsRef.current.push(micStream);
    } catch (err) {
      console.error("マイクストリームの取得エラー:", err);
      // マイクアクセスが失敗した場合、空のMediaStreamにフォールバック
      micStream = new MediaStream();
    }

    // ストリームをマージするためにAudioContextを作成
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const destination = audioContext.createMediaStreamDestination();

    // リモートオーディオストリームを接続
    try {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      remoteSource.connect(destination);
    } catch (err) {
      console.error("リモートストリームをオーディオコンテキストに接続するエラー:", err);
    }

    // マイクオーディオストリームを接続
    try {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    } catch (err) {
      console.error("マイクストリームをオーディオコンテキストに接続するエラー:", err);
    }

    const options = { mimeType: "audio/webm" };
    try {
      const mediaRecorder = new MediaRecorder(destination.stream, options);
      
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorderエラー:", event);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error("結合されたストリームでMediaRecorderを開始するエラー:", err);
      cleanup();
    }
  }, [cleanup]);

  /**
   * MediaRecorderがアクティブな場合、停止する
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        // 停止する前に最終データを要求
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("録音停止エラー:", err);
      }
    }
  }, []);

  /**
   * WebMからWAVへの変換後、録音のダウンロードを開始
   * レコーダーがまだアクティブな場合、ダウンロードする前に最新のデータを要求
   */
  const downloadRecording = useCallback(async () => {
    // レコーディングがまだアクティブな場合、最新のチャンクを要求
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        // 現在のデータを要求
        mediaRecorderRef.current.requestData();
        // ondataavailableが発火するまで適切な遅延を許可
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error("録音データ要求エラー:", err);
      }
    }

    if (recordedChunksRef.current.length === 0) {
      console.warn("ダウンロードする記録されたチャンクが見つかりません。");
      return;
    }
    
    // 記録されたチャンクを単一のWebM Blobに結合
    const webmBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

    try {
      // WebM BlobをWAV Blobに変換
      const wavBlob = await convertWebMBlobToWav(webmBlob);
      const url = URL.createObjectURL(wavBlob);

      // フォーマットされた日時文字列を生成（ファイル名で許可されていない文字を置き換え）
      const now = new Date().toISOString().replace(/[:.]/g, "-");

      // 非表示のアンカー要素を作成し、ダウンロードをトリガー
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `realtime_agents_audio_${now}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 適切な遅延の後、Blob URLをクリーンアップ
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("録音をWAVに変換するエラー:", err);
    }
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { 
    startRecording, 
    stopRecording, 
    downloadRecording,
    cleanup 
  };
}

export default useAudioDownload; 