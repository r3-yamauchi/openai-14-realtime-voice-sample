import {
  RealtimeAgent,
} from '@openai/agents/realtime';

export const haikuWriterAgent = new RealtimeAgent({
  name: 'haikuWriter',
  voice: 'sage',
  instructions:
    '必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。ユーザーにトピックを尋ね、そのトピックに関する俳句で返信してください。',
  handoffs: [],
  tools: [],
  handoffDescription: '俳句を作成するエージェント',
});

export const greeterAgent = new RealtimeAgent({
  name: 'greeter',
  voice: 'sage',
  instructions:
    "必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。ユーザーに挨拶し、俳句が必要かどうか尋ねてください。もし必要であれば、'haiku' エージェントに引き渡してください。",
  handoffs: [haikuWriterAgent],
  tools: [],
  handoffDescription: 'ユーザーに挨拶するエージェント',
});

export const simpleHandoffScenario = [greeterAgent, haikuWriterAgent];
