import { useRef } from "react";
import { convertWebMBlobToWav } from "../lib/audioUtils";

function useAudioDownload() {
  // MediaRecorderインスタンスを保存するためのRef。
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // 記録されたすべてのBlobチャンクを収集するためのRef。
  const recordedChunksRef = useRef<Blob[]>([]);

  /**
   * 提供されたリモートストリームとマイクオーディオを組み合わせて録音を開始します。
   * @param remoteStream - リモートMediaStream（例：オーディオ要素から）。
   */
  const startRecording = async (remoteStream: MediaStream) => {
    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("マイクストリームの取得エラー:", err);
      // マイクアクセスが失敗した場合、空のMediaStreamにフォールバックします。
      micStream = new MediaStream();
    }

    // ストリームをマージするためにAudioContextを作成します。
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    // リモートオーディオストリームを接続します。
    try {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      remoteSource.connect(destination);
    } catch (err) {
      console.error("リモートストリームをオーディオコンテキストに接続するエラー:", err);
    }

    // マイクオーディオストリームを接続します。
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
      // タイムスライスなしで録音を開始します。
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error("結合されたストリームでMediaRecorderを開始するエラー:", err);
    }
  };

  /**
   * MediaRecorderがアクティブな場合、停止します。
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // 停止する前に最終データを要求します。
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  /**
   * WebMからWAVへの変換後、録音のダウンロードを開始します。
   * レコーダーがまだアクティブな場合、ダウンロードする前に最新のデータを要求します。
   */
  const downloadRecording = async () => {
    // レコーディングがまだアクティブな場合、最新のチャンクを要求します。
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      // 現在のデータを要求します。
      mediaRecorderRef.current.requestData();
      // ondataavailableが発火するまで短い遅延を許可します。
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (recordedChunksRef.current.length === 0) {
      console.warn("ダウンロードする記録されたチャンクが見つかりません。");
      return;
    }
    
    // 記録されたチャンクを単一のWebM Blobに結合します。
    const webmBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

    try {
      // WebM BlobをWAV Blobに変換します。
      const wavBlob = await convertWebMBlobToWav(webmBlob);
      const url = URL.createObjectURL(wavBlob);

      // フォーマットされた日時文字列を生成します（ファイル名で許可されていない文字を置き換えます）。
      const now = new Date().toISOString().replace(/[:.]/g, "-");

      // 非表示のアンカー要素を作成し、ダウンロードをトリガーします。
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `realtime_agents_audio_${now}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 短い遅延の後、Blob URLをクリーンアップします。
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("録音をWAVに変換するエラー:", err);
    }
  };

  return { startRecording, stopRecording, downloadRecording };
}

export default useAudioDownload; 