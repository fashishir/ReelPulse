import { RotateCcw, SearchX } from 'lucide-react'
import { cn } from '../../lib/cn'

export function EmptyState({
  search,
  hasActiveFilters,
  onReset,
  className,
}: {
  search: string
  hasActiveFilters: boolean
  onReset: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center',
        className,
      )}
    >
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ig-pink/15 to-ig-indigo/10 blur-md" />
        <SearchX className="relative h-6 w-6 text-slate-300" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-white">
        No reels match your pulse
      </h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
        {search.trim()
          ? `We couldn't find anything for “${search.trim()}”. Try a creator handle, a caption keyword, or an audio track.`
          : 'There are no reels in this slice of the feed yet. Try another category or platform.'}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-white/[0.1]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset filters
        </button>
      )}
    </div>
  )
}
