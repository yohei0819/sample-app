'use client'
// 星評価表示・入力コンポーネント
import { Star } from 'lucide-react'

type Props =
  | {
      mode: 'display'
      rating: number
      size?: 'sm' | 'md'
    }
  | {
      mode: 'input'
      value: number
      onChange: (value: number) => void
      size?: 'sm' | 'md'
    }

const SIZE_CLASS = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
}

export const StarRating = (props: Props) => {
  const size = props.size ?? 'md'
  const sizeClass = SIZE_CLASS[size]

  if (props.mode === 'display') {
    return (
      <div className="flex items-center gap-0.5" aria-label={`評価: ${props.rating}点`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < props.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="星評価を選択">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        return (
          <button
            key={i}
            type="button"
            aria-label={`${starValue}点`}
            onClick={() => props.onChange(starValue)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              className={`${sizeClass} transition-colors ${
                i < props.value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
