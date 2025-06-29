import dotenv from 'dotenv';
import { RealtimeSession } from '@openai/agents-realtime';
import { workspaceManagerAgent } from '../workspaceManager';

// ---------------------------------------------------------------------------
// ワークスペースマネージャーエージェントのプロンプト
// ---------------------------------------------------------------------------

// テスト環境変数をロード
dotenv.config({ path: '.env.test' });

// APIキーが存在しない場合はスイートをスキップ
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  OPENAI_API_KEYが環境変数に見つかりません。リアルタイム統合テストをスキップします。');
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('workspaceManagerAgent リアルタイム統合', () => {
    it('OPENAI_API_KEYがないためスキップされました', () => {
      expect(true).toBe(true);
    });
  });
} else {
  // WorkspaceContextをモックして、ツール実行に完全なReactコンテキストが不要になるようにします。
  jest.mock('@/app/contexts/WorkspaceContext', () => {
    return {
      addWorkspaceTab: jest.fn(async () => ({})),
      renameWorkspaceTab: jest.fn(),
      deleteWorkspaceTab: jest.fn(),
      setTabContent: jest.fn(),
      getWorkspaceInfo: jest.fn(async () => ({})),
      setSelectedTabId: jest.fn(),
    };
  });

  const userPrompt =
    'Please make me a workspace with 3 tabs - one named Overview, one named Task List, and one named Ideas';

  describe('workspaceManagerAgent リアルタイム統合', () => {
    // ネットワークの往復に十分な時間を確保
    jest.setTimeout(120_000);

    it('リアルタイムSDKを介して正しい add_workspace_tab 関数呼び出しを行います', async () => {
      const session = new RealtimeSession(workspaceManagerAgent, {
        transport: 'websocket',
        model: 'gpt-4o-realtime-preview-2024-06-03',
      } as any);

      await session.connect({ apiKey: OPENAI_API_KEY } as any);

      // Transcriptコンポーネントのようにユーザーメッセージを送信
      session.sendMessage(userPrompt, { source: 'test' } as any);

      // 条件またはタイムアウトを待つヘルパー
      const waitFor = (predicate: () => boolean, timeoutMs = 60_000) =>
        new Promise<void>((resolve, reject) => {
          const start = Date.now();
          const tick = () => {
            if (predicate()) return resolve();
            if (Date.now() - start > timeoutMs) {
              return reject(new Error('関数呼び出しのタイムアウト'));
            }
            setTimeout(tick, 1000);
          };
          tick();
        });

      // 3つの add_workspace_tab 関数呼び出しが行われるまで待機
      await waitFor(() => {
        const toolCalls = session.history.filter(
          (item: any) => item.type === 'function_call' && item.name === 'add_workspace_tab',
        );
        return toolCalls.length >= 3;
      });

      // ツール呼び出しの引数を抽出
      const toolCalls = session.history.filter(
        (item: any) => item.type === 'function_call' && item.name === 'add_workspace_tab',
      );

      const parsedArgs = toolCalls.map((c: any) => JSON.parse(c.arguments));

      // 名前とタイプの期待値
      expect(parsedArgs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Overview', type: 'markdown' }),
          expect.objectContaining({ name: 'Task List', type: 'csv' }),
          expect.objectContaining({ name: 'Ideas', type: 'markdown' }),
        ]),
      );

      await session.close();
    });
  });
}
