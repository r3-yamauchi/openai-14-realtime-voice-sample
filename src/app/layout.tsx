import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";

/**
 * ページメタデータの設定
 */
export const metadata: Metadata = {
  title: "リアルタイムAPIエージェント",
  description: "OpenAIによるデモアプリケーション。",
};

/**
 * ルートレイアウトコンポーネント
 * 全ページに共通するHTMLの基本構造を定義
 * 
 * @param children - ページコンテンツ
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
