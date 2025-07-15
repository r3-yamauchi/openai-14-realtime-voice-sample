# OpenAI リアルタイム音声チャットアプリケーション

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/r3-yamauchi/openai-14-realtime-voice-sample)

このプロジェクトは、OpenAI Realtime API と OpenAI Agents SDK を使用したエンタープライズ級の音声チャットアプリケーションです。日本語での自然な音声対話を提供する Next.js アプリケーションとして実装されており、型安全性、パフォーマンス最適化、保守性を重視した設計となっています。

## 概要

本アプリケーションは、複雑なマルチエージェントシステムを排除し、一般的な音声チャットに特化したシンプルな実装を提供します。ユーザーは音声またはテキストを通じて AI エージェントと自然な日本語での対話を行うことができます。最新のリファクタリングにより、コンポーネントの分割、型安全性の向上、メモリリーク対策、パフォーマンス最適化が実施されています。

## 最新機能

### 音声速度調整機能
- **5段階の速度調整**: とても遅い、遅い、普通、速い、とても速い
- **リアルタイム変更**: 画面右上で設定変更可能
- **自動再接続**: 速度変更時に自動的にセッションを再開
- **設定保存**: ブラウザのローカルストレージに設定を保存

### シンプル化されたUI
- **エージェント選択の廃止**: 単一のチャットエージェントに集約
- **直感的な操作**: 必要な機能のみに絞り込んだインターフェース
- **改良されたレイアウト**: 音声速度調整を画面右上に配置

## OpenAI Agents SDK について

