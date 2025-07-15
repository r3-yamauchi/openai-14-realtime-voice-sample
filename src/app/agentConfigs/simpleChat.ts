import { RealtimeAgent } from '@openai/agents/realtime';

/**
 * 音声速度レベルの定義
 */
export type SpeechSpeedLevel = 'very_slow' | 'slow' | 'normal' | 'fast' | 'very_fast';

/**
 * 音声速度に応じたインストラクション生成
 */
function getSpeechSpeedInstruction(speed: SpeechSpeedLevel): string {
  const speedInstructions = {
    very_slow: "非常にゆっくりと、一語一語を丁寧に発音して話してください。間を十分に取りながら、落ち着いたペースで会話してください。",
    slow: "少しゆっくりめに話してください。相手が理解しやすいよう、適度な間を取りながら話してください。",
    normal: "自然なペースで話してください。",
    fast: "少し速めのペースで話してください。ただし、聞き取りやすさを保つよう注意してください。",
    very_fast: "速いペースで話してください。効率的に情報を伝達しながらも、明瞭性を保ってください。"
  };

  const baseInstruction = "必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。あなたは親切で協力的なAIアシスタントです。自然で親しみやすい口調で会話し、ユーザーの質問や要求に丁寧に対応してください。幅広いトピックについて知識を持ち、創造的で建設的な対話を心がけてください。";
  
  return `${baseInstruction} ${speedInstructions[speed]}`;
}

/**
 * 音声速度に応じたエージェント生成
 */
export function createSimpleChatAgent(speechSpeed: SpeechSpeedLevel = 'normal'): RealtimeAgent {
  return new RealtimeAgent({
    name: 'simpleChat',
    voice: 'sage', // 音声モデル: sage（明瞭で自然な音声）
    handoffDescription:
      '一般的な音声チャットエージェント。様々なトピックについて自然な会話を行います。',
    instructions: getSpeechSpeedInstruction(speechSpeed),
    tools: [], // 使用可能なツール（現在は無し）
    handoffs: [], // 他のエージェントへの引き継ぎ設定（現在は無し）
  });
}

/**
 * シンプルな音声チャットエージェント
 * 一般的な会話を行うためのエージェント設定
 */
export const simpleChatAgent = createSimpleChatAgent();

/**
 * シンプルチャットシナリオの定義
 * 単一のエージェントによる音声チャット
 */
export const simpleChatScenario = [simpleChatAgent];