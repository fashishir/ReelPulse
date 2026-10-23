import { useId } from 'react'
import { cn } from '../../lib/cn'

export function Sparkline({
  values,
  color = '#38BDF8',
  className,
}: {
  values: number[]
  color?: string
  className?: string
}) {
  const gradientId = `spark-${useId().replace(/:/g, '')}`
  const width = 120
  const height = 38
  const padding = 3
  const safeValues = values.length >= 2 ? values : [0, 0]
  const min = Math.min(...safeValues)
  const max = Math.max(...safeValues)
  const range = max - min || 1

  const points = safeValues.map((value, index) => {
    const x = padding + (index / (safeValues.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
  const area = `${line} L${points[points.length - 1].x} ${height} L${points[0].x} ${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-9 w-full overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="2.2" fill={color} />
    </svg>
  )
}
