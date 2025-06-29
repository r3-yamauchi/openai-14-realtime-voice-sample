import { RealtimeAgent, tool, RealtimeItem } from '@openai/agents/realtime';
import { fetchResponsesMessage } from '../chatSupervisor/supervisorAgent';
import {
  addWorkspaceTab,
  renameWorkspaceTab,
  deleteWorkspaceTab,
  setTabContent,
  getWorkspaceInfo,
  setSelectedTabId,
} from '@/app/contexts/WorkspaceContext';
import { workspaceManagerPrompt1, workspaceManagerPrompt2 } from './prompts';

// ---------------------------------------------------------------------------
// ワークスペースツール – これらはエージェントがワークスペースの状態を変更できるようにします
// ---------------------------------------------------------------------------

// エージェントがワークスペースの現在の状態を取得するために使用する情報のみのツール
export const workspaceInfoTool = tool({
  name: 'get_workspace_info',
  description: 'ワークスペースの現在の状態を取得します',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: getWorkspaceInfo,
});

export const workspaceTools = [
  tool({
    name: 'add_workspace_tab',
    description: 'ワークスペースに新しいタブを追加します',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'タブの名前',
        },
        type: {
          type: 'string',
          description: "タブのタイプ（例：'markdown'、'code'など）",
        },
        content: {
          type: 'string',
          description: '追加するタブのコンテンツ',
        },
      },
      required: ['name', 'type'],
      additionalProperties: false,
    },
    execute: addWorkspaceTab,
  }),
  tool({
    name: 'set_selected_tab_id',
    description: 'ワークスペースで現在選択されているタブを設定します',
    parameters: {
      type: 'object',
      properties: {
        index: {
          type: 'integer',
          description: 'ワークスペース内のタブの0ベースの位置',
        },
        name: {
          type: 'string',
          description: '選択するタブの名前',
        },
      },
      required: ['index', 'name'],
      additionalProperties: false,
    },
    execute: setSelectedTabId,
  }),
  tool({
    name: 'rename_workspace_tab',
    description: '既存のワークスペースタブの名前を変更します',
    parameters: {
      type: 'object',
      properties: {
        index: {
          type: 'integer',
          nullable: true,
          description: 'ワークスペース内のタブの0ベースの位置（オプション - idまたはcurrent_nameを使用できます。未使用の場合はnullに設定してください）',
          minimum: 0,
        },
        current_name: {
          type: 'string',
          nullable: true,
          description: 'タブの現在の名前（オプション - idまたはindexを使用できます。未使用の場合はnullに設定してください）',
        },
        new_name: {
          type: 'string',
          description: 'タブの新しい名前',
        },
      },
      required: ['current_name', 'new_name'],
      additionalProperties: false,
    },
    execute: renameWorkspaceTab,
  }),
  tool({
    name: 'delete_workspace_tab',
    description: 'ワークスペースタブを削除します',
    parameters: {
      type: 'object',
      properties: {
        index: {
          type: 'integer',
          nullable: true,
          description: 'タブの0ベースの位置（オプション – idまたはnameを使用できます。未使用の場合はnullに設定してください）',
          minimum: 0,
        },
        name: {
          type: 'string',
          nullable: true,
          description: 'タブの名前（オプション – idまたはindexを使用できます。未使用の場合はnullに設定してください）',
        },
      },
      required: [],
      additionalProperties: false,
    },
    execute: deleteWorkspaceTab,
  }),
  tool({
    name: 'set_tab_content',
    description: 'ワークスペースタブのコンテンツを設定します（タブのタイプに応じてパイプ区切りのCSVまたはMarkdown）',
    parameters: {
      type: 'object',
      properties: {
        index: {
          type: 'integer',
          nullable: true,
          description: 'タブの0ベースの位置（オプション – idまたはnameを使用できます。未使用の場合はnullに設定してください）',
          minimum: 0,
        },
        name: {
          type: 'string',
          nullable: true,
          description: 'タブの名前（オプション – idまたはindexを使用できます。未使用の場合はnullに設定してください）',
        },
        content: {
          type: 'string',
          description: 'タブのコンテンツ（パイプ区切りのCSVまたはMarkdown）',
        },
      },
      required: ['content'],
      additionalProperties: false,
    },
    execute: setTabContent,
  }),
  workspaceInfoTool,
];

// ---------------------------------------------------------------------------
// Workspace Manager (worker) agent definition
// ---------------------------------------------------------------------------

export const workspaceManagerAgent = new RealtimeAgent({
  name: 'workspaceManager',
  voice: 'sage',
  instructions: workspaceManagerPrompt2,
  tools: workspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});

