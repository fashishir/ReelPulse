import { useId } from 'react'
import type { CategoryId, Reel } from '../../types'
import { CATEGORY_MAP } from '../../data/categories'
import { hashString } from '../../lib/format'
import { cn } from '../../lib/cn'
import { PosterPattern } from './PosterPattern'

interface PosterPalette {
  base: string
  mid: string
  hot: string
  accent: string
}

const CATEGORY_PALETTES: Record<CategoryId, PosterPalette> = {
  tech: { base: '#03101f', mid: '#0b3b63', hot: '#0e7490', accent: '#38bdf8' },
  comedy: { base: '#1c1204', mid: '#5c3510', hot: '#b45309', accent: '#fbbf24' },
  fitness: { base: '#04150f', mid: '#064e3b', hot: '#0f766e', accent: '#34d399' },
  food: { base: '#1a0b04', mid: '#6b2d10', hot: '#c2410c', accent: '#fb923c' },
  fashion: { base: '#1c0712', mid: '#701a45', hot: '#be185d', accent: '#f472b6' },
  travel: { base: '#04181c', mid: '#155e75', hot: '#0e7490', accent: '#22d3ee' },
  gaming: { base: '#100a24', mid: '#3b1d7a', hot: '#6d28d9', accent: '#a78bfa' },
  finance: { base: '#0d1404', mid: '#365314', hot: '#4d7c0f', accent: '#a3e635' },
  music: { base: '#1b061d', mid: '#701a75', hot: '#a21caf', accent: '#e879f9' },
  education: { base: '#070f24', mid: '#1e3a8a', hot: '#1d4ed8', accent: '#60a5fa' },
}

export function ReelPoster({
  reel,
  className,
  compact = false,
}: {
  reel: Reel
  className?: string
  compact?: boolean
}) {
  const rawId = useId().replace(/:/g, '')
  const uid = `p${rawId}`
  const palette = CATEGORY_PALETTES[reel.category]
  const meta = CATEGORY_MAP[reel.category]
  const seed = hashString(`${reel.id}-${reel.creator.handle}`)
  const angle = 138 + (seed % 32)
  const glowX = 12 + (seed % 26)
  const glowY = 4 + ((seed >> 3) % 16)
  const CategoryIcon = meta.icon

  return (
    <div
      className={cn('relative isolate h-full w-full overflow-hidden bg-ink-950', className)}
      style={{ containerType: 'inline-size' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(85% 58% at ${glowX}% ${glowY}%, ${palette.hot}aa 0%, transparent 58%)`,
            `radial-gradient(75% 55% at 92% 24%, ${palette.accent}3d 0%, transparent 62%)`,
            `linear-gradient(${angle}deg, ${palette.base} 0%, ${palette.mid} 48%, #04070f 100%)`,
          ].join(', '),
        }}
      />

      {reel.thumbnailUrl && (
        <img
          src={reel.thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      <div className="absolute inset-0 transition-transform duration-[1100ms] ease-out group-hover:scale-[1.045]">
        <div
          className="absolute -left-16 top-1/4 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: `${palette.accent}24` }}
        />
        <div
          className="absolute -right-12 bottom-1/3 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${palette.hot}33` }}
        />
        <svg
          viewBox="0 0 360 640"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <PosterPattern category={reel.category} accent={palette.accent} seed={seed} uid={uid} />
        </svg>
        <CategoryIcon
          className="absolute right-[-28px] top-[14%] h-44 w-44 -rotate-12 text-white/[0.06]"
          strokeWidth={0.65}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(4,7,15,0.96)_0%,rgba(4,7,15,0.62)_24%,rgba(4,7,15,0.08)_52%,rgba(4,7,15,0.26)_100%)]" />
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -inset-y-12 left-[-35%] w-[28%] rotate-12 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent group-hover:animate-[light-sweep_1.4s_ease-out]" />
      </div>

      {compact ? (
        <div className="absolute inset-0 grid place-items-center">
          <CategoryIcon className="h-5 w-5 text-white/55" strokeWidth={1.6} />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-4 pr-12">
          <div className="mb-2 flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.22em] text-white/45">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
            {reel.creator.handle}
          </div>
          <p
            className="line-clamp-4 font-display font-extrabold leading-[1.05] tracking-[-0.03em] text-white text-shadow-strong"
            style={{ fontSize: 'clamp(1.02rem, 7.4cqw, 1.52rem)' }}
          >
            {reel.hook}
          </p>
        </div>
      )}
    </div>
  )
}
