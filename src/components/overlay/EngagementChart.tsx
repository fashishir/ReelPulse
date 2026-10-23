import { Eye, Heart, MessageCircle } from 'lucide-react'
import type { Reel, Timeframe } from '../../types'
import { TIMEFRAME_META } from '../../lib/constants'
import {
  compactNumber,
  engagementRateValue,
  fullNumber,
} from '../../lib/format'

const BAR_METRICS = [
  { key: 'likes', label: 'Likes', color: '#F472B6' },
  { key: 'comments', label: 'Comments', color: '#FBBF24' },
  { key: 'shares', label: 'Shares', color: '#38BDF8' },
  { key: 'saves', label: 'Saves', color: '#34D399' },
] as const

export function EngagementChart({ reel, timeframe }: { reel: Reel; timeframe: Timeframe }) {
  const metrics = reel.metrics[timeframe]
  const rate = engagementRateValue(metrics.likes, metrics.comments, metrics.views)
  const totalActions = metrics.likes + metrics.comments + metrics.shares + metrics.saves
  const maxValue = Math.max(metrics.likes, metrics.comments, metrics.shares, metrics.saves, 1)
  const ringDegrees = Math.min(360, rate * 3.6)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Engagement breakdown
          </h3>
          <p className="mt-1 font-display text-[17px] font-bold tracking-tight text-white">
            {compactNumber(totalActions)} actions
          </p>
          <p className="mt-0.5 text-[9.5px] text-slate-500">
            {TIMEFRAME_META[timeframe].label} · {compactNumber(metrics.views)} views
          </p>
        </div>
        <div
          className="relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(from -90deg, #F472B6 0deg, #A78BFA ${ringDegrees}deg, rgba(255,255,255,0.07) ${ringDegrees}deg 360deg)`,
          }}
          title="Engagement rate = (likes + comments) / views"
        >
          <div className="grid h-[56px] w-[56px] place-items-center rounded-full bg-[#0c1524]">
            <div className="text-center">
              <p className="font-display text-[15px] font-extrabold leading-none tabular text-white">
                {rate.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-slate-500">
                eng. rate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Views', value: metrics.views, icon: Eye },
          { label: 'Likes', value: metrics.likes, icon: Heart },
          { label: 'Comments', value: metrics.comments, icon: MessageCircle },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2"
          >
            <stat.icon className="h-3 w-3 text-slate-500" />
            <p className="mt-1.5 truncate font-display text-[13px] font-bold tabular text-white">
              {compactNumber(stat.value)}
            </p>
            <p className="text-[8px] uppercase tracking-[0.08em] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {BAR_METRICS.map((metric) => {
          const value = metrics[metric.key]
          return (
            <div key={metric.key}>
              <div className="mb-1 flex items-center justify-between text-[9.5px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                  {metric.label}
                </span>
                <span className="tabular font-semibold text-slate-300">
                  {compactNumber(value)}
                  <span className="ml-1 font-normal text-slate-600">
                    {totalActions > 0 ? `${((value / totalActions) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                <div
                  className="h-full origin-left animate-[bar-grow_.7s_cubic-bezier(.16,1,.3,1)_both] rounded-full"
                  style={{
                    width: `${Math.max(2, (value / maxValue) * 100)}%`,
                    backgroundColor: metric.color,
                    opacity: 0.82,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[9px] leading-relaxed text-slate-600">
        Engagement rate = (likes + comments) ÷ views. {fullNumber(totalActions)} total actions
        across like, comment, share and save.
      </p>
    </section>
  )
}
