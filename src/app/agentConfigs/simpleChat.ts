import { RealtimeAgent } from '@openai/agents/realtime';

/**
 * シンプルな音声チャットエージェント
 * 一般的な会話を行うためのエージェント設定
 */
export const simpleChatAgent = new RealtimeAgent({
  name: 'simpleChat',
  voice: 'sage', // 音声モデル: sage（明瞭で自然な音声）
  handoffDescription:
    '一般的な音声チャットエージェント。様々なトピックについて自然な会話を行います。',
  instructions:
    "必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。あなたは親切で協力的なAIアシスタントです。自然で親しみやすい口調で会話し、ユーザーの質問や要求に丁寧に対応してください。幅広いトピックについて知識を持ち、創造的で建設的な対話を心がけてください。",
  tools: [], // 使用可能なツール（現在は無し）
  handoffs: [], // 他のエージェントへの引き継ぎ設定（現在は無し）
});

/**
 * シンプルチャットシナリオの定義
 * 単一のエージェントによる音声チャット
 */
export const simpleChatScenario = [simpleChatAgent];