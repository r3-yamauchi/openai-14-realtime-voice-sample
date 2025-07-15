import { simpleChatScenario } from './simpleChat';

import type { RealtimeAgent } from '@openai/agents/realtime';

/**
 * 全エージェントセットの定義
 * シナリオキーと RealtimeAgent オブジェクトの配列のマッピング
 */
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleChat: simpleChatScenario, // シンプル音声チャットシナリオ
};

/**
 * デフォルトで使用するエージェントセットのキー
 */
export const defaultAgentSetKey = 'simpleChat';
