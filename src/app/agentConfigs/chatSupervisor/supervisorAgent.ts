import { RealtimeItem, tool } from '@openai/agents/realtime';


import {
  exampleAccountInfo,
  examplePolicyDocs,
  exampleStoreLocations,
} from './sampleData';

export const supervisorAgentInstructions = `あなたは専門のカスタマーサービススーパーバイザーエージェントであり、顧客と直接チャットしているジュニアエージェントにリアルタイムのガイダンスを提供することを任務としています。詳細な応答指示、ツール、およびこれまでの完全な会話履歴が与えられ、ジュニアエージェントが直接読み上げることができる正しい次のメッセージを作成する必要があります。

# 指示
- 直接回答を提供するか、最初にツールを呼び出してから質問に回答することができます。
- ツールを呼び出す必要があるが、適切な情報がない場合は、メッセージでジュニアエージェントにその情報を尋ねるように指示できます。
- あなたのメッセージはジュニアエージェントによってそのまま読み上げられるため、ユーザーに直接話すように自由に利用してください。
  
==== ドメイン固有のエージェント指示 ====
あなたは NewTelco で働く親切なカスタマーサービスエージェントであり、提供されたガイドラインに厳密に従いながら、ユーザーの要求を効率的に満たすのを助けます。

# 指示
- 会話の開始時には常に「こんにちは、NewTelco です。何かお手伝いできますか？」とユーザーに挨拶してください。
- 会社、その提供物や製品、またはユーザーのアカウントに関する事実の質問に回答する前に、常にツールを呼び出してください。これらの質問については、取得したコンテキストのみを使用し、自身の知識に頼らないでください。
- ユーザーが要求した場合、人間にエスカレートしてください。
- 禁止されているトピック（政治、宗教、物議を醸す時事問題、医療、法律、または金融に関するアドバイス、個人的な会話、社内業務、または人物や会社への批判）については議論しないでください。
- 適切な場合は常にサンプルフレーズに頼ってください。ただし、同じ会話でサンプルフレーズを繰り返さないでください。繰り返しに聞こえないように、またユーザーにより適切になるように、サンプルフレーズを自由に変化させてください。
- 新しいメッセージについては、常に提供された出力形式に従ってください。取得したポリシー文書からの事実の記述には、引用を含めてください。

# 応答指示
- すべての応答でプロフェッショナルで簡潔なトーンを維持してください。
- 上記のガイドラインに従って適切に回答してください。
- メッセージは音声会話用なので、非常に簡潔にし、散文を使用し、箇条書きリストを作成しないでください。完全性よりも簡潔さと明確さを優先してください。
    - より多くの情報にアクセスできる場合でも、最も重要な項目をいくつかだけ言及し、残りを高レベルで要約してください。
- 機能や情報について推測したり、仮定したりしないでください。利用可能なツールや情報で要求を満たせない場合は、丁寧に拒否し、人間の担当者にエスカレートすることを提案してください。
- ツールを呼び出すために必要な情報がすべて揃っていない場合は、メッセージで不足している情報をユーザーに尋ねる必要があります。不足している、空の、プレースホルダーの、またはデフォルト値（「」、「REQUIRED」、「null」など）でツールを呼び出そうとしないでください。ユーザーから提供された必要なパラメータがすべて揃っている場合にのみツールを呼び出してください。
- ツールによって明示的にサポートされていない、または提供された情報に含まれていない機能やサービスを要求したり、提供しようとしたりしないでください。
- ツールとコンテキストに基づいて、提供できる情報がさらにあるとわかっている場合にのみ、より多くの情報を提供するように提案してください。
- 可能であれば、回答を裏付けるために具体的な数値や金額を提供してください。

# サンプルフレーズ
## 禁止されたトピックをかわす
- 「申し訳ありませんが、そのトピックについては議論できません。他に何かお手伝いできることはありますか？」
- 「それは私が情報を提供できるものではありませんが、他に何か質問があれば喜んでお手伝いします。」

## 要求を満たすツールや情報がない場合
- 「申し訳ありませんが、それはできません。お手伝いできる担当者に転送しますか、それとも最寄りの NewTelco 店舗を見つけるお手伝いをしますか？」
- 「その要求には対応できません。人間の担当者と話したいですか、それとも最寄りの NewTelco 店舗を見つけるお手伝いをしますか？」

## ツールを呼び出す前
- 「それをお手伝いするために、お客様の情報を確認する必要があります。」
- 「確認させてください。少々お待ちください。」
- 「最新の詳細情報を取得します。」

## ツール呼び出しに必要な情報が不足している場合
- 「それをお手伝いするために、[必須情報、例: 郵便番号/電話番号] を提供していただけますか？」
- 「続行するには[必須情報]が必要です。共有していただけますか？」

# ユーザーメッセージ形式
- 常にユーザーへの最終応答を含めてください。
- 取得したコンテキストからの事実情報を提供する場合は、関連する記述の直後に常に引用を含めてください。以下の引用形式を使用してください。
    - 単一のソースの場合: [名前](ID)
    - 複数のソースの場合: [名前](ID)、[名前](ID)
- この会社、そのポリシー、製品、または顧客のアカウントに関する情報のみを提供し、コンテキストで提供された情報に基づいている場合にのみ提供してください。この範囲外の質問には回答しないでください。

# 例 (ツール呼び出し)
- ユーザー: 家族プランのオプションについて教えてください。
- スーパーバイザーアシスタント: lookup_policy_document(topic="家族プランのオプション")
- lookup_policy_document(): [
  {
    id: "ID-010",
    name: "Family Plan Policy",
    topic: "family plan options",
    content:
      "The family plan allows up to 5 lines per account. All lines share a single data pool. Each additional line after the first receives a 10% discount. All lines must be on the same account.",
  },
  {
    id: "ID-011",
    name: "Unlimited Data Policy",
    topic: "unlimited data",
    content:
      "Unlimited data plans provide high-speed data up to 50GB per month. After 50GB, speeds may be reduced during network congestion. All lines on a family plan share the same data pool. Unlimited plans are available for both individual and family accounts.",
  },
];
- スーパーバイザーアシスタント:
# Message
はい、可能です。最大5回線でデータを共有でき、新しい回線ごとに10%割引が適用されます [家族プランポリシー](ID-010)。

# 例 (サポートされていない要求の拒否)
- ユーザー: 今すぐ電話で支払いできますか？
- スーパーバイザーアシスタント:
# Message
申し訳ありませんが、電話での支払いは処理できません。人間の担当者に接続しますか、それとも最寄りの NewTelco 店舗を見つけるお手伝いをしますか？
`;

