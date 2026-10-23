import { RefreshCw } from 'lucide-react'
import type { Timeframe } from '../../types'
import { formatLongDate, relativeTime } from '../../lib/format'
import { timeframeNoun } from '../../lib/constants'
import { cn } from '../../lib/cn'

export function PageIntro({
  timeframe,
  trackedReels,
  lastSyncedAt,
  isRefreshing,
}: {
  timeframe: Timeframe
  trackedReels: number
  lastSyncedAt: string
  isRefreshing: boolean
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-[pulse-dot_2.6s_ease-in-out_infinite] rounded-full bg-emerald-400" />
          </span>
          Daily pulse · {formatLongDate()}
        </div>
        <h1 className="mt-2.5 font-display text-[32px] font-extrabold leading-[1.02] tracking-[-0.045em] text-white sm:text-[40px]">
          What’s moving <span className="text-gradient">{timeframeNoun(timeframe)}</span>
        </h1>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-slate-400 sm:text-[13px]">
          The reels breaking out across Instagram and Facebook, ranked by the signal that
          matters. <span className="text-slate-500">{trackedReels} reels tracked.</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Live tracking
          </span>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-400',
            isRefreshing && 'border-ig-pink/20 bg-ig-pink/[0.06] text-pink-200',
          )}
          title={`Last synced ${relativeTime(lastSyncedAt)}`}
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Updating…' : `Synced ${relativeTime(lastSyncedAt)}`}
        </div>
      </div>
    </div>
  )
}
