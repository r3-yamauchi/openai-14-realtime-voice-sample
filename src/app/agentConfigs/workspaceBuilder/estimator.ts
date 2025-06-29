import { RealtimeAgent } from '@openai/agents/realtime';
import { makeWorkspaceChanges, workspaceInfoTool } from './workspaceManager';
import { RealtimeItem, tool } from '@openai/agents/realtime';
import { fetchResponsesMessage } from '../chatSupervisor/supervisorAgent';
import { estimatorPrompt1 } from './prompts';

const calculate = tool({
  name: 'calculate',
  description:
    '建設費用または建設計画のタイムラインを計算します。',
  parameters: {
    type: 'object',
    properties: {
      data_to_calculate: {
        type: 'string',
        description:
          '計算する建設費用または建設計画のタイムラインの詳細な説明。',
      },
    },
    required: ['data_to_calculate'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { data_to_calculate } = input as { data_to_calculate: string };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    addBreadcrumb?.('[calculate]', { data_to_calculate });

    const body = {
      model: "gpt-4.1",
      tools: [
        {
          type: "code_interpreter",
          container: { type: "auto" }
        }
      ],
      instructions: "あなたは建設予算見積もり計算機およびタイムライン計画アシスタントです。質問されたら、コードインタープリターでコードを記述して実行し、質問に答えてください。",
      input: `==== 関連する会話履歴 ====
      ${JSON.stringify(filteredLogs, null, 2)}
      
      ==== 要求された計算 ====
      ${data_to_calculate}`,
    };

    console.log('Body:', body);
    const response = await fetchResponsesMessage(body);
    console.log('Response:', response);
    const responseText = response.output_text;
    console.log('Response Text:', responseText);
    addBreadcrumb?.('[calculate] response', { responseText });
    if (response.error) {
      return { error: '何か問題が発生しました。' };
    }

    return { calculatorResponse: responseText as string };
  },
});

export const estimatorAgent = new RealtimeAgent({
  name: 'estimator',

  voice: 'sage',
  instructions: estimatorPrompt1,
  tools: [calculate,workspaceInfoTool, makeWorkspaceChanges],
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});
