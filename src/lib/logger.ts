// 構造化ロガー
// 本番では JSON 1行 / 開発では人間向け整形出力。Sentry とは独立し、
// アプリケーションログ（API・DB アクセス・バックグラウンド処理）の標準出力を一元化する。

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 環境による最小ログレベル（数値が大きいほど深刻）
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

// テスト環境ではログを抑制（NOISE 削減）。本番は info 以上、開発は debug 以上。
const minLevel: LogLevel = isTest ? 'error' : isProd ? 'info' : 'debug'

// 任意の値を JSON シリアライズ可能な形へ正規化（Error 等の特殊値を扱う）
const normalize = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }
  return value
}

const normalizeContext = (ctx?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!ctx) return undefined
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    out[k] = normalize(v)
  }
  return out
}

const shouldLog = (level: LogLevel): boolean => {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel]
}

const writeLog = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  if (!shouldLog(level)) return

  const ctx = normalizeContext(context)
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...(ctx ?? {}),
  }

  // 出力先: error/warn は stderr、それ以外は stdout
  const target: 'stderr' | 'stdout' = level === 'error' || level === 'warn' ? 'stderr' : 'stdout'

  if (isProd) {
    // 本番は JSON 1行（CloudWatch / Vercel Logs / 任意の集約基盤で構造化検索可能）
    const line = JSON.stringify(payload)
    if (target === 'stderr') {
      process.stderr.write(line + '\n')
    } else {
      process.stdout.write(line + '\n')
    }
    return
  }

  // 開発・テストは人間が読みやすい形（context があれば末尾に JSON 整形）
  const prefix = `[${payload.time}] ${level.toUpperCase()} ${message}`
  if (target === 'stderr') {
    if (ctx && Object.keys(ctx).length > 0) {
      // eslint-disable-next-line no-console
      console.error(prefix, ctx)
    } else {
      // eslint-disable-next-line no-console
      console.error(prefix)
    }
  } else {
    if (ctx && Object.keys(ctx).length > 0) {
      // eslint-disable-next-line no-console
      console.log(prefix, ctx)
    } else {
      // eslint-disable-next-line no-console
      console.log(prefix)
    }
  }
}

// アプリケーション全体で使うロガーインターフェース
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => writeLog('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => writeLog('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => writeLog('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => writeLog('error', message, context),
}

// テスト用にエクスポート（内部ユーティリティ）
export const __internal = { normalize, normalizeContext, shouldLog, minLevel }
