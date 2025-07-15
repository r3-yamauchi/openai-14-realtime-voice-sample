/**
 * 共通スタイル定数とクラス名ユーティリティ
 */

// ボタンの基本スタイル
export const BUTTON_STYLES = {
  base: "px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  primary: "bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-500",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  small: "px-3 py-1 text-sm",
  large: "px-6 py-3 text-lg",
} as const;

// 入力フィールドのスタイル
export const INPUT_STYLES = {
  base: "rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
  text: "px-4 py-2 text-base",
  disabled: "disabled:bg-gray-100 disabled:cursor-not-allowed",
} as const;

// カードとコンテナのスタイル
export const CONTAINER_STYLES = {
  card: "bg-white rounded-xl border border-gray-200 shadow-sm",
  panel: "bg-white rounded-xl overflow-hidden",
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
  centered: "flex items-center justify-center",
  spaceBetween: "flex items-center justify-between",
} as const;

// トランジションとアニメーション
export const TRANSITION_STYLES = {
  default: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-100 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
} as const;

// メッセージバブルのスタイル
export const MESSAGE_STYLES = {
  userBubble: "bg-gray-900 text-gray-100 rounded-t-xl",
  assistantBubble: "bg-gray-100 text-black rounded-t-xl",
  container: "max-w-lg p-3",
  timestamp: "text-xs font-mono",
  userTimestamp: "text-gray-400",
  assistantTimestamp: "text-gray-500",
} as const;

// レイアウト関連
export const LAYOUT_STYLES = {
  fullHeight: "h-full",
  fullWidth: "w-full",
  maxWidth: "max-w-lg",
  sticky: "sticky top-0 z-10",
  flexGrow: "flex-1",
  minHeight: "min-h-0",
  overflow: "overflow-auto",
  hidden: "overflow-hidden",
} as const;

/**
 * 条件付きクラス名を結合するヘルパー関数
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * ボタンのクラス名を生成
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' = 'primary',
  size: 'small' | 'base' | 'large' = 'base',
  disabled = false
): string {
  return classNames(
    BUTTON_STYLES.base,
    BUTTON_STYLES[variant],
    size === 'small' && BUTTON_STYLES.small,
    size === 'large' && BUTTON_STYLES.large,
    disabled && BUTTON_STYLES.disabled,
    TRANSITION_STYLES.colors
  );
}

/**
 * 入力フィールドのクラス名を生成
 */
export function getInputClasses(disabled = false): string {
  return classNames(
    INPUT_STYLES.base,
    INPUT_STYLES.text,
    disabled && INPUT_STYLES.disabled,
    TRANSITION_STYLES.default
  );
}