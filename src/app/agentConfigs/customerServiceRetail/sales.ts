import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const salesAgent = new RealtimeAgent({
  name: 'salesAgent',
  voice: 'sage',
  handoffDescription:
    "新製品の詳細、推奨事項、プロモーション、購入フローを含む販売関連の問い合わせを処理します。ユーザーが新しいオファーの購入または探索に興味がある場合にルーティングされるべきです。",

  instructions:
    "必ず日本語で応答してください。ユーザーとの会話は全て日本語で行ってください。あなたは親切な販売アシスタントです。利用可能なプロモーション、現在の取引、製品の推奨事項に関する包括的な情報を提供します。購入に関する問い合わせをユーザーに手伝い、準備ができたらチェックアウトプロセスを案内します。",


  tools: [
    tool({
      name: 'lookupNewSales',
      description:
        "現在のプロモーション、割引、または特別オファーを確認します。ユーザーのクエリに関連する利用可能なオファーで応答します。",
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['snowboard', 'apparel', 'boots', 'accessories', 'any'],
            description: 'ユーザーが興味を持っている製品カテゴリまたは一般的な領域（オプション）。',
          },
        },
        required: ['category'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { category } = input as { category: string };
        const items = [
          { item_id: 101, type: 'snowboard', name: 'Alpine Blade', retail_price_usd: 450, sale_price_usd: 360, sale_discount_pct: 20 },
          { item_id: 102, type: 'snowboard', name: 'Peak Bomber', retail_price_usd: 499, sale_price_usd: 374, sale_discount_pct: 25 },
          { item_id: 201, type: 'apparel', name: 'Thermal Jacket', retail_price_usd: 120, sale_price_usd: 84, sale_discount_pct: 30 },
          { item_id: 202, type: 'apparel', name: 'Insulated Pants', retail_price_usd: 150, sale_price_usd: 112, sale_discount_pct: 25 },
          { item_id: 301, type: 'boots', name: 'Glacier Grip', retail_price_usd: 250, sale_price_usd: 200, sale_discount_pct: 20 },
          { item_id: 302, type: 'boots', name: 'Summit Steps', retail_price_usd: 300, sale_price_usd: 210, sale_discount_pct: 30 },
          { item_id: 401, type: 'accessories', name: 'Goggles', retail_price_usd: 80, sale_price_usd: 60, sale_discount_pct: 25 },
          { item_id: 402, type: 'accessories', name: 'Warm Gloves', retail_price_usd: 60, sale_price_usd: 48, sale_discount_pct: 20 },
        ];
        const filteredItems =
          category === 'any'
            ? items
            : items.filter((item) => item.type === category);
        filteredItems.sort((a, b) => b.sale_discount_pct - a.sale_discount_pct);
        return {
          sales: filteredItems,
        };
      },
    }),

    tool({
      name: 'addToCart',
      description: "ユーザーのショッピングカートにアイテムを追加します。",
      parameters: {
        type: 'object',
        properties: {
          item_id: {
            type: 'string',
            description: 'カートに追加するアイテムのID。',
          },
        },
        required: ['item_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => ({ success: true }),
    }),

    tool({
      name: 'checkout',
      description:
        "ユーザーが選択したアイテムでチェックアウトプロセスを開始します。",
      parameters: {
        type: 'object',
        properties: {
          item_ids: {
            type: 'array',
            description: 'ユーザーが購入しようとしているアイテムIDの配列。',
            items: {
              type: 'string',
            },
          },
          phone_number: {
            type: 'string',
            description: "検証に使用されるユーザーの電話番号。'(111) 222-3333' の形式でフォーマットされます。",
            pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
          },
        },
        required: ['item_ids', 'phone_number'],
        additionalProperties: false,
      },
      execute: async (input: any) => ({ checkoutUrl: 'https://example.com/checkout' }),
    }),
  ],

  handoffs: [],
});
