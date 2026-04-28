/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    // 追加: Cloudinary 上の画像を next/image で表示できるよう許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

// Sentry 用の設定は SENTRY_DSN が設定されている場合のみ適用する
// （DSN 未設定時は通常の Next.js 設定として動作させ、ビルド失敗を防ぐ）
const applySentry = async () => {
  if (!process.env.SENTRY_DSN) return baseConfig;
  const { withSentryConfig } = await import('@sentry/nextjs');
  return withSentryConfig(baseConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    // SourceMap アップロードは認証トークン必須（CI では未設定でもビルド継続）
    disableLogger: true,
  });
};

export default await applySentry();
