// logger のユニットテスト
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __internal, logger } from './logger'

describe('logger', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>
  let stderrSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    // 開発時の console フォールバック対策
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('error は stderr または console.error に出力される', () => {
    logger.error('test error', { code: 'X' })
    const wrote =
      stderrSpy.mock.calls.length > 0 || errorSpy.mock.calls.length > 0
    expect(wrote).toBe(true)
  })

  it('テスト環境では debug/info/warn は出力を抑制される', () => {
    logger.debug('d')
    logger.info('i')
    logger.warn('w')
    expect(stdoutSpy).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('normalize は Error を name/message/stack に展開する', () => {
    const e = new Error('boom')
    const out = __internal.normalize(e)
    expect(out).toMatchObject({ name: 'Error', message: 'boom' })
    expect(typeof (out as { stack: unknown }).stack).toBe('string')
  })

  it('normalize はプリミティブをそのまま返す', () => {
    expect(__internal.normalize('x')).toBe('x')
    expect(__internal.normalize(1)).toBe(1)
    expect(__internal.normalize(null)).toBe(null)
  })

  it('normalizeContext は undefined を返す（入力なし）', () => {
    expect(__internal.normalizeContext(undefined)).toBeUndefined()
  })

  it('normalizeContext は Error 値を展開する', () => {
    const out = __internal.normalizeContext({ err: new Error('x'), id: '1' })
    expect(out?.err).toMatchObject({ message: 'x' })
    expect(out?.id).toBe('1')
  })

  it('shouldLog はテスト環境で error のみ通す', () => {
    expect(__internal.shouldLog('debug')).toBe(false)
    expect(__internal.shouldLog('info')).toBe(false)
    expect(__internal.shouldLog('warn')).toBe(false)
    expect(__internal.shouldLog('error')).toBe(true)
  })
})
