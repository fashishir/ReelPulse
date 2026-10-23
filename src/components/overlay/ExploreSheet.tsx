import { Disc3, Layers3, Music4, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AudioSummary, CategoryFilter, CategoryId, Timeframe } from '../../types'
import { CATEGORIES } from '../../data/categories'
import { TIMEFRAME_META } from '../../lib/constants'
import { compactNumber } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Modal } from '../overlay/Modal'
import { PlatformIcon } from '../ui/BrandIcon'

type ExploreTab = 'categories' | 'audio'

export function ExploreSheet({
  open,
  initialTab,
  onClose,
  counts,
  audio,
  currentCategory,
  timeframe,
  onSelectCategory,
  onSelectAudio,
}: {
  open: boolean
  initialTab: ExploreTab
  onClose: () => void
  counts: Record<CategoryId, number>
  audio: AudioSummary[]
  currentCategory: CategoryFilter
  timeframe: Timeframe
  onSelectCategory: (category: CategoryFilter) => void
  onSelectAudio: (title: string) => void
}) {
  const [tab, setTab] = useState<ExploreTab>(initialTab)

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const timeframeLabel = TIMEFRAME_META[timeframe].label.toLowerCase()

  return (
    <Modal open={open} onClose={onClose} variant="sheet" labelledBy="explore-title">
      <div className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/[0.09] bg-[linear-gradient(160deg,#111b2f,#080d1a)] shadow-2xl sm:rounded-3xl">
        <div className="shrink-0 border-b border-white/[0.06] px-5 pb-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Explore the pulse
              </p>
              <h2
                id="explore-title"
                className="mt-1 font-display text-xl font-extrabold tracking-[-0.03em] text-white"
              >
                Categories & audio
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close explore panel"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-1 rounded-xl border border-white/[0.07] bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setTab('categories')}
              aria-pressed={tab === 'categories'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition',
                tab === 'categories'
                  ? 'bg-white/[0.09] text-white ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <Layers3 className="h-3.5 w-3.5" />
              Categories
            </button>
            <button
              type="button"
              onClick={() => setTab('audio')}
              aria-pressed={tab === 'audio'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition',
                tab === 'audio'
                  ? 'bg-white/[0.09] text-white ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <Music4 className="h-3.5 w-3.5" />
              Trending audio
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto p-4">
          {tab === 'categories' ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('all')
                  onClose()
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl border p-3 text-left transition',
                  currentCategory === 'all'
                    ? 'border-white/15 bg-white/[0.08] text-white'
                    : 'border-white/[0.06] bg-white/[0.025] text-slate-300 hover:bg-white/[0.05]',
                )}
              >
                <Layers3 className="h-4 w-4 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-semibold">All categories</span>
                  <span className="block text-[9px] text-slate-500">{total} reels</span>
                </span>
              </button>
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                const active = currentCategory === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(category.id)
                      onClose()
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-3 text-left transition',
                      active
                        ? 'border-white/15 bg-white/[0.08] text-white'
                        : 'border-white/[0.06] bg-white/[0.025] text-slate-300 hover:bg-white/[0.05]',
                    )}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: `${category.accent}16`, color: category.accent }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-semibold">
                        {category.label}
                      </span>
                      <span className="block text-[9px] text-slate-500">
                        {counts[category.id] ?? 0} reels
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {audio.map((entry, index) => (
                <button
                  key={`${entry.audio.title}-${entry.audio.artist}`}
                  type="button"
                  onClick={() => {
                    onSelectAudio(entry.audio.title)
                    onClose()
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left transition hover:border-white/[0.07] hover:bg-white/[0.04]"
                >
                  <span className="w-5 shrink-0 text-center font-display text-[11px] font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/15 text-fuchsia-300/80">
                    <Disc3 className="h-4 w-4 group-hover:animate-[spin_4s_linear_infinite]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-slate-200 group-hover:text-white">
                      {entry.audio.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-slate-500">
                      <span className="truncate">{entry.audio.artist}</span>
                      <span className="text-slate-700">·</span>
                      <span>{compactNumber(entry.audio.uses)} uses</span>
                      {entry.platforms.map((platform) => (
                        <PlatformIcon key={platform} platform={platform} className="h-2.5 w-2.5" />
                      ))}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] font-semibold tabular text-slate-300">
                      {compactNumber(entry.trackedViews)}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-600">
                      views
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.06] px-5 py-2.5">
          <p className="text-[9px] leading-relaxed text-slate-600">
            {tab === 'categories'
              ? `Category counts reflect ${timeframeLabel}.`
              : `Ranked by tracked views ${timeframeLabel}. Tap a track to search every reel using it.`}
          </p>
        </div>
      </div>
    </Modal>
  )
}
