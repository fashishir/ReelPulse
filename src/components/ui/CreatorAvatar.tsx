import { BadgeCheck } from 'lucide-react'
import { cn } from '../../lib/cn'
import { hashString, initials } from '../../lib/format'

const AVATAR_PALETTES = [
  ['#F472B6', '#7C3AED'],
  ['#38BDF8', '#2563EB'],
  ['#FBBF24', '#EA580C'],
  ['#34D399', '#0D9488'],
  ['#A78BFA', '#DB2777'],
  ['#FB7185', '#9333EA'],
  ['#22D3EE', '#4F46E5'],
  ['#FDE68A', '#D97706'],
  ['#86EFAC', '#16A34A'],
  ['#C4B5FD', '#4F46E5'],
]

export function CreatorAvatar({
  name,
  handle,
  className,
}: {
  name: string
  handle: string
  className?: string
}) {
  const [from, to] = AVATAR_PALETTES[hashString(handle) % AVATAR_PALETTES.length]
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-display text-[10px] font-bold text-white ring-1 ring-white/20',
        className ?? 'h-8 w-8',
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn('h-3.5 w-3.5 shrink-0 text-sky-400', className)}
      aria-label="Verified creator"
    />
  )
}
