import { Loader2, RefreshCw, Settings2 } from 'lucide-react'
import type { FeedFilters, PlatformFilter, Timeframe } from '../../types'
import { BrandMark } from '../ui/BrandMark'
import { IconButton } from '../ui/IconButton'
import { PlatformSwitcher } from '../filters/PlatformSwitcher'
import { TimeframeMenu } from '../filters/TimeframeMenu'
import { SearchBar } from '../filters/SearchBar'
import { cn } from '../../lib/cn'

export function Header({
  filters,
  isSyncing,
  isRefreshing,
  onPlatformChange,
  onTimeframeChange,
  onSearchChange,
  onSync,
  onOpenAdmin,
}: {
  filters: FeedFilters
  isSyncing: boolean
  isRefreshing: boolean
  onPlatformChange: (platform: PlatformFilter) => void
  onTimeframeChange: (timeframe: Timeframe) => void
  onSearchChange: (search: string) => void
  onSync: () => void
  onOpenAdmin: () => void
}) {
  return (
    <header className="relative z-30 border-b border-white/[0.06] bg-[#070c18]/60 backdrop-blur-xl lg:sticky lg:top-0">
      <div className="flex h-14 items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            aria-label={isSyncing ? 'Syncing data' : 'Sync data'}
            title={isSyncing ? 'Syncing data' : 'Sync data'}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-60"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          <IconButton label="API settings" onClick={onOpenAdmin}>
            <Settings2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-3 sm:px-6 md:flex-row md:items-center md:gap-2 lg:h-16 lg:gap-3 lg:px-6 lg:pb-0 xl:px-8">
        <div className="hidden items-center gap-2 pr-1 lg:flex">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Discover
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-[11px] font-semibold text-slate-300">Trending reels</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PlatformSwitcher
            value={filters.platform}
            onChange={onPlatformChange}
            className="flex-1 justify-between sm:flex-none sm:justify-start"
          />
          <TimeframeMenu
            value={filters.timeframe}
            onChange={onTimeframeChange}
            className="shrink-0"
          />
        </div>

        <SearchBar
          value={filters.search}
          onChange={onSearchChange}
          className="order-last w-full md:order-none md:ml-auto md:max-w-[280px] lg:w-[250px] xl:w-[310px]"
        />

        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.075] bg-white/[0.035] px-2.5 text-[11px] font-semibold text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:cursor-wait disabled:opacity-70',
              isSyncing && 'border-ig-pink/20 bg-ig-pink/[0.06] text-pink-200',
            )}
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline">{isSyncing ? 'Syncing…' : 'Sync now'}</span>
          </button>
          <IconButton label="API settings" onClick={onOpenAdmin}>
            <Settings2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div
          className={cn(
            'h-full w-1/3 bg-gradient-to-r from-transparent via-ig-pink to-transparent transition-opacity',
            isRefreshing ? 'animate-[loading-bar_1.4s_ease-in-out_infinite] opacity-100' : 'opacity-0',
          )}
        />
      </div>
    </header>
  )
}
