import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider' // 追加
import { env } from '@/env' // 追加: SEO用metadataBase
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  TWITTER_CARD_TYPE,
  ORGANIZATION_NAME,
} from '@/constants/seo' // 追加
import { safeJsonLd } from '@/lib/seo/jsonLd' // 追加: JSON-LD XSS対策

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

// 追加: SEO拡充（OG/Twitter/metadataBase）
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: env.NEXT_PUBLIC_APP_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: TWITTER_CARD_TYPE,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

// 追加: Organization 構造化データ
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORGANIZATION_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  logo: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}${DEFAULT_OG_IMAGE}`,
}

// Next.js規約上 RootLayout は default export が必須のため例外的に使用
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">{/* 変更: 日本語ECサイトのためja指定 */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* 追加: Organization 構造化データ（JSON-LD） */}
        <script
          type="application/ld+json"
          // 変更: safeJsonLd で '<' をエスケープし XSS / </script> 離脱を防止
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
        {/* 追加: NextAuth v5 SessionProvider でラップ */}
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
