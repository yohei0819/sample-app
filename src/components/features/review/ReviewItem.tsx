'use client'
// 追加 (#132): レビューカード（画像表示・有用性投票・Client Component）
import { ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { StarRating } from './StarRating'

type Props = {
  reviewId: string
  rating: number
  userName: string | null
  comment: string | null
  images: string[]
  createdAt: string // ISO 文字列
  helpfulCount: number
  initiallyVoted: boolean
  canVote: boolean
  isOwn: boolean
}

export const ReviewItem = ({
  reviewId,
  rating,
  userName,
  comment,
  images,
  createdAt,
  helpfulCount,
  initiallyVoted,
  canVote,
  isOwn,
}: Props) => {
  const [voted, setVoted] = useState(initiallyVoted)
  const [count, setCount] = useState(helpfulCount)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleVote = () => {
    if (!canVote || isOwn) return
    setError(null)
    const next = !voted
    // 楽観的更新
    setVoted(next)
    setCount((c) => Math.max(0, c + (next ? 1 : -1)))

    startTransition(async () => {
      try {
        const res = await fetch(`/api/reviews/votes/${reviewId}`, {
          method: next ? 'POST' : 'DELETE',
        })
        if (!res.ok && res.status !== 409) {
          // ロールバック
          setVoted(!next)
          setCount((c) => Math.max(0, c + (next ? -1 : 1)))
          const json = await res.json().catch(() => ({}))
          const message =
            typeof json === 'object' && json !== null && 'error' in json
              ? String((json as { error: unknown }).error)
              : '投票に失敗しました'
          setError(message)
          return
        }
        const json = (await res.json().catch(() => ({}))) as { count?: number }
        if (typeof json.count === 'number') setCount(json.count)
      } catch {
        setVoted(!next)
        setCount((c) => Math.max(0, c + (next ? -1 : 1)))
        setError('ネットワークエラーが発生しました')
      }
    })
  }

  const voteLabel = isOwn
    ? '自分のレビューには投票できません'
    : !canVote
      ? 'ログインすると投票できます'
      : voted
        ? '役に立ったを取り消す'
        : '役に立ったに投票する'

  return (
    <li className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating mode="display" rating={rating} size="sm" />
          <span className="text-sm font-medium text-gray-800">
            {userName ?? '匿名ユーザー'}
          </span>
        </div>
        <time dateTime={createdAt} className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString('ja-JP')}
        </time>
      </div>

      {comment && (
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {comment}
        </p>
      )}

      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {images.map((url) => (
            <li key={url} className="relative h-20 w-20 overflow-hidden rounded-md border">
              <Image
                src={url}
                alt="レビュー画像"
                fill
                sizes="80px"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleVote}
          disabled={!canVote || isOwn || isPending}
          aria-pressed={voted}
          aria-label={voteLabel}
          title={voteLabel}
          data-testid="review-vote-button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            voted
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input bg-background text-gray-700 hover:bg-accent',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
          <span>役に立った</span>
          <span className="tabular-nums">({count})</span>
        </button>
        {error && (
          <span className="text-xs text-destructive" role="alert">
            {error}
          </span>
        )}
      </div>
    </li>
  )
}
