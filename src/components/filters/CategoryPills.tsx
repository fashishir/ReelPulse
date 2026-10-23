import { useEffect, useRef } from 'react'
import { Layers3 } from 'lucide-react'
import type { CategoryFilter, CategoryId } from '../../types'
import { CATEGORIES, CATEGORY_MAP } from '../../data/categories'
import { cn } from '../../lib/cn'

export function CategoryPills({
  value,
  counts,
  onChange,
  className,
}: {
  value: CategoryFilter
  counts: Record<CategoryId, number>
  onChange: (value: CategoryFilter) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (value === 'all') {
      container.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }
    const pill = pillRefs.current.get(value)
    if (!pill) return
    const target = pill.offsetLeft - 24
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [value])

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div
      ref={containerRef}
      className={cn(
        'scrollbar-none -mx-0.5 flex snap-x items-center gap-1.5 overflow-x-auto px-0.5 pb-0.5',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange('all')}
        aria-pressed={value === 'all'}
        className={cn(
          'inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200',
          value === 'all'
            ? 'border-white/15 bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/12 hover:bg-white/[0.05] hover:text-slate-200',
        )}
      >
        <Layers3 className="h-3 w-3" />
        All
        <span
          className={cn(
            'tabular rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold',
            value === 'all' ? 'bg-white/10 text-white/70' : 'bg-white/[0.04] text-slate-500',
          )}
        >
          {total}
        </span>
      </button>

      {CATEGORIES.map((category) => {
        const Icon = category.icon
        const active = value === category.id
        return (
          <button
            key={category.id}
            ref={(node) => {
              if (node) pillRefs.current.set(category.id, node)
              else pillRefs.current.delete(category.id)
            }}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={active}
            className={cn(
              'inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200',
              active
                ? 'border-white/15 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/12 hover:bg-white/[0.05] hover:text-slate-200',
            )}
          >
            <Icon
              className="h-3 w-3"
              style={{ color: active ? CATEGORY_MAP[category.id].accent : undefined }}
            />
            {category.label}
            <span
              className={cn(
                'tabular rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold',
                active ? 'bg-white/10 text-white/70' : 'bg-white/[0.04] text-slate-500',
              )}
            >
              {counts[category.id] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
