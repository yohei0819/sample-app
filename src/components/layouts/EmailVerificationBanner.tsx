'use client'
// メールアドレス未確認時のバナー（#120）
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export const EmailVerificationBanner = () => {
  const { data: session, status } = useSession()
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (status !== 'authenticated') return null
  if (session?.user?.isEmailVerified) return null

  const handleResend = async () => {
    setResending(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-email/resend', { method: 'POST' })
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}))
        const msg =
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : '再送に失敗しました'
        setError(msg)
        return
      }
      setMessage('確認メールを再送しました。メールボックスをご確認ください。')
    } catch {
      setError('再送に失敗しました')
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      role="alert"
      className="border-b bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <p>
          メールアドレスがまだ確認されていません。確認が完了するまで、購入手続きはできません。
        </p>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs text-emerald-700">{message}</span>}
          {error && <span className="text-xs text-rose-700">{error}</span>}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="rounded-md border border-amber-700 px-3 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? '送信中…' : '確認メールを再送する'}
          </button>
        </div>
      </div>
    </div>
  )
}
