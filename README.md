# OpenAI リアルタイム音声チャットアプリケーション

このプロジェクトは、OpenAI Realtime API と OpenAI Agents SDK を使用したシンプルな音声チャットアプリケーションです。日本語での自然な音声対話を提供する Next.js アプリケーションとして実装されています。

## 概要

本アプリケーションは、複雑なマルチエージェントシステムを排除し、一般的な音声チャットに特化したシンプルな実装を提供します。ユーザーは音声またはテキストを通じて AI エージェントと自然な日本語での対話を行うことができます。

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
- **デュアル入力**: 音声とテキストの両方での入力対応
- **Push-to-Talk**: サーバーVADまたは手動音声入力の選択
- **コーデック選択**: 高品質（Opus 48kHz）および電話品質（PCMU/PCMA 8kHz）音声
- **モデレーション**: 不適切なコンテンツの自動検出とフィルタリング

## プロジェクト構造

```
src/app/
├── agentConfigs/         # エージェント設定ファイル
│   ├── simpleChat.ts     # メインチャットエージェント定義
│   ├── index.ts          # エージェント設定の統合
│   ├── guardrails.ts     # モデレーション機能
│   └── types.ts          # 型定義
├── api/                  # バックエンドAPIエンドポイント
│   ├── session/          # セッション管理
│   └── responses/        # レスポンス処理
├── components/           # UIコンポーネント
│   ├── Transcript.tsx    # 会話履歴表示
│   ├── Events.tsx        # イベントログ
│   └── BottomToolbar.tsx # 操作パネル
├── contexts/            # React Context（状態管理）
│   ├── TranscriptContext.tsx # 会話履歴状態
│   └── EventContext.tsx     # イベント状態
├── hooks/               # カスタムReactフック
│   ├── useRealtimeSession.ts # セッション管理
│   └── useAudioDownload.ts   # オーディオ録音
└── lib/                 # ユーティリティ関数
    ├── envSetup.ts      # 環境設定
    ├── audioUtils.ts    # オーディオ処理
    └── codecUtils.ts    # コーデック処理
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
2. **音声入力**: マイクの使用を許可し、話しかける
3. **テキスト入力**: 下部のテキストボックスからメッセージを送信
4. **応答**: エージェントが音声とテキストで応答

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
export const simpleChatAgent = new RealtimeAgent({
  name: 'simpleChat',
  voice: 'sage', // 音声モデル
  instructions: "カスタムインストラクション...",
  tools: [], // 必要に応じてツールを追加
});
```

### UIのカスタマイズ

`src/app/components/` 以下のReactコンポーネントを修正してUIをカスタマイズできます。

### モデレーション設定

`src/app/agentConfigs/guardrails.ts` でコンテンツモデレーションの設定を調整できます。

## 技術仕様

### 主要ライブラリ

- **@openai/agents**: OpenAI Agents SDK
- **openai**: OpenAI API クライアント
- **next**: Next.js フレームワーク
- **react**: React UI ライブラリ
- **zod**: データバリデーション

### サポート機能

- リアルタイムWebSocket通信
- オーディオストリーミング
- 音声認識・合成
- コンテンツモデレーション
- セッション状態管理

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

2. **マイクアクセスエラー**
   - ブラウザでマイクアクセスを許可
   - HTTPS環境での実行を推奨

3. **音声が聞こえない**
   - オーディオ再生が有効になっているか確認
   - システムの音量設定を確認

4. **接続エラー**
   - ネットワーク接続を確認
   - ブラウザのコンソールでエラーログを確認

### デバッグ情報

イベントログ（右側パネル）で詳細な技術情報を確認できます：
- WebSocketイベント
- API呼び出し履歴
- エラー詳細
- パフォーマンス指標

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 参考資料

- [OpenAI Realtime API ドキュメント](https://platform.openai.com/docs/guides/realtime)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents)
- [Next.js ドキュメント](https://nextjs.org/docs)