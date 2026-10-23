import { cn } from '../../lib/cn'

const MEDAL_STYLES: Record<number, string> = {
  1: 'bg-[linear-gradient(135deg,#fef3c7,#fbbf24_45%,#b45309)] text-amber-950 ring-amber-200/60 shadow-[0_0_26px_-6px_rgba(251,191,36,0.85)]',
  2: 'bg-[linear-gradient(135deg,#f8fafc,#cbd5e1_50%,#94a3b8)] text-slate-900 ring-white/60 shadow-[0_0_22px_-8px_rgba(226,232,240,0.6)]',
  3: 'bg-[linear-gradient(135deg,#fed7aa,#c2410c_58%,#7c2d12)] text-orange-950 ring-orange-300/50 shadow-[0_0_22px_-8px_rgba(194,65,12,0.7)]',
}

export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  const medal = MEDAL_STYLES[rank]
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center gap-0.5 rounded-full px-2 font-display text-[11px] font-extrabold ring-1 ring-inset backdrop-blur-md',
        medal ?? 'bg-black/55 text-white ring-white/15',
        className,
      )}
      title={`Rank #${rank}`}
      aria-label={`Rank ${rank}`}
    >
      <span className={cn('text-[8px] leading-none', medal ? 'opacity-55' : 'text-white/45')}>#</span>
      <span className="tabular leading-none">{rank}</span>
    </span>
  )
}
