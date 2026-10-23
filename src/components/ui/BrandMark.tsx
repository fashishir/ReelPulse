import { useId } from 'react'
import { cn } from '../../lib/cn'

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const gradientId = `mark-${useId().replace(/:/g, '')}`
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-ig-yellow via-ig-pink to-ig-indigo p-px shadow-[0_0_28px_-10px_rgba(214,41,118,0.85)]">
        <span className="grid h-full w-full place-items-center rounded-[10px] bg-ink-950">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="3" y1="16" x2="21" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEDA75" />
                <stop offset="0.35" stopColor="#FA7E1E" />
                <stop offset="0.68" stopColor="#D62976" />
                <stop offset="1" stopColor="#4F5BD5" />
              </linearGradient>
            </defs>
            <path
              d="M3 13h3.4l1.9-5.4 2.9 9.6 2.3-6.6 1.5 2.4H21"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      {!compact && (
        <span className="font-display text-[19px] font-extrabold tracking-[-0.035em] text-white">
          Reel<span className="text-gradient">Pulse</span>
        </span>
      )}
    </span>
  )
}
