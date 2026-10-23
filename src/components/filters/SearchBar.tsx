import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'

export function SearchBar({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className={cn(
        'relative flex h-9 items-center gap-2 rounded-xl border border-white/[0.075] bg-white/[0.035] px-3 transition-all',
        'focus-within:border-ig-pink/35 focus-within:bg-white/[0.055] focus-within:ring-2 focus-within:ring-ig-pink/10',
        className,
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            onChange('')
          }
        }}
        placeholder="Search creators, captions, audio…"
        aria-label="Search trending reels by creator, caption, hashtag, or audio"
        spellCheck={false}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-100 placeholder:text-slate-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="-mr-1 grid h-5 w-5 place-items-center rounded-full text-slate-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      ) : (
        <kbd className="hidden shrink-0 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-sans text-[9px] font-medium text-slate-500 lg:inline">
          /
        </kbd>
      )}
    </div>
  )
}
