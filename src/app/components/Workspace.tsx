"use client";

import React from "react";
import Sidebar from "@/app/components/workspace/Sidebar";
import TabContent from "@/app/components/workspace/TabContent";
import { useWorkspaceContext, WorkspaceState } from "@/app/contexts/WorkspaceContext";

// ワークスペースビルダーシナリオがアクティブなときにレンダリングされるコンテナパネル。
// サイドバー（タブリスト）とTabContent（レンダラー）コンポーネントを組み合わせます。

function Workspace() {
  // Zustandストアからデータとミューテーターを抽出します。
  // 安定したセレクターは、すべてのレンダリングでサブスクリプション効果をトリガーするのを防ぎます
  // （アロー関数は毎回新しい関数を作成するため）。
  const selectTabs = React.useCallback((s: WorkspaceState) => s.tabs, []);
  const selectSelectedTabId = React.useCallback((s: WorkspaceState) => s.selectedTabId, []);
  const selectAddTab = React.useCallback((s: WorkspaceState) => s.addTab, []);
  const selectRenameTab = React.useCallback((s: WorkspaceState) => s.renameTab, []);
  const selectDeleteTab = React.useCallback((s: WorkspaceState) => s.deleteTab, []);
  const selectSetSelectedTabId = React.useCallback((s: WorkspaceState) => s.setSelectedTabId, []);

  const tabs = useWorkspaceContext(selectTabs);
  const selectedTabId = useWorkspaceContext(selectSelectedTabId);

  const addTab = useWorkspaceContext(selectAddTab);
  const renameTab = useWorkspaceContext(selectRenameTab);
  const deleteTab = useWorkspaceContext(selectDeleteTab);
  const setSelectedTabId = useWorkspaceContext(selectSetSelectedTabId);

  // デフォルトのタブが存在し、常に有効なタブが選択されていることを確認します。これを`useEffect`で実行すると、
  // 状態の変更がレンダリングフェーズから外れ、親/子コンポーネント間のカスケード更新に関するReactの警告を防ぎます。
  React.useEffect(() => {
    if (tabs.length === 0) {
      addTab();
      return;
    }

    if (!tabs.find((t) => t.id === selectedTabId)) {
      setSelectedTabId(tabs[0]?.id ?? "");
    }
  }, [tabs, selectedTabId, addTab, setSelectedTabId]);

  const selectedTab = React.useMemo(
    () => tabs.find((t) => t.id === selectedTabId),
    [tabs, selectedTabId],
  );

  return (
    <div className="w-full flex flex-col bg-white rounded-xl overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b bg-white rounded-t-xl">
        <span className="font-semibold">ワークスペース</span>
      </div>

      {/* サイドバー + タブコンテンツ間で分割されたコンテンツ領域 */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* サイドバー（タブリスト） */}
        <div className="w-48 border-r border-gray-200 dark:border-neutral-800 overflow-y-auto">
          <Sidebar
            tabs={tabs}
            selectedTabId={selectedTabId}
            onSelect={setSelectedTabId}
            onRename={renameTab}
            onDelete={deleteTab}
            onAdd={addTab}
          />
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-auto p-4">
          <TabContent tab={selectedTab} />
        </div>
      </div>
    </div>
  );
}

export default Workspace;