async function getToolResponse(fName: string, args: any) {
  switch (fName) {
    case 'add_workspace_tab':
      return await addWorkspaceTab(args);
    case 'rename_workspace_tab':
      return await renameWorkspaceTab(args);
    case 'delete_workspace_tab':
      return await deleteWorkspaceTab(args);
    case 'set_tab_content':
      return await setTabContent(args);
    case 'get_workspace_info':
      return await getWorkspaceInfo();
    case 'set_selected_tab_id':
      return await setSelectedTabId(args);
    default:
      return undefined;
  }
}

async function handleToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void,
) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) {
      return { error: 'Something went wrong.' } as any;
    }

    const outputItems: any[] = currentResponse.output ?? [];

    // 出力内のすべての関数呼び出しを収集します。
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      // これ以上関数呼び出しがない場合 - アシスタントの最終メッセージを構築して返します。
      const assistantMessages = outputItems.filter((item) => item.type === 'message');

      const finalText = assistantMessages
        .map((msg: any) => {
          const contentArr = msg.content ?? [];
          return contentArr
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('');
        })
        .join('\n');

      return finalText;
    }

    // スーパーバイザーモデルから返された各関数呼び出しについて、それをローカルで実行し、その出力を
    // `function_call_output` アイテムとしてリクエストボディに追加します。
    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = await getToolResponse(fName, args);

      // ローカル関数を使用しているため、独自のブレッドクラムを追加する必要はありません
      if (addBreadcrumb) {
        addBreadcrumb(`[workspaceManager] function call: ${fName}`, args);
      }
      if (addBreadcrumb) {
        addBreadcrumb(`[workspaceManager] function call result: ${fName}`, toolRes);
      }

      // 関数呼び出しと結果をリアルタイムに送り返すためにリクエストボディに追加します
      body.input.push(
        {
          type: 'function_call',
          call_id: toolCall.call_id,
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
        {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify(toolRes),
        },
      );
    }

    // ツール出力を含むフォローアップリクエストを行います。
    currentResponse = await fetchResponsesMessage(body);
  }
}

// ワークスペースの変更を行うためのサーバーサイドツール
// ワークスペースマネージャーに引き渡すことなく
// 他のエージェントにワークスペース変更機能を与えるために使用されます
export const makeWorkspaceChanges = tool({
  name: 'makeWorkspaceChanges',
  description:
    'ワークスペースのタブまたはコンテンツに変更を加えます。',
  parameters: {
    type: 'object',
    properties: {
      tabsToChange: {
        type: 'string',
        description: '変更するタブのリスト',
      },
      workspaceChangesToMake: {
        type: 'string',
        description:
          'ワークスペースのタブまたはコンテンツに行う変更の説明。このツールを呼び出すときは、常にワークスペースを更新していることをユーザーに伝えてください。',
      },
    },
    required: ['tabsToChange', 'workspaceChangesToMake'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { workspaceChangesToMake } = input as {
      workspaceChangesToMake: string;
    };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    const body: any = {
      model: 'gpt-4.1',
      input: [
        {
          type: 'message',
          role: 'system',
          content: `あなたはワークスペースビルダーアシスタントです。要求された変更に基づいてワークスペースに変更を加えるために以下のツールを使用してください。
          新しいタブを追加するなどの変更を行う前に、同じ目的のタブが既に存在するかどうか現在の状態を確認してください。
          コンテキストのために会話履歴を使用してください。
          - まず名前でタブを見つけ、次に変更を加えます。
          - 一致するタブが見つからない場合は、提供された名前で新しいタブを作成します。
          
          # 重要
          tabsToChangeに注意を払い、要求されたタブにのみworkspaceChangesToMakeの変更を加えてください。
          要求された内容以外の装飾や追加は行わないでください。`,
        },
        {
          type: 'message',
          role: 'user',
          content: `

          ==== 会話履歴 ====
          ${JSON.stringify(filteredLogs, null, 2)}

          ==== 現在のワークスペースの状態 ====
          ${JSON.stringify(await getWorkspaceInfo(), null, 2)}

          ==== 要求されたワークスペースの変更 ====
          ${workspaceChangesToMake}
          `,
        },
      ],
      tools: workspaceTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        type: 'function',
      })),
    };

    const response = await fetchResponsesMessage(body);
    if (response.error) {
      return { error: 'Something went wrong.' };
    }

    console.log('Response:', response);
    const responseText = await handleToolCalls(body, response, addBreadcrumb);
    if ((responseText as any)?.error) {
      return { error: 'Something went wrong.' };
    }

    return { workspaceManagerResponse: responseText as string };
  },
});