import { memo } from 'react'
import { Clock3, Disc3, Play } from 'lucide-react'
import type { Reel, Timeframe } from '../../types'
import { formatDuration, relativeTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { CategoryPill } from './CategoryPill'
import { PlatformBadge } from '../ui/BrandIcon'
import { CreatorAvatar, VerifiedMark } from '../ui/CreatorAvatar'
import { MetricsBar } from './MetricsBar'
import { RankBadge } from './RankBadge'
import { ReelPoster } from './ReelPoster'

export const ReelCard = memo(function ReelCard({
  reel,
  rank,
  timeframe,
  onOpen,
  index = 0,
}: {
  reel: Reel
  rank: number
  timeframe: Timeframe
  onOpen: (reel: Reel, rank: number) => void
  index?: number
}) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07]',
        'bg-[linear-gradient(165deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))]',
        'backdrop-blur-xl transition-all duration-300',
        'hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.95)]',
        'animate-[rise-in_.55s_cubic-bezier(.16,1,.3,1)_both]',
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 34}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpen(reel, rank)}
        className="flex h-full flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ig-pink/70 focus-visible:ring-inset"
        aria-label={`Open trending reel by ${reel.creator.handle}: ${reel.hook}`}
      >
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          <ReelPoster reel={reel} />

          <div className="absolute left-3 top-3 z-20">
            <RankBadge rank={rank} />
          </div>

          <div className="absolute right-3 top-3 z-20">
            <PlatformBadge platform={reel.platform} />
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="grid h-14 w-14 scale-90 place-items-center rounded-full border border-white/25 bg-black/25 opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
            </span>
          </div>

          <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular text-white/90 backdrop-blur-md">
            {formatDuration(reel.durationSeconds)}
          </span>

          <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] overflow-hidden bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-ig-yellow via-ig-pink to-ig-indigo group-hover:animate-[preview-progress_7s_linear_infinite]" />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <div className="flex items-center justify-between gap-2">
            <CategoryPill category={reel.category} />
            <span className="inline-flex shrink-0 items-center gap-1 text-[9.5px] text-slate-500">
              <Clock3 className="h-2.5 w-2.5" />
              {relativeTime(reel.postedAt)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <CreatorAvatar
              name={reel.creator.name}
              handle={reel.creator.handle}
              className="h-8 w-8"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-[12px] font-semibold tracking-tight text-slate-100">
                  {reel.creator.handle}
                </span>
                {reel.creator.verified && <VerifiedMark />}
              </div>
              <p className="truncate text-[10px] text-slate-500">{reel.creator.name}</p>
            </div>
          </div>

          <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate-400">
            {reel.caption}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500">
            <Disc3 className="h-3 w-3 shrink-0 text-ig-pink/70 transition-colors group-hover:text-ig-pink group-hover:animate-[spin_5s_linear_infinite]" />
            <span className="truncate">
              <span className="text-slate-300">{reel.audio.title}</span>
              <span className="mx-1 text-slate-600">·</span>
              {reel.audio.artist}
            </span>
          </div>

          <div className="mt-auto pt-3">
            <MetricsBar reel={reel} timeframe={timeframe} />
          </div>
        </div>
      </button>
    </article>
  )
})
