/**
 * エージェント設定用の型定義ファイル
 * OpenAI Agents SDKから必要な型とツールを中央集約的に再エクスポート
 * エージェントファイルが深いSDKパスにアクセスする必要性を排除
 */

export { tool } from '@openai/agents/realtime';
export type { RealtimeAgent, FunctionTool } from '@openai/agents/realtime';