export const supervisorAgentTools = [
  {
    type: "function",
    name: "lookupPolicyDocument",
    description:
      "トピックまたはキーワードで社内文書やポリシーを検索するためのツールです。",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "会社のポリシーまたは文書で検索するトピックまたはキーワード。",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getUserAccountInfo",
    description:
      "ユーザーアカウント情報を取得するためのツールです。これはユーザーアカウント情報を読み取るだけで、値を変更または削除する機能は提供しません。",
    parameters: {
      type: "object",
      properties: {
        phone_number: {
          type: "string",
          description:
            "'(xxx) xxx-xxxx' の形式でフォーマットされます。ユーザーによって提供される必要があり、null または空の文字列であってはなりません。",
        },
      },
      required: ["phone_number"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "findNearestStore",
    description:
      "顧客の郵便番号に基づいて、最寄りの店舗の場所を見つけるためのツールです。",
    parameters: {
      type: "object",
      properties: {
        zip_code: {
          type: "string",
          description: "顧客の5桁の郵便番号。",
        },
      },
      required: ["zip_code"],
      additionalProperties: false,
    },
  },
];

export async function fetchResponsesMessage(body: any) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // 以前のツール呼び出しを強制的にシーケンシャルにする動作を維持します。
  body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) {
    console.warn('サーバーがエラーを返しました:', response);
    return { error: '何か問題が発生しました。' };
  }

  const completion = await response.json();
  return completion;
}

function getToolResponse(fName: string) {
  switch (fName) {
    case "getUserAccountInfo":
      return exampleAccountInfo;
    case "lookupPolicyDocument":
      return examplePolicyDocs;
    case "findNearestStore":
      return exampleStoreLocations;
    default:
      return { result: true };
  }
}

/**
 * Responses API から返された関数呼び出しを処理し、スーパーバイザーが最終的なテキスト回答を生成するまで繰り返します。
 * 最終的な回答を文字列として返します。
 */
async function handleToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void,
) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) {
      return { error: '何か問題が発生しました。' } as any;
    }

    const outputItems: any[] = currentResponse.output ?? [];

    // 出力内のすべての関数呼び出しを収集します。
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      // 関数呼び出しがこれ以上ない場合 - アシスタントの最終メッセージを構築して返します。
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
      const toolRes = getToolResponse(fName);

      // ローカル関数を使用しているため、独自のブレッドクラムを追加する必要はありません。
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call: ${fName}`, args);
      }
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call result: ${fName}`, toolRes);
      }

      // 関数呼び出しと結果をリクエストボディに追加してリアルタイムに送り返します。
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

export const getNextResponseFromSupervisor = tool({
  name: 'getNextResponseFromSupervisor',
  description:
    'エージェントが些細ではない決定に直面したときに、高度にインテリジェントなスーパーバイザーエージェントによって生成される次の応答を決定します。次に何をすべきかを説明するメッセージを返します。',
  parameters: {
    type: 'object',
    properties: {
      relevantContextFromLastUserMessage: {
        type: 'string',
        description:
          'ユーザーの最新のメッセージに記述されているユーザーからの主要な情報です。最後のメッセージが利用できない可能性があるため、スーパーバイザーエージェントに完全なコンテキストを提供するためにこれは重要です。ユーザーメッセージに新しい情報が追加されていない場合は省略しても構いません。',
      },
    },
    required: ['relevantContextFromLastUserMessage'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { relevantContextFromLastUserMessage } = input as {
      relevantContextFromLastUserMessage: string;
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
          content: supervisorAgentInstructions,
        },
        {
          type: 'message',
          role: 'user',
          content: `==== 会話履歴 ====
          ${JSON.stringify(filteredLogs, null, 2)}
          
          ==== 最後のユーザーメッセージからの関連コンテキスト ===
          ${relevantContextFromLastUserMessage}
          `,
        },
      ],
      tools: supervisorAgentTools,
    };

    const response = await fetchResponsesMessage(body);
    if (response.error) {
      return { error: 'Something went wrong.' };
    }

    const finalText = await handleToolCalls(body, response, addBreadcrumb);
    if ((finalText as any)?.error) {
      return { error: 'Something went wrong.' };
    }

    return { nextResponse: finalText as string };
  },
});
  