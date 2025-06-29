# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

これはOpenAI Realtime APIとOpenAI Agents SDKを使用したリアルタイム音声エージェントのNext.jsアプリケーションです。日本語での音声対話を中心とした複数のエージェントシナリオを実装しています。

## 開発コマンド

- **開発サーバー起動**: `npm run dev`
- **プロダクションビルド**: `npm run build`
- **プロダクション起動**: `npm start`
- **リント**: `npm run lint`
- **依存関係インストール**: `npm i`

## セットアップ

1. `.env.sample`を`.env`にコピーし、`OPENAI_API_KEY`を設定
2. `npm i`で依存関係をインストール
3. `npm run dev`で開発サーバーを起動
4. ブラウザで`http://localhost:3000`を開く

## アーキテクチャ

### エージェント構成

- **エージェント定義**: `src/app/agentConfigs/`以下に各シナリオのエージェント設定を配置
- **Responder-Thinkerパターン**: 即座に応答するResponderエージェントと複雑な処理を行うThinkerエージェントが連携
- **マルチエージェント**: 複数のエージェントが協調してタスクを実行

### 主要ディレクトリ構造

- `src/app/agentConfigs/`: エージェント定義と設定（各シナリオごと）
- `src/app/api/`: セッション管理とレスポンス処理のAPIエンドポイント
- `src/app/contexts/`: アプリケーション状態管理（イベント、トランスクリプト、ワークスペース）
- `src/app/hooks/`: リアルタイムセッション管理とオーディオ処理のカスタムフック
- `src/app/components/`: UI コンポーネント

### エージェントシナリオ

1. **workspaceBuilder**: ワークスペース構築エージェント（デフォルト）
2. **customerServiceRetail**: 小売業顧客サービスエージェント
3. **chatSupervisor**: 会話監督エージェント
4. **simpleHandoff**: シンプルなハンドオフエージェント

## 新しいエージェントの追加方法

1. `src/app/agentConfigs/`以下に新しいディレクトリを作成
2. `index.ts`で`RealtimeAgent[]`を export
3. `src/app/agentConfigs/index.ts`の`allAgentSets`に追加
4. 必要に応じて`src/app/App.tsx`でガードレールを設定

## 重要な技術要素

### OpenAI Agents SDK

- `@openai/agents`を使用してエージェントを定義
- `tool`関数でカスタムツールを作成
- `RealtimeAgent`インターフェースで統一された設定

### 状態管理

- React Contextを使用（EventContext、TranscriptContext、WorkspaceContext）
- `useRealtimeSession`フックでセッション管理
- セッション履歴とオーディオ録音の処理

### 音声処理

- サーバーVADとPush-to-Talkの切り替え
- コーデック選択（Opus 48kHz / PCMU・PCMA 8kHz）
- リアルタイム音声ストリーミング

## 日本語対応

- プロンプトとインストラクションは日本語で記述
- コメントも日本語に統一
- 日本語音声認識とTTSに対応

## ガードレール

- モデレーションガードレール（不適切なコンテンツの検出）
- デザインガードレール（workspaceBuilderシナリオ用）
- カスタムガードレールの実装可能

## ツール統合

- エージェントは`tools`プロパティでカスタムツールを使用
- 非同期ツール実行とレスポンス処理
- ツール呼び出しの履歴とデバッグ情報

## トラブルシューティング

- OpenAI API キーの確認
- マイクアクセス許可の確認
- ネットワーク接続とAPI リクエストの確認
- エージェント設定ファイルの検証