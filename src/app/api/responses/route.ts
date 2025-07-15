import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// リクエストボディのスキーマ定義（OpenAI Responses API形式）
const ResponseRequestSchema = z.object({
  model: z.string(),
  input: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  text: z.object({
    format: z.object({
      type: z.enum(['text', 'json_schema']),
      name: z.string().optional(),
      schema: z.record(z.any()).optional(),
      strict: z.boolean().optional()
    }).optional()
  }).optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional()
});

type ResponseRequest = z.infer<typeof ResponseRequestSchema>;

// エラーレスポンスの型定義
interface ErrorResponse {
  error: string;
  details?: string;
}

// OpenAI Responses API のプロキシエンドポイント
export async function POST(req: NextRequest) {
  // 環境変数の存在確認
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY環境変数が設定されていません");
    return NextResponse.json(
      { error: "サーバー設定エラー" } satisfies ErrorResponse,
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    
    // リクエストボディのバリデーション
    const validatedBody = ResponseRequestSchema.parse(body);
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (validatedBody.text?.format?.type === 'json_schema') {
      return await structuredResponse(openai, validatedBody);
    } else {
      return await textResponse(openai, validatedBody);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('リクエストバリデーションエラー:', error.errors);
      return NextResponse.json(
        { error: 'リクエストの形式が不正です', details: error.errors.map(e => e.message).join(', ') } satisfies ErrorResponse,
        { status: 400 }
      );
    }
    
    console.error('リクエスト処理エラー:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}

async function structuredResponse(openai: OpenAI, body: ResponseRequest) {
  try {
    // zodTextFormatで生成されたformat用のparse APIを使用
    const response = await openai.responses.parse({
      model: body.model,
      input: body.input,
      text: body.text,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      stream: false,
    } as any); // 一時的にany型を使用してOpenAI SDK の型チェックを回避

    return NextResponse.json(response);
  } catch (error) {
    console.error('OpenAI構造化応答エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: '構造化応答の生成に失敗しました', details: errorMessage } satisfies ErrorResponse,
      { status: 500 }
    ); 
  }
}

async function textResponse(openai: OpenAI, body: ResponseRequest) {
  try {
    // 通常のcreate APIを使用
    const response = await openai.responses.create({
      model: body.model,
      input: body.input,
      text: body.text,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      stream: false,
    } as any); // 一時的にany型を使用してOpenAI SDK の型チェックを回避

    return NextResponse.json(response);
  } catch (error) {
    console.error('OpenAIテキスト応答エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'テキスト応答の生成に失敗しました', details: errorMessage } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}
  