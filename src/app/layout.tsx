import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider' // 追加

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'SampleShop',
    template: '%s | SampleShop',
  },
  description: '上質なアイテムをお届けするオンラインショップ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">{/* 変更: 日本語ECサイトのためja指定 */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* 追加: NextAuth v5 SessionProvider でラップ */}
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
