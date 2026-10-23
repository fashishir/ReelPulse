import type { CategoryId } from '../../types'
import { CATEGORY_MAP } from '../../data/categories'
import { cn } from '../../lib/cn'

export function CategoryPill({
  category,
  className,
}: {
  category: CategoryId
  className?: string
}) {
  const meta = CATEGORY_MAP[category]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]',
        className,
      )}
      style={{
        color: meta.accent,
        backgroundColor: `${meta.accent}16`,
        borderColor: `${meta.accent}30`,
      }}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={2.4} />
      {meta.shortLabel}
    </span>
  )
}
