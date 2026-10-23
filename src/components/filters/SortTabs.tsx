import { Eye, Gauge, Heart, MessageCircle } from 'lucide-react'
import type { SortKey } from '../../types'
import { SORT_META, SORT_ORDER } from '../../lib/constants'
import { cn } from '../../lib/cn'

const ICONS = {
  views: Eye,
  likes: Heart,
  comments: MessageCircle,
  engagement: Gauge,
} as const

const ACCENTS: Record<SortKey, string> = {
  views: 'text-sky-400',
  likes: 'text-pink-400',
  comments: 'text-amber-400',
  engagement: 'text-emerald-400',
}

const MOBILE_LABELS: Record<SortKey, string> = {
  views: 'Views',
  likes: 'Likes',
  comments: 'Comments',
  engagement: 'Engage',
}

export function SortTabs({
  value,
  onChange,
  className,
}: {
  value: SortKey
  onChange: (value: SortKey) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Sort trending reels"
      className={cn(
        'scrollbar-none flex w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/20 p-1 lg:w-auto',
        className,
      )}
    >
      {SORT_ORDER.map((key) => {
        const meta = SORT_META[key]
        const Icon = ICONS[key]
        const active = key === value
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            title={meta.label}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all duration-200 sm:px-2.5',
              active
                ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.055))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5',
                active ? ACCENTS[key] : 'text-slate-500',
              )}
              strokeWidth={2.1}
            />
            <span className="whitespace-nowrap sm:hidden">{MOBILE_LABELS[key]}</span>
            <span className="hidden whitespace-nowrap sm:inline">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
