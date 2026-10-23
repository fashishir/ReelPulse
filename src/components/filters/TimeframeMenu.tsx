import { CalendarDays, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Timeframe } from '../../types'
import { TIMEFRAME_META, TIMEFRAME_ORDER } from '../../lib/constants'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cn } from '../../lib/cn'

export function TimeframeMenu({
  value,
  onChange,
  className,
}: {
  value: Timeframe
  onChange: (value: Timeframe) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
  const current = TIMEFRAME_META[value]

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Timeframe: ${current.label}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.075] bg-white/[0.035] px-2.5 text-[11px] font-semibold text-slate-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
      >
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.short}</span>
        <ChevronDown
          className={cn('h-3 w-3 text-slate-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select timeframe"
          className="absolute right-0 top-full z-50 mt-2 w-52 origin-top-right animate-[scale-in_.18s_ease-out] overflow-hidden rounded-xl border border-white/10 bg-[#0d1526]/97 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        >
          {TIMEFRAME_ORDER.map((timeframe) => {
            const meta = TIMEFRAME_META[timeframe]
            const active = timeframe === value
            return (
              <button
                key={timeframe}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(timeframe)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                  active ? 'bg-white/[0.07] text-white' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white',
                )}
              >
                <span>
                  <span className="block text-xs font-semibold">{meta.label}</span>
                  <span className="block text-[10px] text-slate-500">{meta.description}</span>
                </span>
                {active && <Check className="h-3.5 w-3.5 text-ig-pink" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
