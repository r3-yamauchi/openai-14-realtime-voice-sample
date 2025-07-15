import dotenv from 'dotenv';
import path from 'path';

// 環境変数設定
try {
  // .envファイルのパスを正しく設定
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn('環境変数ファイルの読み込みに失敗しました:', result.error.message);
  }
} catch (error) {
  console.error('環境変数の初期化でエラーが発生しました:', error);
}

// 必要な環境変数の検証
function validateEnvironmentVariables() {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`必要な環境変数が設定されていません: ${missingVars.join(', ')}`);
    console.error('プロジェクトルートに.envファイルを作成し、必要な環境変数を設定してください。');
  }
  
  return missingVars.length === 0;
}

// 環境変数の型安全なアクセス
export function getEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`環境変数 ${name} が設定されていません`);
  }
  return value;
}

// アプリケーション起動時の検証
if (typeof window === 'undefined') {
  validateEnvironmentVariables();
}