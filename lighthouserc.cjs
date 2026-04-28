// 追加: Lighthouse CI 設定
// 主要ページの Performance / Accessibility / SEO / Best Practices を計測する
module.exports = {
  ci: {
    collect: {
      // CI で Next.js のプロダクションサーバを自動起動して計測する
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60_000,
      // DB 不要な静的ページに限定（CI 環境に DB が無いため）
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/register',
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    upload: {
      // PR ごとに一時的な公開ストレージへ結果をアップロード
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        // 閾値割れは warning（CI 全体は fail させない）
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
}
