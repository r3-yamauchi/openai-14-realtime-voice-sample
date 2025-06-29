import { RealtimeAgent } from '@openai/agents/realtime';
import { makeWorkspaceChanges, workspaceInfoTool } from './workspaceManager';
import { RealtimeItem, tool } from '@openai/agents/realtime';
import { fetchResponsesMessage } from '../chatSupervisor/supervisorAgent';
import { materialsPrompt1 } from './prompts';

// TODO: これは材料データベースを検索するためにMCP接続を使用できる可能性があります。
const searchMaterials = tool({
  name: 'searchMaterials',
  description:
    '役立つ情報を材料および供給データベースで検索します。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          '材料と供給品を見つけるための検索クエリ',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { query } = input as { query: string };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    addBreadcrumb?.('[web search]', { query });

    const body = {
        model: "gpt-4.1",
        tools: [ { type: "web_search_preview" } ],
        input: `あなたは材料および供給アシスタントです。
        会話履歴に基づいて、検索クエリに関連する情報でウェブを検索し、応答してください。
        
        ==== 最近の会話履歴 ====
        ${JSON.stringify(filteredLogs, null, 2)}
        
        ==== 検索クエリ ====
        ${query}`,
    };

    const response = await fetchResponsesMessage(body);
    const responseText = response.output_text;
    addBreadcrumb?.('[materials search] response', { responseText });
    if (response.error) {
      return { error: '何か問題が発生しました。' };
    }

    return { webResponse: responseText as string };
  },
});

export const materialsAgent = new RealtimeAgent({
  name: 'materialsAndSupplies',
  voice: 'sage',
  instructions: materialsPrompt1,
  tools: [searchMaterials, workspaceInfoTool, makeWorkspaceChanges],
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});

