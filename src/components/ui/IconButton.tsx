import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'accent'
}

export function IconButton({
  label,
  tone = 'default',
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'group/icon relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ig-pink/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
        tone === 'accent'
          ? 'border-ig-pink/30 bg-ig-pink/10 text-pink-200 hover:bg-ig-pink/20'
          : 'border-white/[0.08] bg-white/[0.035] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
