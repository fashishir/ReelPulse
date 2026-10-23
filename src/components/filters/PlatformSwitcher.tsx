import { Layers3 } from 'lucide-react'
import type { PlatformFilter } from '../../types'
import { PlatformIcon } from '../ui/BrandIcon'
import { cn } from '../../lib/cn'

const OPTIONS: { value: PlatformFilter; label: string; title: string }[] = [
  { value: 'all', label: 'All', title: 'All platforms' },
  { value: 'instagram', label: 'Instagram', title: 'Instagram Reels' },
  { value: 'facebook', label: 'Facebook', title: 'Facebook Reels' },
]

export function PlatformSwitcher({
  value,
  onChange,
  className,
}: {
  value: PlatformFilter
  onChange: (value: PlatformFilter) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-white/[0.075] bg-white/[0.025] p-1 backdrop-blur-xl',
        className,
      )}
      role="group"
      aria-label="Filter by platform"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.title}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200',
              active
                ? option.value === 'instagram'
                  ? 'bg-[linear-gradient(110deg,rgba(250,126,30,0.17),rgba(214,41,118,0.22),rgba(79,91,213,0.18))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-ig-pink/25'
                  : option.value === 'facebook'
                    ? 'bg-fb/15 text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-fb/30'
                    : 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
            )}
          >
            {option.value === 'all' ? (
              <Layers3 className="hidden h-3.5 w-3.5 sm:block" strokeWidth={2} />
            ) : (
              <PlatformIcon platform={option.value} className="hidden h-3.5 w-3.5 sm:block" />
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
