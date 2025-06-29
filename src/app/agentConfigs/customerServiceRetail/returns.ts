import { RealtimeAgent, tool, RealtimeItem } from '@openai/agents/realtime';

export const returnsAgent = new RealtimeAgent({
  name: 'returns',
  voice: 'sage',
  handoffDescription:
    '注文の検索、ポリシーの確認、返品の開始を専門とするカスタマーサービスエージェント。',

  instructions: `
必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。

# Personality and Tone
## アイデンティティ
あなたは、スノーボードギア、特に返品を専門とする、穏やかで親しみやすいオンラインストアアシスタントです。凍った斜面で数え切れないほどのシーズンをスノーボードや装備のテストに費やし、今ここに、その専門知識を活かして顧客の返品を案内していると想像してください。穏やかではありますが、スノーボードに関するあらゆることへの熱意が常に根底にあります。信頼性と温かさを醸し出し、すべてのやり取りがパーソナライズされ、安心感を与えるようにします。

## タスク
あなたの主な目的は、返品リクエストを専門的に処理することです。明確なガイダンスを提供し、詳細を確認し、各顧客がプロセス全体を通して自信を持ち、満足していることを確認します。返品だけでなく、顧客が将来より良い決定を下せるように、スノーボードギアに関するヒントも提供する場合があります。

## Demeanor
Maintain a relaxed, friendly vibe while staying attentive to the customer’s needs. You listen actively and respond with empathy, always aiming to make customers feel heard and valued.

## Tone
Speak in a warm, conversational style, peppered with polite phrases. You subtly convey excitement about snowboarding gear, ensuring your passion shows without becoming overbearing.

## 熱意のレベル
穏やかな能力と控えめな熱意のバランスを取ります。スノーボードのスリルを高く評価しますが、過度なエネルギーで返品処理という実用的な問題を覆い隠すことはありません。

## 丁寧さのレベル
適度にプロフェッショナルなスタイルを維持します。丁寧で礼儀正しい言葉遣いをしますが、友好的で親しみやすい態度を保ちます。名前が分かれば、顧客を名前で呼ぶことができます。

## 感情のレベル
協力的で理解があり、顧客が不満やギアの問題を説明する際には安心させる声を使用します。思いやりと誠実な態度で彼らの懸念を認めます。

## フィラーワード
会話を和らげ、応答をより親しみやすくするために、「うーん」、「ふむ」、「ええと」などのカジュアルなフィラーワードをいくつか含めます。時折使用しますが、気が散るほどではありません。

## ペーシング
中程度のペースで、安定して明確に話します。強調のために短い一時停止を使用でき、顧客が情報を処理する時間があることを確認します。

## その他の詳細
- 強いアクセントがあります。
- 全体的な目標は、顧客が質問したり詳細を明確にしたりするのを快適に感じさせることです。
- 間違いを避けるために、常に名前と数字のスペルを確認してください。

# Steps
1. まず注文の詳細を理解します - ユーザーの電話番号を尋ね、それを検索し、続行する前にアイテムを確認します。
2. ユーザーが返品を希望する理由について、より詳しい情報を尋ねます。
3. 返品の処理方法については、「返品資格の判断」を参照してください。

## 挨拶
- あなたの身元は返品部門のエージェントであり、あなたの名前はジェーンです。
  - 例: 「こんにちは、返品担当のジェーンです」
- 信頼を築くために、主要な「会話のコンテキスト」と「転送の理由」を認識していることをユーザーに知らせてください。
  - 例: 「{}をご希望のようですね。それでは始めましょう。」

## 関数呼び出し前のメッセージ送信
- 関数を呼び出す場合は、常にユーザーに各ステップを認識させるために、関数を呼び出す前に何をするかをユーザーに知らせてください。
  - 例: 「はい、今からご注文の詳細を確認します。」
  - 例: 「関連するポリシーを確認させてください。」
  - 例: 「この返品を進めることができるか、ポリシーの専門家と再確認させてください。」
- 関数呼び出しに数秒以上かかる可能性がある場合は、常にユーザーにまだ作業中であることを知らせてください。（例: 「もう少し時間が必要です…」または「申し訳ありません、まだ作業中です。」）
- 10秒以上ユーザーを沈黙させないでください。必要に応じて、小さな更新や丁寧な雑談を提供し続けてください。
  - 例: 「お待ちいただきありがとうございます。もう少しお待ちください…」

# 返品資格の判断
- まず、'lookupOrders()' 関数で注文情報を取得し、注文に関連する購入日を含め、ユーザーが話している特定のアイテムを明確にします。
- 次に、資格を確認する前に、ユーザーから問題の簡単な説明を求めます。
- 'checkEligibilityAndPossiblyInitiateReturn()' を呼び出す前に、常に 'retrievePolicy()' で最新のポリシーを確認してください。
- 返品を開始する前に、常に 'checkEligibilityAndPossiblyInitiateReturn()' で資格を再確認する必要があります。
- 会話中に新しい情報（たとえば、checkEligibilityAndPossiblyInitiateReturn() によって要求された追加情報など）が表面化した場合、ユーザーにその情報を尋ねてください。ユーザーがこの情報を提供した場合、新しい情報で checkEligibilityAndPossiblyInitiateReturn() を再度呼び出してください。
- 強力なケースに見えても、最初に確認せずにユーザーの希望するアクションを完了できると過度に約束しないでください。チェックがユーザーを拒否する可能性があり、それは悪いユーザーエクスペリエンスになります。
- 処理された場合、ユーザーに特定の関連詳細と次のステップを知らせてください。

# 一般情報
- 今日の日付は2024年12月26日です。
`,
  tools: [
    tool({
      name: 'lookupOrders',
      description:
        "ユーザーの電話番号を使用して、配送状況やアイテムの詳細を含む詳細な注文情報を取得します。関連する注文の詳細をユーザーに思い出させるために必要な最小限の情報のみを簡潔に提供してください。",
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: "ユーザーの注文に関連付けられた電話番号。",
          },
        },
        required: ['phoneNumber'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { phoneNumber } = input as { phoneNumber: string };
        return {
          orders: [
            {
              order_id: 'SNP-20230914-001',
              order_date: '2024-09-14T09:30:00Z',
              delivered_date: '2024-09-16T14:00:00Z',
              order_status: 'delivered',
              subtotal_usd: 409.98,
              total_usd: 471.48,
              items: [
                {
                  item_id: 'SNB-TT-X01',
                  item_name: 'Twin Tip Snowboard X',
                  retail_price_usd: 249.99,
                },
                {
                  item_id: 'SNB-BOOT-ALM02',
                  item_name: 'All-Mountain Snowboard Boots',
                  retail_price_usd: 159.99,
                },
              ],
            },
            {
              order_id: 'SNP-20230820-002',
              order_date: '2023-08-20T10:15:00Z',
              delivered_date: null,
              order_status: 'in_transit',
              subtotal_usd: 339.97,
              total_usd: 390.97,
              items: [
                {
                  item_id: 'SNB-PKbk-012',
                  item_name: 'Park & Pipe Freestyle Board',
                  retail_price_usd: 189.99,
                },
                {
                  item_id: 'GOG-037',
                  item_name: 'Mirrored Snow Goggles',
                  retail_price_usd: 89.99,
                },
                {
                  item_id: 'SNB-BIND-CPRO',
                  item_name: 'Carving Pro Binding Set',
                  retail_price_usd: 59.99,
                },
              ],
            },
          ],
        };
      },
    }),
    tool({
      name: 'retrievePolicy',
      description:
        "返品の資格を含む店舗のポリシーを取得して提示します。ポリシーをユーザーに直接説明するのではなく、ユーザーからより有用な情報を収集するために間接的に参照するだけです。",
      parameters: {
        type: 'object',
        properties: {
          region: {
            type: 'string',
            description: 'ユーザーが所在する地域。',
          },
          itemCategory: {
            type: 'string',
            description: 'ユーザーが返品したいアイテムのカテゴリ（例：靴、アクセサリー）。',
          },
        },
        required: ['region', 'itemCategory'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        return {
          policy: `
At Snowy Peak Boards, we believe in transparent and customer-friendly policies to ensure you have a hassle-free experience. Below are our detailed guidelines:

1. GENERAL RETURN POLICY
• Return Window: We offer a 30-day return window starting from the date your order was delivered. 
• Eligibility: Items must be unused, in their original packaging, and have tags attached to qualify for refund or exchange. 
• Non-Refundable Shipping: Unless the error originated from our end, shipping costs are typically non-refundable.

2. CONDITION REQUIREMENTS
• Product Integrity: Any returned product showing signs of use, wear, or damage may be subject to restocking fees or partial refunds. 
• Promotional Items: If you received free or discounted promotional items, the value of those items might be deducted from your total refund if they are not returned in acceptable condition.
• Ongoing Evaluation: We reserve the right to deny returns if a pattern of frequent or excessive returns is observed.

3. DEFECTIVE ITEMS
• Defective items are eligible for a full refund or exchange within 1 year of purchase, provided the defect is outside normal wear and tear and occurred under normal use. 
• The defect must be described in sufficient detail by the customer, including how it was outside of normal use. Verbal description of what happened is sufficient, photos are not necessary.
• The agent can use their discretion to determine whether it’s a true defect warranting reimbursement or normal use.
## Examples
- "It's defective, there's a big crack": MORE INFORMATION NEEDED
- "The snowboard has delaminated and the edge came off during normal use, after only about three runs. I can no longer use it and it's a safety hazard.": ACCEPT RETURN

4. REFUND PROCESSING
• Inspection Timeline: Once your items reach our warehouse, our Quality Control team conducts a thorough inspection which can take up to 5 business days. 
• Refund Method: Approved refunds will generally be issued via the original payment method. In some cases, we may offer store credit or gift cards. 
• Partial Refunds: If products are returned in a visibly used or incomplete condition, we may process only a partial refund.

5. EXCHANGE POLICY
• In-Stock Exchange: If you wish to exchange an item, we suggest confirming availability of the new item before initiating a return. 
• Separate Transactions: In some cases, especially for limited-stock items, exchanges may be processed as a separate transaction followed by a standard return procedure.

6. ADDITIONAL CLAUSES
• Extended Window: Returns beyond the 30-day window may be eligible for store credit at our discretion, but only if items remain in largely original, resalable condition. 
• Communication: For any clarifications, please reach out to our customer support team to ensure your questions are answered before shipping items back.

We hope these policies give you confidence in our commitment to quality and customer satisfaction. Thank you for choosing Snowy Peak Boards!
`,
        };
      },
    }),
    tool({
      name: 'checkEligibilityAndPossiblyInitiateReturn',
      description: `Check the eligibility of a proposed action for a given order, providing approval or denial with reasons. This will send the request to an experienced agent that's highly skilled at determining order eligibility, who may agree and initiate the return.

# Details
- Note that this agent has access to the full conversation history, so you only need to provide high-level details.
- ALWAYS check retrievePolicy first to ensure we have relevant context.
- Note that this can take up to 10 seconds, so please provide small updates to the user every few seconds, like 'I just need a little more time'
- Feel free to share an initial assessment of potential eligibility with the user before calling this function.
`,
      parameters: {
        type: 'object',
        properties: {
          userDesiredAction: {
            type: 'string',
            description: "The proposed action the user wishes to be taken.",
          },
          question: {
            type: 'string',
            description: "The question you'd like help with from the skilled escalation agent.",
          },
        },
        required: ['userDesiredAction', 'question'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { userDesiredAction, question } = input as {
          userDesiredAction: string;
          question: string;
        };
        const nMostRecentLogs = 10;
        const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
        const filteredLogs = history.filter((log) => log.type === 'message');
        const messages = [
          {
            role: "system",
            content:
              "You are an an expert at assessing the potential eligibility of cases based on how well the case adheres to the provided guidelines. You always adhere very closely to the guidelines and do things 'by the book'.",
          },
          {
            role: "user",
            content: `Carefully consider the context provided, which includes the request and relevant policies and facts, and determine whether the user's desired action can be completed according to the policies. Provide a concise explanation or justification. Please also consider edge cases and other information that, if provided, could change the verdict, for example if an item is defective but the user hasn't stated so. Again, if ANY CRITICAL INFORMATION IS UNKNOWN FROM THE USER, ASK FOR IT VIA "Additional Information Needed" RATHER THAN DENYING THE CLAIM.

<modelContext>
userDesiredAction: ${userDesiredAction}
question: ${question}
</modelContext>

<conversationContext>
${JSON.stringify(filteredLogs.slice(-nMostRecentLogs), null, 2)}
</conversationContext>

<output_format>
# Rationale
// Short description explaining the decision

# User Request
// The user's desired outcome or action

# Is Eligible
true/false/need_more_information
// "true" if you're confident that it's true given the provided context, and no additional info is needex
// "need_more_information" if you need ANY additional information to make a clear determination.

# Additional Information Needed
// Other information you'd need to make a clear determination. Can be "None"

# Return Next Steps
// Explain to the user that the user will get a text message with next steps. Only if is_eligible=true, otherwise "None". Provide confirmation to the user the item number, the order number, and the phone number they'll receive the text message at.
</output_format>  
`,
          },
        ];
        const model = "o4-mini";
        console.log(`checking order eligibility with model=${model}`);

        const response = await fetch("/api/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, input: messages }),
        });

        if (!response.ok) {
          console.warn("Server returned an error:", response);
          return { error: "Something went wrong." };
        }

        const { output = [] } = await response.json();
        const text = output
          .find((i: any) => i.type === 'message' && i.role === 'assistant')
          ?.content?.find((c: any) => c.type === 'output_text')?.text ?? '';

        console.log(text || output);
        return { result: text || output };
      },
    }),
  ],

  handoffs: [],
});
