import type { FeedFilters, Reel } from '../../types'
import { ReelCard } from './ReelCard'
import { ReelCardSkeleton } from '../ui/Skeleton'
import { EmptyState } from './EmptyState'

export function ReelGrid({
  reels,
  filters,
  isLoading,
  onOpen,
  onReset,
}: {
  reels: Reel[]
  filters: FeedFilters
  isLoading: boolean
  onOpen: (reel: Reel, rank: number) => void
  onReset: () => void
}) {
  if (isLoading && reels.length === 0) {
    return (
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        aria-label="Loading trending reels"
        aria-busy="true"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <ReelCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (reels.length === 0) {
    const hasActiveFilters =
      filters.platform !== 'all' || filters.category !== 'all' || filters.search.trim() !== ''
    return (
      <EmptyState
        search={filters.search}
        hasActiveFilters={hasActiveFilters}
        onReset={onReset}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {reels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          rank={index + 1}
          timeframe={filters.timeframe}
          onOpen={onOpen}
          index={index}
        />
      ))}
    </div>
  )
}
