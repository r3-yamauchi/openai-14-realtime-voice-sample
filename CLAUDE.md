# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリのコードと連携する際のガイダンスを提供します。

## 概要

これは OpenAI Realtime API と OpenAI Agents SDK を使用したシンプルなリアルタイム音声チャットアプリケーションです。日本語での音声対話に特化した Next.js アプリケーションとして実装されています。

## 開発コマンド

- **開発サーバー起動**: `npm run dev`
- **プロダクションビルド**: `npm run build`
- **プロダクション起動**: `npm start`
- **リント**: `npm run lint`
- **依存関係インストール**: `npm i`

## セットアップ

1. `.env.sample` を `.env` にコピーし、`OPENAI_API_KEY` を設定
2. `npm i` で依存関係をインストール
3. `npm run dev` で開発サーバーを起動
4. ブラウザで `http://localhost:3000` を開く

## アーキテクチャ

### エージェント構成

- **シンプル設計**: 単一のチャットエージェント (`simpleChat`) による音声対話
- **日本語特化**: 日本語での自然な音声認識・合成・テキスト処理
- **リアルタイム通信**: WebSocket を使用した低遅延音声ストリーミング

### 主要ディレクトリ構造

```
src/app/
├── agentConfigs/           # エージェント定義と設定
│   ├── simpleChat.ts       # メインチャットエージェント
│   ├── index.ts            # エージェント設定統合
│   ├── guardrails.ts       # コンテンツモデレーション
│   └── types.ts            # 型定義
├── api/                    # APIエンドポイント
│   ├── session/            # セッション管理
│   └── responses/          # レスポンス処理
├── contexts/               # アプリケーション状態管理
│   ├── TranscriptContext.tsx  # 会話履歴状態
│   └── EventContext.tsx       # イベント状態
├── hooks/                  # カスタムReactフック
│   ├── useRealtimeSession.ts  # リアルタイムセッション管理
│   └── useAudioDownload.ts    # オーディオ録音・ダウンロード
├── components/             # UIコンポーネント
│   ├── Transcript.tsx      # 会話履歴表示
│   ├── Events.tsx          # イベントログ表示
│   ├── BottomToolbar.tsx   # 操作パネル
│   └── GuardrailChip.tsx   # モデレーション表示
└── lib/                    # ユーティリティ関数
    ├── envSetup.ts         # 環境設定
    ├── audioUtils.ts       # オーディオ処理
    └── codecUtils.ts       # コーデック処理
```

### エージェントシナリオ

現在は **simpleChat** エージェントのみを使用：
- 一般的な音声チャット対応
- 日本語での自然な対話
- リアルタイム音声認識・合成
- コンテンツモデレーション機能

## 新しいエージェントの追加方法

1. `src/app/agentConfigs/` 以下に新しいエージェントファイルを作成
2. `RealtimeAgent` インスタンスを定義してexport
3. `src/app/agentConfigs/index.ts` の `allAgentSets` に追加
4. 必要に応じて `src/app/App.tsx` でガードレールを設定

例：
```typescript
import { RealtimeAgent } from '@openai/agents/realtime';

export const customAgent = new RealtimeAgent({
  name: 'customChat',
  voice: 'sage',
  instructions: "カスタムインストラクション...",
  tools: [],
  handoffs: [],
});

export const customScenario = [customAgent];
```

## 重要な技術要素

### OpenAI Agents SDK

- `@openai/agents` を使用してエージェントを定義
- `RealtimeAgent` インターフェースで統一された設定
- リアルタイム音声ストリーミングの簡単な統合

### 状態管理

- React Context を使用（TranscriptContext、EventContext）
- `useRealtimeSession` フックでセッション管理
- セッション履歴とオーディオ録音の処理

### 音声処理

- サーバーVAD（Voice Activity Detection）と Push-to-Talk の切り替え
- コーデック選択（Opus 48kHz / PCMU・PCMA 8kHz）
- リアルタイム音声ストリーミング
- オーディオ録音・ダウンロード機能

## 日本語対応

- プロンプトとインストラクションは日本語で記述
- コメントも日本語に統一
- 日本語音声認識とTTSに対応
- UIメッセージとエラーメッセージの日本語化

## モデレーション機能

- コンテンツモデレーションガードレール（不適切なコンテンツの検出）
- 以下のカテゴリで分類：
  - OFFENSIVE: ヘイトスピーチ、差別的言葉
  - OFF_BRAND: 競合他社誹謗中傷
  - VIOLENCE: 脅迫、暴力的描写
  - NONE: 問題なし

## ツール統合

- エージェントは `tools` プロパティでカスタムツールを使用可能
- 非同期ツール実行とレスポンス処理
- ツール呼び出しの履歴とデバッグ情報

## UI機能

### ボトムツールバー

1. **接続制御**: セッションの開始/終了
2. **Push-to-Talk**: 音声入力モードの切り替え
3. **オーディオ再生**: エージェント音声のオン/オフ
4. **ログ表示**: イベントログの表示/非表示
5. **トランスクリプト**: 会話履歴の表示/非表示
6. **コーデック選択**: 音声品質の選択

### 会話インターフェース

- リアルタイム会話履歴表示
- 音声とテキストのデュアル入力
- エージェント応答のストリーミング表示
- モデレーション結果の表示

## トラブルシューティング

### 一般的な問題

1. **OpenAI API キーの確認**: `.env` ファイルの設定確認
2. **マイクアクセス許可**: ブラウザでのマイク許可確認
3. **ネットワーク接続**: API リクエストの接続確認
4. **エージェント設定**: 設定ファイルの検証

### デバッグ情報

- イベントログで詳細な技術情報を確認
- WebSocket通信の状態監視
- API呼び出し履歴の確認
- エラー詳細とスタックトレース

## 重要な注意事項

### 開発時の注意

- ファイル作成時は必要最小限にとどめる
- 既存ファイルの編集を優先する
- ドキュメントファイル（*.md）は明示的に要求された場合のみ作成
- 絵文字は明示的に要求された場合のみ使用

### セキュリティ

- API キーや秘密情報のコミット防止
- コンテンツモデレーションの適切な実装
- ユーザー入力の適切な検証

### パフォーマンス

- リアルタイム通信の最適化
- オーディオストリーミングの効率化
- メモリ使用量の監視

## 拡張性

このアプリケーションは以下の方向で拡張可能です：

1. **新しいエージェント**: 特定用途向けエージェントの追加
2. **ツール統合**: 外部API・データベース連携
3. **UI拡張**: カスタムコンポーネントの追加
4. **音声機能**: 新しいコーデックや音声モデルの追加
5. **多言語対応**: 他言語での音声対話サポート