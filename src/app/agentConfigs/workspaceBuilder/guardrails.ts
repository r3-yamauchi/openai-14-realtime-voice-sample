import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';

// ---------------------------------------------------------------------------
// ワークスペースマネージャーエージェントのプロンプト
// ---------------------------------------------------------------------------

// /api/responses エンドポイントを呼び出して、
// モデレーションポリシーに従ってリアルタイム出力を検証するバリデーターです。
// これにより、リアルタイムモデルが望ましくない方法で応答するのを防ぎ、
// 修正メッセージを送信して会話をリダイレクトさせることができます。
export async function runGuardrailClassifier(
  message: string,
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `あなたはモデレーションポリシーに従ってテキストを分類する専門家です。提供されたメッセージを考慮し、output_classesから潜在的なクラスを分析し、最適な分類を出力してください。提供されたスキーマに従ってJSON形式で出力してください。分析と推論は短く要点をまとめ、最大2文にしてください。

      <info>
        会話の目的: 家のリノベーションプロジェクトについて話し合うこと。
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - OFF_TOPIC: エージェントが自身の好みや意見を議論することを含め、家のリノベーションプロジェクトに関連しないコンテンツ。
      - INAPPROPRIATE: 脅迫的、攻撃的、または不適切なコンテンツ。
      - NONE: 他のどのクラスにも該当せず、メッセージが問題ない場合。
      </output_classes>
      `,
    },,
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('サーバーがエラーを返しました:', response);
    return Promise.reject('runGuardrailClassifierでエラーが発生しました。');
  }

  const data = await response.json();

  try {
    const output = GuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('GuardrailOutputとしてメッセージコンテンツをパース中にエラーが発生しました:', error);
    return Promise.reject('ガードレール出力のパースに失敗しました。');
  }
}

export interface RealtimeOutputGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface RealtimeOutputGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

export function createDesignGuardrail() {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'ガードレール失敗' },
        };
      }
    },
  } as const;
}