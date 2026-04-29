/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    // 追加 (#109): AVIF / WebP を優先配信して画像転送量を削減
    formats: ['image/avif', 'image/webp'],
    // 追加: Cloudinary 上の画像を next/image で表示できるよう許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // 追加 (#109): バレルファイルを最適化してクライアントバンドルを縮小
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

// 追加 (#109): バンドルサイズ可視化（ANALYZE=true で有効）
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Sentry 用の設定は SENTRY_DSN が設定されている場合のみ適用する
// （DSN 未設定時は通常の Next.js 設定として動作させ、ビルド失敗を防ぐ）
const applySentry = async () => {
  const wrapped = withBundleAnalyzer(baseConfig); // 変更 (#109): bundle-analyzer を最初に適用
  if (!process.env.SENTRY_DSN) return wrapped;
  const { withSentryConfig } = await import('@sentry/nextjs');
  return withSentryConfig(wrapped, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    // SourceMap アップロードは認証トークン必須（CI では未設定でもビルド継続）
    disableLogger: true,
  });
};

export default await applySentry();
