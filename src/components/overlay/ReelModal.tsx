import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Disc3,
  ExternalLink,
  Link2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Reel, Timeframe } from '../../types'
import {
  formatDateTime,
  formatDuration,
  formatSignedPercent,
  relativeTime,
} from '../../lib/format'
import { cn } from '../../lib/cn'
import { Modal } from './Modal'
import { ReelPoster } from '../dashboard/ReelPoster'
import { RankBadge } from '../dashboard/RankBadge'
import { CategoryPill } from '../dashboard/CategoryPill'
import { CreatorAvatar, VerifiedMark } from '../ui/CreatorAvatar'
import { PlatformIcon } from '../ui/BrandIcon'
import { EngagementChart } from './EngagementChart'
import { useToast } from '../ui/Toast'

export function ReelModal({
  reel,
  list,
  timeframe,
  onClose,
  onSelect,
}: {
  reel: Reel | null
  list: Reel[]
  timeframe: Timeframe
  onClose: () => void
  onSelect: (reel: Reel) => void
}) {
  const toast = useToast()
  const panelRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(true)

  const index = reel ? list.findIndex((item) => item.id === reel.id) : -1
  const hasNavigation = index >= 0 && list.length > 1
  const previous = hasNavigation ? list[(index - 1 + list.length) % list.length] : null
  const next = hasNavigation ? list[(index + 1) % list.length] : null

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    setMuted(true)
    panelRef.current?.scrollTo({ top: 0 })
  }, [reel?.id])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 0.55))
    }, 120)
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => {
    if (!reel) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'ArrowLeft' && previous) {
        event.preventDefault()
        onSelect(previous)
      } else if (event.key === 'ArrowRight' && next) {
        event.preventDefault()
        onSelect(next)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [reel, previous, next, onSelect])

  if (!reel) return null

  const elapsed = Math.round((progress / 100) * reel.durationSeconds)
  const isInstagram = reel.platform === 'instagram'
  const platformLabel = isInstagram ? 'Instagram' : 'Facebook'
  const positiveVelocity = reel.velocity >= 0

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reel.externalUrl)
      toast({
        title: 'Link copied',
        description: 'The reel destination is on your clipboard.',
        tone: 'success',
      })
    } catch {
      toast({
        title: 'Could not copy link',
        description: 'Clipboard access is blocked in this browser context.',
        tone: 'warning',
      })
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="reel-modal-title"
      className="max-h-[94dvh] max-w-[1080px]"
    >
      <div
        ref={panelRef}
        className="relative max-h-[92dvh] overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#080d1a] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] lg:overflow-hidden"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-[#080d1a]/95 px-4 py-2.5 backdrop-blur-xl lg:hidden">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Reel details
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reel details"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:max-h-[92dvh] lg:grid-cols-[minmax(330px,400px)_minmax(0,1fr)]">
          <div className="relative flex shrink-0 items-center justify-center overflow-hidden border-b border-white/[0.06] bg-[#04070f] p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-5">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(60% 45% at 50% 35%, rgba(214,41,118,0.13), transparent 70%), radial-gradient(50% 40% at 70% 80%, rgba(56,189,248,0.08), transparent 70%)',
              }}
            />
            <div className="relative w-[min(58vw,236px)] sm:w-[258px] lg:w-full lg:max-w-[350px]">
              <div className="group/player relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]">
                <ReelPoster reel={reel} />
                <button
                  type="button"
                  onClick={() => setPlaying((current) => !current)}
                  aria-label={playing ? 'Pause demo preview' : 'Play demo preview'}
                  className="absolute inset-0 z-10 grid place-items-center bg-black/5 transition-colors hover:bg-black/15"
                >
                  <span
                    className={cn(
                      'grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-black/30 opacity-100 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover/player:scale-105 group-hover/player:opacity-100',
                      playing && 'opacity-0',
                    )}
                  >
                    {playing ? (
                      <Pause className="h-6 w-6 fill-white text-white" />
                    ) : (
                      <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                    )}
                  </span>
                </button>
                <span className="absolute bottom-3 right-3 z-20 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular text-white/90 backdrop-blur-md">
                  {formatDuration(reel.durationSeconds)}
                </span>
                <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/65 backdrop-blur-md">
                  <span className="h-1 w-1 rounded-full bg-ig-pink" />
                  Preview
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => setPlaying((current) => !current)}
                  aria-label={playing ? 'Pause preview' : 'Play preview'}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
                >
                  {playing ? (
                    <Pause className="h-3 w-3 fill-current" />
                  ) : (
                    <Play className="h-3 w-3 translate-x-px fill-current" />
                  )}
                </button>
                <span className="shrink-0 tabular text-[9px] text-slate-400">
                  {formatDuration(elapsed)} / {formatDuration(reel.durationSeconds)}
                </span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ig-orange via-ig-pink to-ig-indigo transition-[width] duration-150 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMuted((current) => !current)}
                  aria-label={muted ? 'Unmute preview' : 'Mute preview'}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[8px] uppercase tracking-[0.14em] text-slate-500">
                Audio & Video Preview
              </p>
            </div>
          </div>

          <div className="relative bg-[#080d1a] p-5 sm:p-6 lg:h-[92dvh] lg:overflow-y-auto lg:p-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close reel details"
              className="absolute right-5 top-5 z-20 hidden h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white lg:grid"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9.5px] font-semibold text-slate-200">
                <PlatformIcon platform={reel.platform} className="h-3 w-3" />
                {platformLabel} Reel
              </span>
              {index >= 0 && <RankBadge rank={index + 1} />}
              <CategoryPill category={reel.category} />
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold tabular',
                  positiveVelocity
                    ? 'border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300'
                    : 'border-rose-400/15 bg-rose-400/[0.07] text-rose-300',
                )}
              >
                {formatSignedPercent(reel.velocity)} velocity
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <CreatorAvatar
                  name={reel.creator.name}
                  handle={reel.creator.handle}
                  className="h-10 w-10 text-[11px]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-[13px] font-semibold text-white">
                      {reel.creator.handle}
                    </span>
                    {reel.creator.verified && <VerifiedMark />}
                  </div>
                  <p className="truncate text-[10px] text-slate-500">
                    {reel.creator.name}
                    <span className="mx-1 text-slate-700">·</span>
                    <span title={formatDateTime(reel.postedAt)}>
                      {relativeTime(reel.postedAt)}
                    </span>
                  </p>
                </div>
              </div>

              {hasNavigation && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => previous && onSelect(previous)}
                    aria-label="Previous reel"
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="tabular px-0.5 text-[9px] text-slate-600">
                    {index + 1}/{list.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => next && onSelect(next)}
                    aria-label="Next reel"
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <h2
              id="reel-modal-title"
              className="mt-4 font-display text-[24px] font-extrabold leading-[1.12] tracking-[-0.035em] text-white sm:text-[28px]"
            >
              {reel.hook}
            </h2>

            <p className="mt-2.5 whitespace-pre-line text-[12.5px] leading-relaxed text-slate-400">
              {reel.caption}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {reel.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 text-[9.5px] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/15 text-fuchsia-200/80">
                <Disc3 className="h-4 w-4 animate-[spin_8s_linear_infinite]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold text-slate-200">
                  {reel.audio.title}
                </p>
                <p className="truncate text-[9.5px] text-slate-500">
                  {reel.audio.artist} · {reel.audio.uses.toLocaleString('en-US')} reels using
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-fuchsia-400/15 bg-fuchsia-400/[0.06] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-fuchsia-300/80">
                Trending
              </span>
            </div>

            <div className="mt-4">
              <EngagementChart reel={reel} timeframe={timeframe} />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={reel.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-white shadow-lg transition hover:brightness-110',
                  isInstagram
                    ? 'bg-[linear-gradient(100deg,#FA7E1E,#D62976_52%,#4F5BD5)] shadow-ig-pink/20'
                    : 'bg-fb shadow-fb/20 hover:bg-[#1a75ff]',
                )}
              >
                <span className="grid h-5 w-5 place-items-center rounded-md bg-white/15">
                  <PlatformIcon platform={reel.platform} className="h-3.5 w-3.5" />
                </span>
                View original on {platformLabel}
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[11px] font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </button>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[8.5px] text-slate-500">
              <Link2 className="h-2.5 w-2.5" />
              Opens the authentic {platformLabel} Reel directly on {platformLabel}.
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[8.5px] text-slate-500">
              <Clock3 className="h-2.5 w-2.5" />
              Posted {formatDateTime(reel.postedAt)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
