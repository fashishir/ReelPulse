import { Loader2, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { CategoryFilter, CategoryId, FeedFilters } from '../../types'
import { CategoryPills } from './CategoryPills'
import { SortTabs } from './SortTabs'

export function FeedToolbar({
  filters,
  counts,
  resultCount,
  isLoading,
  isRefreshing,
  onFiltersChange,
  onReset,
}: {
  filters: FeedFilters
  counts: Record<CategoryId, number>
  resultCount: number
  isLoading: boolean
  isRefreshing: boolean
  onFiltersChange: (patch: Partial<FeedFilters>) => void
  onReset: () => void
}) {
  const hasActiveFilters =
    filters.platform !== 'all' || filters.category !== 'all' || filters.search.trim() !== ''

  return (
    <section
      aria-label="Feed controls"
      className="glass rounded-2xl p-2.5 sm:p-3"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SortTabs
          value={filters.sortBy}
          onChange={(sortBy) => onFiltersChange({ sortBy })}
        />

        <div className="flex items-center justify-between gap-3 px-0.5 xl:justify-end">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500"
            aria-live="polite"
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 animate-spin text-ig-pink" />
            ) : (
              <SlidersHorizontal className="h-3 w-3 text-slate-600" />
            )}
            {isLoading ? (
              'Loading feed…'
            ) : (
              <>
                <span className="tabular font-semibold text-slate-300">{resultCount}</span>
                {resultCount === 1 ? ' reel' : ' reels'}
              </>
            )}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-2.5 border-t border-white/[0.05] pt-2.5">
        <CategoryPills
          value={filters.category}
          counts={counts}
          onChange={(category: CategoryFilter) => onFiltersChange({ category })}
        />
      </div>
    </section>
  )
}
