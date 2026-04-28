// Next.js Instrumentation Hook
// Sentry のサーバー/Edge 設定をランタイムごとに読み込む
export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// 追加: React Server Component で発生したエラーを Sentry に送る
export const onRequestError = async (
  err: unknown,
  request: Readonly<{
    path: string
    method: string
    headers: Record<string, string | string[] | undefined>
  }>,
  context: Readonly<{
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
  }>,
) => {
  if (!process.env.SENTRY_DSN) return
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(err, request, context)
}
