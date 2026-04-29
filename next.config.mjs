/** @type {import('next').NextConfig} */

// 追加 (#122): セキュリティヘッダー
// Stripe / Cloudinary / Sentry / Resend / Google OAuth と整合する CSP を構築する
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Stripe iframe を許可
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  // Stripe.js / Sentry のクライアント SDK / Next.js のインライン runtime
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.sentry.io",
  // Tailwind は外部 CSS を必要としないが Next.js が一部 inline を使うため許容
  "style-src 'self' 'unsafe-inline'",
  // Cloudinary 画像と data: / blob: を許可
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  // Stripe API / Sentry / Resend / 自身の API
  "connect-src 'self' https://api.stripe.com https://*.ingest.sentry.io https://*.sentry.io https://api.resend.com",
  "object-src 'none'",
  "media-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspDirectives },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

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
  // 追加 (#122): セキュリティヘッダーを全パスに付与
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
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
