import { Eye, Heart, MessageCircle, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import type { Reel, Timeframe } from '../../types'
import {
  compactNumber,
  formatEngagementRate,
  formatSignedPercent,
} from '../../lib/format'
import { cn } from '../../lib/cn'

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye
  value: string
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.9} />
      <div className="min-w-0">
        <p className="tabular truncate text-[12px] font-bold leading-tight text-slate-100">
          {value}
        </p>
        <p className="text-[8.5px] uppercase leading-tight tracking-[0.11em] text-slate-500">
          {label}
        </p>
      </div>
    </div>
  )
}

export function MetricsBar({ reel, timeframe }: { reel: Reel; timeframe: Timeframe }) {
  const metrics = reel.metrics[timeframe]
  const engagement = formatEngagementRate(metrics.likes, metrics.comments, metrics.views)
  const positive = reel.velocity >= 0
  const VelocityIcon = positive ? TrendingUp : TrendingDown

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        <Metric icon={Eye} value={compactNumber(metrics.views)} label="Views" />
        <Metric icon={Heart} value={compactNumber(metrics.likes)} label="Likes" />
        <Metric icon={MessageCircle} value={compactNumber(metrics.comments)} label="Comments" />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.055] pt-2.5">
        <span
          className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-500"
          title="Engagement rate = (likes + comments) / views"
        >
          <Sparkles className="h-3 w-3 text-ig-pink/80" />
          <span className="tabular text-slate-300">{engagement}</span> eng.
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold tabular',
            positive
              ? 'border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300'
              : 'border-rose-400/15 bg-rose-400/[0.08] text-rose-300',
          )}
          title="View velocity vs the previous period"
        >
          <VelocityIcon className="h-2.5 w-2.5" strokeWidth={2.6} />
          {formatSignedPercent(reel.velocity)}
          <span className="hidden text-[8px] font-medium opacity-60 min-[380px]:inline">
            velocity
          </span>
        </span>
      </div>
    </div>
  )
}
