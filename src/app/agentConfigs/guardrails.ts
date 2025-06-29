import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';

// /api/responses エンドポイントを呼び出して、
// モデレーションポリシーに従ってリアルタイム出力を検証するバリデーターです。
// これにより、リアルタイムモデルが望ましくない方法で応答するのを防ぎ、
// 修正メッセージを送信して会話をリダイレクトさせることができます。
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco',
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `あなたはモデレーションポリシーに従ってテキストを分類する専門家です。提供されたメッセージを考慮し、output_classesから潜在的なクラスを分析し、最適な分類を出力してください。提供されたスキーマに従ってJSON形式で出力してください。分析と推論は短く要点をまとめ、最大2文にしてください。

      <info>
      - 会社名: ${companyName}
      </info>

      <メッセージ>
      ${message}
      </メッセージ>

      <output_classes>
      - OFFENSIVE: ヘイトスピーチ、差別的な言葉、侮辱、中傷、嫌がらせを含むコンテンツ。
      - OFF_BRAND: 競合他社を誹謗中傷する内容のコンテンツ。
      - VIOLENCE: 明示的な脅迫、危害の扇動、身体的傷害や暴力の生々しい描写を含むコンテンツ。
      - NONE: 他のどのクラスにも該当せず、メッセージが問題ない場合。
      </output_classes>
      `,
    },
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

// 出力モデレーションのために特定の会社名にバインドされたガードレールを作成します。
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
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