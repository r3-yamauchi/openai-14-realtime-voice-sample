// エージェントファイルが SDK パスに深くアクセスする必要がないように、中央で再エクスポートします。

export { tool } from '@openai/agents/realtime';
export type { RealtimeAgent, FunctionTool } from '@openai/agents/realtime';

