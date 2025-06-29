"use client";

// ワークスペース状態のための標準的なReactコンテキスト/プロバイダーの実装

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  PropsWithChildren,
  FC,
  useEffect,
} from "react";

import { nanoid } from "nanoid";
import type { WorkspaceTab } from "@/app/types";

export interface WorkspaceState {
  // データ
  name: string;
  description: string;
  tabs: WorkspaceTab[];
  selectedTabId: string;

  // 状態変更関数
  setName: (n: string) => void;
  setDescription: (d: string) => void;
  setTabs: (tabs: WorkspaceTab[]) => void;
  addTab: (partial?: Partial<Omit<WorkspaceTab, "id">>) => void;
  renameTab: (id: string, newName: string) => void;
  deleteTab: (id: string) => void;
  setSelectedTabId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined);

export const WorkspaceProvider: FC<PropsWithChildren> = ({ children }) => {
  // -----------------------------------------------------------------------
  // 基本的な状態値
  // -----------------------------------------------------------------------

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tabs, setTabsInternal] = useState<WorkspaceTab[]>([]);
  const [selectedTabId, setSelectedTabIdInternal] = useState<string>("");

  // マウント時にlocalStorageから読み込む
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('workspaceState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.description) setDescription(parsed.description);
        if (Array.isArray(parsed.tabs)) setTabsInternal(parsed.tabs);
        if (parsed.selectedTabId) setSelectedTabIdInternal(parsed.selectedTabId);
      } catch (e) {
        // エラーを無視
      }
    }
  }, []);

  // 値が変更されるたびにlocalStorageに保存する
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = { name, description, tabs, selectedTabId };
    localStorage.setItem('workspaceState', JSON.stringify(state));
  }, [name, description, tabs, selectedTabId]);

  // -----------------------------------------------------------------------
  // 不変条件を保持するヘルパーセッター関数
  // -----------------------------------------------------------------------

  const setTabs = useCallback((newTabs: WorkspaceTab[]) => {
    setTabsInternal((prev) => {
      const safeTabs = Array.isArray(newTabs) ? newTabs : [];
      setSelectedTabIdInternal((prevSelected) => {
        if (safeTabs.find((t) => t.id === prevSelected)) return prevSelected;
        return safeTabs[0]?.id ?? "";
      });
      return safeTabs;
    });
  }, []);

  const addTab = useCallback(
    (partial: Partial<Omit<WorkspaceTab, "id">> = {}) => {
      setTabsInternal((prev) => {
        const id = nanoid();
        const newTab: WorkspaceTab = {
          id,
          name: partial.name ?? `Tab ${prev.length + 1}`,
          type: partial.type ?? "markdown",
          content: partial.content ?? "",
        };
        // 新しいタブを選択する
        setSelectedTabIdInternal(id);
        return [...prev, newTab];
      });
    },
    [],
  );

  const renameTab = useCallback((id: string, newName: string) => {
    setTabsInternal((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
  }, []);

  const deleteTab = useCallback((id: string) => {
    setTabsInternal((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setSelectedTabIdInternal((sel) => {
        if (sel !== id) return sel;
        return updated[0]?.id ?? "";
      });
      return updated;
    });
  }, []);

  const setSelectedTabId = useCallback((id: string) => {
    setSelectedTabIdInternal(id);
  }, []);

  // -----------------------------------------------------------------------
  // 状態オブジェクトを構成し、各レンダー時に参照を更新
  // -----------------------------------------------------------------------

  const value: WorkspaceState = {
    name,
    description,
    tabs,
    selectedTabId,
    setName,
    setDescription,
    setTabs,
    addTab,
    renameTab,
    deleteTab,
    setSelectedTabId,
  };

  // `useWorkspaceContext.getState()`が常に最新になるよう共有参照を更新
  WorkspaceProviderState.current = value;

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspaceContext<T>(selector: (state: WorkspaceState) => T): T {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return selector(ctx);
}

// 命令的アクセス用にgetStateを公開（サイドバーで使用）
useWorkspaceContext.getState = (): WorkspaceState => {
  if (!WorkspaceProviderState.current) {
    throw new Error("Workspace context not yet initialised");
  }
  return WorkspaceProviderState.current;
};

const WorkspaceProviderState = { current: null as unknown as WorkspaceState };


// タブリストと検索情報（id、index、またはname）からタブIDを解決する
function resolveTabId(
  tabs: WorkspaceTab[],
  opts: { id?: string; index?: number; name?: string }
): string | undefined {
  const { id, index, name } = opts;
  if (typeof id === 'string' && id) {
    return id;
  }
  // 両方が提供された場合はindexよりnameを優先
  if (typeof name === 'string') {
    const tabByName = tabs.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (tabByName) return tabByName.id;
  }
  if (typeof index === 'number' && index >= 0 && index < tabs.length) {
    return tabs[index]?.id;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// ヘルパー関数（WorkspaceManagerエージェントツールで使用）
// ---------------------------------------------------------------------------

export async function setWorkspaceInfo(input: any) {
  const { name, description } = input as { name?: string; description?: string };
  const ws = useWorkspaceContext.getState();
  if (typeof name === 'string') ws.setName(name);
  if (typeof description === 'string') ws.setDescription(description);
  return { message: 'Workspace info updated.' };
}

export async function addWorkspaceTab(input: any) {
  const { name, type, content } = input as { name?: string; type?: string; content?: string };
  const ws = useWorkspaceContext.getState();
  const newTab: WorkspaceTab = {
    id: nanoid(),
    name: typeof name === 'string' && name ? name : `Tab ${ws.tabs.length + 1}`,
    type: typeof type === 'string' && (type === 'markdown' || type === 'csv') ? type : 'markdown',
    content: typeof content === 'string' && content ? content : '',
  };
  ws.setTabs([...ws.tabs, newTab]);
  ws.setSelectedTabId(newTab.id);
  return { message: `Tab '${newTab.name}' added.` };
}

export async function renameWorkspaceTab(input: any) {
  const { id, index, current_name, new_name } = input as {
    id?: string;
    index?: number;
    current_name?: string;
    new_name?: string;
  };
  const ws = useWorkspaceContext.getState();
  if (typeof new_name !== 'string' || new_name.trim() === '') {
    return { message: 'Invalid new_name for rename.' };
  }
  const targetId = resolveTabId(ws.tabs, { id, index, name: current_name });
  if (!targetId) {
    return { message: 'Unable to locate tab for rename.' };
  }
  ws.renameTab(targetId, new_name!);
  return { message: `Tab renamed to ${new_name}.` };
}

export async function deleteWorkspaceTab(input: any) {
  const { id, index, name } = input as { id?: string; index?: number; name?: string };
  const ws = useWorkspaceContext.getState();
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for deletion.' };
  }
  ws.deleteTab(targetId);
  return { message: 'Tab deleted.' };
}

export async function setTabContent(input: any) {
  const { id, index, name, content } = input as {
    id?: string;
    index?: number;
    name?: string;
    content?: string;
  };
  const ws = useWorkspaceContext.getState();
  if (typeof content !== 'string') {
    return { message: 'Content must be a string.' };
  }
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for set_tab_content.' };
  }
  ws.setTabs(ws.tabs.map((t) => (t.id === targetId ? { ...t, content } : t)));
  ws.setSelectedTabId(targetId);
  return { message: 'Tab content updated.' };
}

export async function setSelectedTabId(input: any) {
  const { id, index, name } = input as { id?: string; index?: number; name?: string };
  const ws = useWorkspaceContext.getState();
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for set_tab_content.' };
  }
  ws.setSelectedTabId(targetId);
  return { message: 'Tab selected.' };
}

export async function getWorkspaceInfo() {
  const ws = useWorkspaceContext.getState();
  return { workspace: ws };
}
