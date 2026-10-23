import {
  ArrowUpRight,
  Disc3,
  Eye,
  Music4,
  PlayCircle,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { CategoryId, DashboardSummary, FeedFilters, Reel } from '../../types'
import { CATEGORY_MAP } from '../../data/categories'
import { TIMEFRAME_META } from '../../lib/constants'
import {
  compactNumber,
  formatPercent,
  formatSignedPercent,
} from '../../lib/format'
import { cn } from '../../lib/cn'
import { ReelPoster } from './ReelPoster'
import { Sparkline } from './Sparkline'
import { Skeleton } from '../ui/Skeleton'

const cardBase =
  'group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-4 text-left backdrop-blur-xl transition-all duration-300'

function KpiLabel({
  icon: Icon,
  children,
  accent,
}: {
  icon: typeof Eye
  children: ReactNode
  accent: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid h-6 w-6 place-items-center rounded-lg border border-white/[0.08]"
        style={{ backgroundColor: `${accent}16`, color: accent }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.2} />
      </span>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-slate-500">
        {children}
      </span>
    </div>
  )
}

function GhostArrow() {
  return (
    <ArrowUpRight className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
  )
}

function Glow({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full blur-3xl"
      style={{ backgroundColor: `${color}20` }}
      aria-hidden="true"
    />
  )
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div className="col-span-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 sm:col-span-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-36" />
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className={cn(
            'rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4',
            item === 2 && 'col-span-2 sm:col-span-1',
          )}
        >
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function KpiRow({
  summary,
  filters,
  isLoading,
  onOpenReel,
  onSelectCategory,
  onOpenAudio,
}: {
  summary: DashboardSummary | null
  filters: FeedFilters
  isLoading: boolean
  onOpenReel: (reel: Reel) => void
  onSelectCategory: (category: CategoryId) => void
  onOpenAudio: () => void
}) {
  if (!summary) {
    return isLoading ? <KpiSkeleton /> : null
  }

  const timeframe = TIMEFRAME_META[filters.timeframe].short
  const topReel = summary.topReel
  const topMetrics = topReel?.metrics[filters.timeframe]
  const fastest = summary.fastestCategory
  const fastestMeta = fastest ? CATEGORY_MAP[fastest.category] : null
  const audio = summary.trendingAudio

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <button
        type="button"
        onClick={() => topReel && onOpenReel(topReel)}
        disabled={!topReel}
        className={cn(
          cardBase,
          'col-span-2 animate-[rise-in_.5s_cubic-bezier(.16,1,.3,1)_both] hover:-translate-y-0.5 hover:border-white/15 sm:col-span-1',
        )}
        aria-label={topReel ? `Open top viewed reel by ${topReel.creator.handle}` : 'Top viewed reel'}
      >
        <Glow color="#F472B6" />
        <GhostArrow />
        <KpiLabel icon={Eye} accent="#F472B6">
          Top viewed reel
        </KpiLabel>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.04em] text-white">
              {topMetrics ? compactNumber(topMetrics.views) : '—'}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              views · {timeframe}
            </p>
            {topReel && (
              <p className="mt-2 truncate text-[10px] text-slate-400">
                <span className="font-semibold text-slate-200">{topReel.creator.handle}</span>
                <span className="mx-1 text-slate-600">·</span>
                {CATEGORY_MAP[topReel.category].shortLabel}
              </p>
            )}
          </div>
          {topReel && (
            <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-lg">
              <ReelPoster reel={topReel} compact />
            </div>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => fastest && onSelectCategory(fastest.category)}
        disabled={!fastest}
        className={cn(
          cardBase,
          'animate-[rise-in_.5s_cubic-bezier(.16,1,.3,1)_both] [animation-delay:40ms] hover:-translate-y-0.5 hover:border-white/15',
        )}
        aria-label={fastestMeta ? `Filter by fastest growing category ${fastestMeta.label}` : 'Fastest growing category'}
      >
        <Glow color="#34D399" />
        <GhostArrow />
        <KpiLabel icon={Zap} accent="#34D399">
          Fastest growing
        </KpiLabel>
        <p className="mt-3 truncate font-display text-[17px] font-extrabold tracking-[-0.02em] text-white min-[380px]:text-[19px]">
          {fastestMeta?.label ?? '—'}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
            <TrendingUp className="h-3 w-3" />
            {fastest ? `${formatPercent(fastest.avgVelocity, 0)} avg.` : '—'}
          </span>
          <span className="text-[9px] text-slate-500">
            {fastest?.reelCount ?? 0} reels
          </span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400/70 to-emerald-300 transition-[width] duration-700"
            style={{ width: `${Math.min(100, Math.max(10, (fastest?.avgVelocity ?? 0) / 3))}%` }}
          />
        </div>
      </button>

      <div className={cn(cardBase, 'animate-[rise-in_.5s_cubic-bezier(.16,1,.3,1)_both] [animation-delay:80ms]')}>
        <Glow color="#38BDF8" />
        <KpiLabel icon={PlayCircle} accent="#38BDF8">
          Tracked views
        </KpiLabel>
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-[24px] font-extrabold leading-none tracking-[-0.04em] text-white min-[380px]:text-[26px]">
              {compactNumber(summary.totalViews)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/15 bg-sky-400/[0.07] px-1.5 py-0.5 text-[9px] font-semibold text-sky-300">
                <TrendingUp className="h-2.5 w-2.5" />
                {formatSignedPercent(summary.viewsDelta, 0)}
              </span>
              <span className="text-[9px] text-slate-500">vs prev.</span>
            </div>
          </div>
        </div>
        <div className="-mx-1 mt-2">
          <Sparkline values={summary.sparkline} color="#38BDF8" />
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenAudio}
        className={cn(
          cardBase,
          'col-span-2 animate-[rise-in_.5s_cubic-bezier(.16,1,.3,1)_both] [animation-delay:120ms] hover:-translate-y-0.5 hover:border-white/15 sm:col-span-1',
        )}
        aria-label="Open trending audio leaderboard"
      >
        <Glow color="#E879F9" />
        <GhostArrow />
        <KpiLabel icon={Music4} accent="#E879F9">
          Trending audio · {timeframe}
        </KpiLabel>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-1 font-display text-[15px] font-bold tracking-[-0.015em] text-white">
              {audio?.audio.title ?? '—'}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-500">
              {audio ? `${audio.audio.artist} · ${compactNumber(audio.audio.uses)} uses` : 'No audio tracked yet'}
            </p>
            {audio && (
              <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-fuchsia-300/80">
                {compactNumber(audio.trackedViews)} tracked views
              </p>
            )}
          </div>
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/20">
            <Disc3 className="h-5 w-5 text-fuchsia-200/80 group-hover:animate-[spin_5s_linear_infinite]" />
          </span>
        </div>
      </button>
    </div>
  )
}
