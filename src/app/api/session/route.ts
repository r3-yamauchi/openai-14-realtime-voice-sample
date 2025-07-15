import { NextResponse } from "next/server";

// セッション作成リクエストの型定義
interface SessionCreateRequest {
  model: string;
}

// セッションレスポンスの型定義
interface SessionResponse {
  id: string;
  object: string;
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: object | null;
  turn_detection: object | null;
  tools: object[];
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: number | null;
  client_secret: {
    value: string;
    expires_at: number;
  };
}

// エラーレスポンスの型定義
interface ErrorResponse {
  error: string;
  details?: string;
}

export async function GET() {
  // 環境変数の存在確認
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY環境変数が設定されていません");
    return NextResponse.json(
      { error: "サーバー設定エラー" } satisfies ErrorResponse,
      { status: 500 }
    );
  }

  try {
    const requestBody: SessionCreateRequest = {
      model: "gpt-4o-realtime-preview-2025-06-03",
    };

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI APIエラー (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "セッション作成に失敗しました", details: errorText } satisfies ErrorResponse,
        { status: response.status }
      );
    }

    const data: SessionResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("セッションでエラーが発生しました:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}
