# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリのコードと連携する際のガイダンスを提供します。

## 概要

これは OpenAI Realtime API と OpenAI Agents SDK を使用したエンタープライズ級のリアルタイム音声チャットアプリケーションです。日本語での音声対話に特化した Next.js アプリケーションとして実装されており、最新のリファクタリングにより型安全性、パフォーマンス最適化、保守性が大幅に向上しています。

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

### 主要ディレクトリ構造（リファクタリング後）

```
src/app/
├── agentConfigs/           # エージェント定義と設定
│   ├── simpleChat.ts       # メインチャットエージェント定義
│   ├── index.ts            # エージェント設定統合
│   ├── guardrails.ts       # コンテンツモデレーション機能
│   └── types.ts            # 型定義の再エクスポート
├── api/                    # バックエンドAPIエンドポイント（型安全性向上）
│   ├── session/            # セッション管理（GET /api/session）
│   └── responses/          # レスポンス処理（POST /api/responses）
├── contexts/               # React Context（最適化済み）
│   ├── TranscriptContext.tsx # 会話履歴状態（usecallback対応）
│   └── EventContext.tsx      # イベント状態（メモリ制限対応）
├── hooks/                  # カスタムReactフック（分割・最適化済み）
│   ├── useRealtimeSession.ts      # リアルタイムセッション管理
│   ├── useAudioDownload.ts        # オーディオ録音（メモリリーク対策）
│   ├── useHandleSessionHistory.ts # セッション履歴管理（統合）
│   ├── useMessageHandlers.ts      # メッセージ処理専用フック
│   └── useToolHandlers.ts         # ツール処理専用フック
├── components/             # UIコンポーネント（分割・最適化済み）
│   ├── Transcript.tsx      # メインの会話履歴表示
│   ├── MessageItem.tsx     # 個別メッセージアイテム
│   ├── TranscriptHeader.tsx # トランスクリプトヘッダー
│   ├── UserInputSection.tsx # ユーザー入力部分
│   ├── Events.tsx          # イベントログ表示
│   ├── BottomToolbar.tsx   # 操作パネル
│   └── GuardrailChip.tsx   # モデレーション表示
└── lib/                    # ユーティリティ関数（共通化済み）
    ├── envSetup.ts         # 環境設定（型安全性向上）
    ├── audioUtils.ts       # オーディオ処理
    ├── codecUtils.ts       # コーデック処理
    ├── sessionUtils.ts     # セッション処理ユーティリティ
    ├── formatters.ts       # データフォーマット関数
    └── styles.ts           # 共通スタイル定数
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

### 状態管理（最適化済み）

- **React Context**: TranscriptContext、EventContext（useCallback対応）
- **メモリ効率**: EventContext でイベント数制限（MAX_EVENTS = 1000）
- **セッション管理**: `useRealtimeSession` フックでリアルタイム通信
- **分割されたフック**: 機能別にフックを分割し保守性を向上
- **メモリリーク対策**: オーディオ録音の適切なリソース管理

### 音声処理（メモリリーク対策済み）

- **VAD制御**: サーバーVAD（Voice Activity Detection）と Push-to-Talk の切り替え
- **コーデック選択**: Opus 48kHz（高品質）/ PCMU・PCMA 8kHz（電話品質）
- **リアルタイムストリーミング**: 低遅延音声通信
- **録音機能**: オーディオ録音・ダウンロード（自動リソース解放）
- **メモリ管理**: MediaRecorder、AudioContext の適切な廃棄処理

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

1. **OpenAI API キーの確認**: `.env` ファイルの設定確認、APIキー権限確認
2. **マイクアクセス許可**: ブラウザでのマイク許可確認、システム設定確認
3. **ネットワーク接続**: API リクエストの接続確認、ファイアウォール確認
4. **エージェント設定**: 設定ファイルの検証
5. **JSON解析エラー**: HTTPメソッドの確認、サーバーエラーログ確認

### デバッグ情報

- **イベントログ**: 詳細な技術情報を確認（右側パネル）
- **WebSocket通信**: 接続状態、メッセージ送受信履歴の監視
- **API呼び出し**: リクエスト・レスポンス詳細、エラーコード確認
- **パフォーマンス**: 遅延時間、メモリ使用量の監視
- **エラー詳細**: スタックトレース、エラーコンテキスト情報

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

### パフォーマンス（最適化済み）

- **リアルタイム通信**: WebSocket接続の最適化
- **オーディオストリーミング**: メモリリーク対策、自動リソース管理
- **メモリ使用量**: イベント履歴制限、効率的な状態更新
- **React最適化**: useCallback、useMemo による不要な再レンダリング防止
- **コンポーネント分割**: 247行の巨大コンポーネントを4つに分割

## 拡張性

このアプリケーションは以下の方向で拡張可能です：

1. **新しいエージェント**: 特定用途向けエージェントの追加
2. **ツール統合**: 外部API・データベース連携
3. **UI拡張**: カスタムコンポーネントの追加
4. **音声機能**: 新しいコーデックや音声モデルの追加
5. **多言語対応**: 他言語での音声対話サポート

## リファクタリング実績

### 実施済み改善内容

1. **型安全性強化**
   - Zodスキーマによる実行時バリデーション
   - TypeScript厳密化
   - API レスポンス型定義

2. **コンポーネント分割**
   - Transcript.tsx（247行）を4つのコンポーネントに分割
   - 保守性とテスト性の向上

3. **フック最適化**
   - useHandleSessionHistory を3つのフックに分割
   - useAudioDownload のメモリリーク対策
   - useCallback、useMemo による最適化

4. **Context最適化**
   - TranscriptContext、EventContext にuseCallback適用
   - EventContext でメモリ制限（MAX_EVENTS = 1000）

5. **共通ユーティリティ**
   - formatters.ts: データフォーマット関数
   - sessionUtils.ts: セッション処理ユーティリティ
   - styles.ts: 共通スタイル定数

6. **バグ修正**
   - JSON解析エラー修正（HTTPメソッド修正）
   - 包括的エラーハンドリング追加