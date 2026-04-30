// 追加 (#133): 自前 SVG 折れ線グラフ（Server Component）
// 外部ライブラリ（Recharts 等）を追加せず、Tailwind と SVG のみで描画する。
// - net（純売上）の折れ線とドットを表示
// - 各データポイントには SVG <title> でホバー時にネイティブツールチップを表示
// - X 軸ラベルは粒度に応じて自動間引き、Y 軸は 5 分割の目盛り
import type { Granularity, SalesBucket } from '@/lib/salesReport'

type Props = {
  buckets: ReadonlyArray<SalesBucket>
  granularity: Granularity
}

// SVG の論理座標系（width/height）。実画面サイズは CSS で 100% にスケール
const VIEW_W = 800
const VIEW_H = 280
const PADDING_LEFT = 64
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 40
const PLOT_W = VIEW_W - PADDING_LEFT - PADDING_RIGHT
const PLOT_H = VIEW_H - PADDING_TOP - PADDING_BOTTOM

// Y 軸の目盛り比率（0%・25%・50%・75%・100% の 5 分割）
const Y_TICK_RATIOS = [0, 0.25, 0.5, 0.75, 1] as const

// X 軸ラベルの最大表示数（これ以下になるよう間引く）
const MAX_X_LABELS = 12

// Y 軸の目盛り（5 分割）の値リストを返す。max が 0 の場合でも 1 にクランプして表示崩れを避ける。
const buildYTicks = (max: number): number[] => {
  const safeMax = Math.max(max, 1)
  // 切りの良い値に丸める（先頭桁を 1/2/5 にスナップ）
  const niceMax = niceCeil(safeMax)
  return Y_TICK_RATIOS.map((r) => Math.round(niceMax * r))
}

// 1/2/5 系列の "nice number" に切り上げ
const niceCeil = (v: number): number => {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = Math.pow(10, exp)
  const mantissa = v / base
  let nice: number
  if (mantissa <= 1) nice = 1
  else if (mantissa <= 2) nice = 2
  else if (mantissa <= 5) nice = 5
  else nice = 10
  return nice * base
}

// X 軸ラベルの間引き間隔を決める（最大 MAX_X_LABELS 程度）
const computeXLabelStep = (count: number): number => {
  if (count <= 0) return 1
  return Math.max(1, Math.ceil(count / MAX_X_LABELS))
}

export const SalesReportChart = ({ buckets, granularity }: Props) => {
  const count = buckets.length
  const maxNet = buckets.reduce((acc, b) => Math.max(acc, b.net), 0)
  const yTicks = buildYTicks(maxNet)
  const yMax = yTicks[yTicks.length - 1]
  const labelStep = computeXLabelStep(count)

  // X 座標：等間隔配置（count=1 の場合は中央に配置）
  const xAt = (i: number): number => {
    if (count <= 1) return PADDING_LEFT + PLOT_W / 2
    return PADDING_LEFT + (PLOT_W * i) / (count - 1)
  }
  // Y 座標：上下反転（SVG は上が 0）
  const yAt = (v: number): number => {
    if (yMax <= 0) return PADDING_TOP + PLOT_H
    return PADDING_TOP + PLOT_H - (PLOT_H * v) / yMax
  }

  // データが無い場合のプレースホルダ
  if (count === 0) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground"
        role="img"
        aria-label="売上推移グラフ（データなし）"
      >
        指定期間にデータがありません
      </div>
    )
  }

  // 折れ線のパス
  const linePath = buckets
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(b.net).toFixed(1)}`)
    .join(' ')

  // a11y 用のサマリ文言
  const ariaLabel = `売上推移グラフ。${granularity === 'month' ? '月別' : '日別'}、${count} 件のデータ点。最大 ¥${maxNet.toLocaleString('ja-JP')}。`

  return (
    <div
      className="rounded-lg border bg-card p-4 shadow-sm"
      role="img"
      aria-label={ariaLabel}
      data-testid="sales-report-chart"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-72 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* グリッド線・Y 軸ラベル */}
        {yTicks.map((tick) => {
          const y = yAt(tick)
          return (
            <g key={tick}>
              <line
                x1={PADDING_LEFT}
                x2={VIEW_W - PADDING_RIGHT}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray={tick === 0 ? '0' : '2 4'}
              />
              <text
                x={PADDING_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                ¥{tick.toLocaleString('ja-JP')}
              </text>
            </g>
          )
        })}

        {/* X 軸ラベル */}
        {buckets.map((b, i) => {
          if (i % labelStep !== 0 && i !== count - 1) return null
          return (
            <text
              key={b.bucket}
              x={xAt(i)}
              y={VIEW_H - PADDING_BOTTOM + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {b.bucket}
            </text>
          )
        })}

        {/* 折れ線 */}
        <path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* データ点 */}
        {buckets.map((b, i) => (
          <circle
            key={b.bucket}
            cx={xAt(i)}
            cy={yAt(b.net)}
            r={3}
            className="fill-primary"
          >
            <title>
              {b.bucket}: 純売上 ¥{b.net.toLocaleString('ja-JP')} / 注文 {b.orderCount} 件 / 返金 ¥
              {b.refund.toLocaleString('ja-JP')}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  )
}
