/**
 * データフォーマット関数集
 */

/**
 * 日時を日本語形式でフォーマット
 */
export function formatTimestamp(timestamp?: string | number | Date): string {
  let date: Date;
  
  if (!timestamp) {
    date = new Date();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }
  
  // 無効な日付の場合はデフォルト値を返す
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  
  return date.toLocaleTimeString('ja-JP', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 詳細な日時を日本語形式でフォーマット（ミリ秒付き）
 */
export function formatDetailedTimestamp(timestamp?: string | number | Date): string {
  let date: Date;
  
  if (!timestamp) {
    date = new Date();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  
  const time = date.toLocaleTimeString('ja-JP', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
}

/**
 * ファイル名に使用可能な形式で日時をフォーマット
 */
export function formatFileNameTimestamp(timestamp?: string | number | Date): string {
  let date: Date;
  
  if (!timestamp) {
    date = new Date();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  
  return date.toISOString().replace(/[:.]/g, '-');
}

/**
 * カテゴリ名を読みやすい形式でフォーマット
 */
export function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * バイト数を読みやすい形式でフォーマット
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 数値を3桁区切りでフォーマット
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 時間（ミリ秒）を読みやすい形式でフォーマット
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else if (ms < 3600000) {
    return `${(ms / 60000).toFixed(1)}m`;
  } else {
    return `${(ms / 3600000).toFixed(1)}h`;
  }
}

/**
 * テキストを指定された長さで切り捨て
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * JSONを整形して表示
 */
export function formatJson(obj: any, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}