このプロジェクトでは、AI エージェントの構築、管理、デプロイのためのツールキットである [OpenAI Agents SDK](https://github.com/openai/openai-agents) を使用しています。この SDK は以下の機能を提供します：

- エージェントの動作とツール連携を定義するための統一されたインターフェース
- エージェントのオーケストレーション、状態管理、イベント処理に対する組み込みサポート
- 低遅延のストリーミング対話のための OpenAI Realtime API との簡単な統合
- 拡張可能なパターンとカスタマイゼーション機能

完全なドキュメント、ガイド、API リファレンスについては、公式の [OpenAI Agents SDK ドキュメント](https://github.com/openai/openai-agents#readme) を参照してください。

## 主な機能

- **リアルタイム音声対話**: 低遅延での自然な音声会話
- **日本語サポート**: 完全な日本語対応（音声認識・合成・テキスト処理）
- **音声速度調整**: 5段階の速度調整機能（とても遅い〜とても速い）
- **デュアル入力**: 音声とテキストの両方での入力対応
- **Push-to-Talk**: サーバーVADまたは手動音声入力の選択
- **コーデック選択**: 高品質（Opus 48kHz）および電話品質（PCMU/PCMA 8kHz）音声
- **モデレーション**: 不適切なコンテンツの自動検出とフィルタリング
- **型安全性**: TypeScript + Zod による厳密な型チェックと実行時バリデーション
- **パフォーマンス最適化**: メモリリーク対策、効率的な状態管理、メモ化による最適化
- **モジュラー設計**: 分割されたコンポーネントとフックによる保守性の向上
- **シンプルUI**: 必要な機能に絞り込んだ直感的なインターフェース

## プロジェクト構造

```
src/app/
├── agentConfigs/            # エージェント設定と定義
│   ├── simpleChat.ts        # メインチャットエージェント定義（音声速度調整対応）
│   ├── index.ts             # エージェント設定の統合
│   ├── guardrails.ts        # コンテンツモデレーション機能
│   └── types.ts             # 型定義の再エクスポート
├── api/                     # バックエンドAPIエンドポイント
│   ├── session/             # セッション管理（GET /api/session）
│   └── responses/           # レスポンス処理（POST /api/responses）
├── components/              # UIコンポーネント（分割済み）
│   ├── Transcript.tsx       # メインの会話履歴表示
│   ├── MessageItem.tsx      # 個別メッセージアイテム
│   ├── TranscriptHeader.tsx # トランスクリプトヘッダー
│   ├── UserInputSection.tsx # ユーザー入力部分
│   ├── Events.tsx           # イベントログ表示
│   ├── BottomToolbar.tsx    # 操作パネル
│   └── GuardrailChip.tsx    # モデレーション表示
├── contexts/                # React Context（最適化済み）
│   ├── TranscriptContext.tsx # 会話履歴状態管理
│   └── EventContext.tsx      # イベント状態管理
├── hooks/                   # カスタムReactフック（分割済み）
│   ├── useRealtimeSession.ts      # リアルタイムセッション管理
│   ├── useAudioDownload.ts        # オーディオ録音（メモリリーク対策済み）
│   ├── useHandleSessionHistory.ts # セッション履歴管理（統合）
│   ├── useMessageHandlers.ts      # メッセージ処理専用フック
│   └── useToolHandlers.ts         # ツール処理専用フック
└── lib/                     # ユーティリティ関数（共通化済み）
    ├── envSetup.ts          # 環境設定（型安全性向上）
    ├── audioUtils.ts        # オーディオ処理
    ├── codecUtils.ts        # コーデック処理
    ├── sessionUtils.ts      # セッション処理ユーティリティ
    ├── formatters.ts        # データフォーマット関数
    └── styles.ts            # 共通スタイル定数
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.sample` を `.env` にコピーし、OpenAI API キーを設定してください：

```bash
cp .env.sample .env
```

`.env` ファイルを編集：

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. アプリケーションへのアクセス

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使用方法

### 基本的な対話

1. **接続**: 「接続」ボタンをクリックしてセッションを開始
2. **音声速度調整**: 画面右上で希望の速度を選択（接続前に設定）
3. **音声入力**: マイクの使用を許可し、話しかける
4. **テキスト入力**: 下部のテキストボックスからメッセージを送信
5. **応答**: エージェントが設定された速度で音声とテキストで応答

### 音声速度調整機能

#### 速度レベル
- **とても遅い**: 非常にゆっくりと丁寧な発音
- **遅い**: 少しゆっくりめの理解しやすいペース
- **普通**: 自然なペース（デフォルト）
- **速い**: 少し速めの効率的なペース
- **とても速い**: 速いペースでの情報伝達

#### 使用方法
1. 画面右上の「音声速度」セレクターで希望の速度を選択
2. 接続中の場合は自動的に再接続が実行される
3. 設定はブラウザに保存され、次回訪問時も維持される

### 高度な機能

#### Push-to-Talk モード
- **自動（デフォルト）**: 音声アクティビティ検出で自動的に音声を認識
- **手動**: 「話す」ボタンを押している間のみ録音

#### オーディオ設定
- **再生制御**: エージェントの音声応答のオン/オフ
- **コーデック選択**: 
  - Opus 48kHz（高品質）
  - PCMU/PCMA 8kHz（電話品質）

#### 表示オプション
- **トランスクリプト**: 会話履歴の表示/非表示
- **イベントログ**: 技術的なログ情報の表示/非表示

## カスタマイゼーション

### エージェントの修正

`src/app/agentConfigs/simpleChat.ts` でエージェントの動作をカスタマイズできます：

```typescript
// 音声速度に応じたエージェント生成
export function createSimpleChatAgent(speechSpeed: SpeechSpeedLevel = 'normal'): RealtimeAgent {
  return new RealtimeAgent({
    name: 'simpleChat',
    voice: 'sage', // 音声モデル
    instructions: getSpeechSpeedInstruction(speechSpeed),
    tools: [], // 必要に応じてツールを追加
  });
}
```

### 音声速度のカスタマイズ

新しい速度レベルを追加する場合：

```typescript
// 新しい速度レベルを追加
export type SpeechSpeedLevel = 'very_slow' | 'slow' | 'normal' | 'fast' | 'very_fast' | 'custom';

// 対応するインストラクションを追加
function getSpeechSpeedInstruction(speed: SpeechSpeedLevel): string {
  const speedInstructions = {
    // ... 既存の設定
    custom: "カスタム速度の指示をここに追加",
  };
  // ...
}
```

### UIのカスタマイズ

`src/app/components/` 以下のReactコンポーネントを修正してUIをカスタマイズできます。

### モデレーション設定

`src/app/agentConfigs/guardrails.ts` でコンテンツモデレーションの設定を調整できます。

## 技術仕様

### 主要ライブラリ

- **@openai/agents**: OpenAI Agents SDK - エージェント定義とリアルタイム通信
- **openai**: OpenAI API クライアント
- **next**: Next.js フレームワーク（App Router）
- **react**: React UI ライブラリ
- **zod**: データバリデーション（型安全性向上）
- **uuid**: 一意識別子生成
- **react-markdown**: マークダウン表示対応
- **@radix-ui/react-icons**: アイコンライブラリ
- **tailwindcss**: スタイリング（Tailwind CSS 3.x）

### サポート機能

- **リアルタイムWebSocket通信**: 低遅延での音声・テキスト通信
- **オーディオストリーミング**: メモリリーク対策済み、自動リソース管理
- **音声認識・合成**: 日本語特化、高精度認識
- **動的インストラクション**: 音声速度に応じたエージェント動作の調整
- **コンテンツモデレーション**: 自動フィルタリング、カテゴリ分類
- **セッション状態管理**: React Context最適化、メモ化対応
- **型安全なAPI通信**: TypeScript + Zod実行時バリデーション
- **効率的な状態更新**: useCallback、useMemoによる最適化
- **メモリ使用量制限**: イベント履歴制限、リソース自動解放

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクション起動
npm start

# コードリント
npm run lint
```

## トラブルシューティング

### よくある問題

1. **OpenAI API キーエラー**
   - `.env` ファイルで `OPENAI_API_KEY` が正しく設定されているか確認
   - 開発サーバーを再起動
   - APIキーに適切な権限があるか確認

2. **マイクアクセスエラー**
   - ブラウザでマイクアクセスを許可
   - HTTPS環境での実行を推奨
   - システムのマイク設定を確認

3. **音声が聞こえない**
   - オーディオ再生が有効になっているか確認
   - システムの音量設定を確認
   - ブラウザの自動再生設定を確認

4. **音声速度が変更されない**
   - 接続前に速度を設定しているか確認
   - 接続中の場合は自動再接続を待つ
   - ブラウザの設定保存機能が有効か確認

5. **接続エラー**
   - ネットワーク接続を確認
   - ブラウザのコンソールでエラーログを確認
   - ファイアウォールの設定を確認

6. **JSON解析エラー**
   - サーバーエラーログを確認
   - OPENAI_API_KEYが有効か確認
   - ネットワーク接続の安定性を確認

### デバッグ情報

イベントログ（右側パネル）で詳細な技術情報を確認できます：
- **WebSocketイベント**: 接続状態、メッセージ送受信履歴
- **API呼び出し履歴**: リクエスト・レスポンス詳細
- **エラー詳細**: スタックトレース、エラーコード
- **パフォーマンス指標**: 遅延時間、メモリ使用量
- **セッション状態**: 音声処理状況、速度設定情報

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 参考資料

- [OpenAI Realtime API ドキュメント](https://platform.openai.com/docs/guides/realtime)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [React ドキュメント](https://react.dev/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

## パフォーマンス最適化

### 実装済み最適化

1. **メモリリーク対策**
   - MediaRecorder、AudioContextの適切な廃棄
   - イベントリスナーの自動クリーンアップ
   - メモリ使用量の制限（MAX_EVENTS = 1000）

2. **React最適化**
   - useCallback、useMemoによる不要な再レンダリング防止
   - コンポーネントの適切な分割
   - Context最適化による効率的な状態管理

3. **ネットワーク最適化**
   - WebSocket接続の最適化
   - オーディオストリーミングの効率化
   - APIリクエストの適切な制御

### 開発ガイドライン

1. **コードスタイル**: ESLint設定に従う
2. **型安全性**: TypeScriptの厳密な型チェックを維持
3. **日本語化**: 新しいコメントや文書は日本語で記述
4. **テスト**: 新機能には適切なテストを追加
5. **パフォーマンス**: メモリリークやパフォーマンス劣化を回避
