'use client'
// 管理画面: 配送業者・追跡番号 編集フォーム（#118）
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CARRIER_CODES, CARRIER_LABEL, getTrackingUrl, isCarrierCode } from '@/constants/shipping'

type Props = {
  orderId: string
  initialCarrier: string | null
  initialTrackingNumber: string | null
}

export const ShippingForm = ({ orderId, initialCarrier, initialTrackingNumber }: Props) => {
  const router = useRouter()
  const [carrier, setCarrier] = useState<string>(initialCarrier ?? '')
  const [trackingNumber, setTrackingNumber] = useState<string>(initialTrackingNumber ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: carrier || null,
          trackingNumber: trackingNumber.trim() || null,
        }),
      })

      if (!res.ok) {
        const data: unknown = await res.json()
        const msg =
          data !== null &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : '配送情報の更新に失敗しました'
        setErrorMsg(msg)
        return
      }

      setSuccessMsg('配送情報を更新しました')
      router.refresh()
    } catch {
      setErrorMsg('配送情報の更新中にエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const previewUrl =
    carrier && trackingNumber.trim() && isCarrierCode(carrier)
      ? getTrackingUrl(carrier, trackingNumber.trim())
      : null

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">配送情報</h2>
      {errorMsg && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          {successMsg}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className="mb-1 block text-xs font-medium">
            配送業者
          </label>
          <select
            id="carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {CARRIER_CODES.map((c) => (
              <option key={c} value={c}>
                {CARRIER_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="trackingNumber" className="mb-1 block text-xs font-medium">
            追跡番号
          </label>
          <input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="例: 1234-5678-9012"
          />
        </div>
      </div>
      {previewUrl && (
        <p className="mt-2 text-xs text-muted-foreground">
          追跡 URL:{' '}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {previewUrl}
          </a>
        </p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? '保存中…' : '配送情報を保存'}
        </button>
      </div>
    </form>
  )
}
