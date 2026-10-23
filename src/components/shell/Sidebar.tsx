import {
  Disc3,
  Flame,
  Layers3,
  Loader2,
  Music4,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings2,
  Sparkles,
} from 'lucide-react'
import type { AudioSummary, CategoryFilter, DashboardSummary, FeedFilters } from '../../types'
import { CATEGORIES } from '../../data/categories'
import { relativeTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { BrandMark } from '../ui/BrandMark'

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  filters,
  summary,
  audio,
  lastSyncedAt,
  isSyncing,
  onSelectCategory,
  onTrendingNow,
  onSelectAudio,
  onOpenAudio,
  onOpenAdmin,
  onSync,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  filters: FeedFilters
  summary: DashboardSummary | null
  audio: AudioSummary[]
  lastSyncedAt: string
  isSyncing: boolean
  onSelectCategory: (category: CategoryFilter) => void
  onTrendingNow: () => void
  onSelectAudio: (title: string) => void
  onOpenAudio: () => void
  onOpenAdmin: () => void
  onSync: () => void
}) {
  const totalCount = summary
    ? Object.values(summary.categoryCounts).reduce((sum, count) => sum + count, 0)
    : 0
  const topAudios = audio.slice(0, 3)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[0.07] lg:flex',
        'bg-[linear-gradient(180deg,rgba(11,17,32,0.97),rgba(5,9,18,0.99))] backdrop-blur-2xl',
        'transition-[width] duration-300 ease-out',
        collapsed ? 'w-20' : 'w-[264px]',
      )}
      aria-label="ReelPulse navigation"
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-white/[0.06]',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <BrandMark compact={collapsed} />
        {!collapsed && (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
            Real Data
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[72px] z-10 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-[#131c2f] text-slate-400 shadow-lg transition hover:border-white/20 hover:text-white"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-3 w-3" />
        ) : (
          <PanelLeftClose className="h-3 w-3" />
        )}
      </button>

      <nav className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div>
          {!collapsed && (
            <p className="px-2 pb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Discover
            </p>
          )}
          <button
            type="button"
            onClick={onTrendingNow}
            title="Trending now"
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition-colors',
              collapsed && 'justify-center px-0',
              filters.category === 'all' && filters.search === ''
                ? 'bg-white/[0.075] text-white'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
            )}
          >
            <Flame
              className={cn(
                'h-4 w-4 shrink-0',
                filters.category === 'all' && filters.search === ''
                  ? 'text-ig-orange'
                  : 'text-slate-500',
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1">Trending now</span>
                <span className="tabular text-[9px] text-slate-600">{totalCount}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAudio}
            title="Trending audio"
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white',
              collapsed && 'justify-center px-0',
            )}
          >
            <Music4 className="h-4 w-4 shrink-0 text-slate-500" />
            {!collapsed && <span className="flex-1">Trending audio</span>}
          </button>
        </div>

        <div>
          {!collapsed && (
            <p className="flex items-center gap-1.5 px-2 pb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              <Sparkles className="h-2.5 w-2.5" />
              Categories
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            title="All reels"
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] transition-colors',
              collapsed && 'justify-center px-0',
              filters.category === 'all'
                ? 'text-white'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
            )}
          >
            <Layers3 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            {!collapsed && (
              <>
                <span className="flex-1">All reels</span>
                <span className="tabular text-[9px] text-slate-600">{totalCount}</span>
              </>
            )}
          </button>
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            const active = filters.category === category.id
            const count = summary?.categoryCounts[category.id] ?? 0
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                title={`${category.label} (${count})`}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-white/[0.06] font-medium text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                )}
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: active ? category.accent : undefined }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{category.label}</span>
                    <span className="tabular text-[9px] text-slate-600">{count}</span>
                  </>
                )}
              </button>
            )
          })}
        </div>

        {!collapsed && (
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                Audio heat
              </p>
              <button
                type="button"
                onClick={onOpenAudio}
                className="text-[8.5px] font-medium text-slate-600 transition hover:text-slate-300"
              >
                View all
              </button>
            </div>
            <div className="space-y-0.5">
              {topAudios.map((entry, index) => (
                <button
                  key={`${entry.audio.title}-${entry.audio.artist}`}
                  type="button"
                  onClick={() => onSelectAudio(entry.audio.title)}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                  title={`Show reels using ${entry.audio.title}`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/[0.07] bg-white/[0.04] font-display text-[9px] font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] font-medium text-slate-300 group-hover:text-white">
                      {entry.audio.title}
                    </span>
                    <span className="block truncate text-[9px] text-slate-600">
                      {entry.audio.artist}
                    </span>
                  </span>
                  <Disc3 className="h-3 w-3 shrink-0 text-slate-600 transition group-hover:animate-[spin_4s_linear_infinite] group-hover:text-ig-pink" />
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className={cn('shrink-0 border-t border-white/[0.06] p-3', collapsed && 'px-2')}>
        {!collapsed ? (
          <>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Tracking
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <p className="mt-1.5 font-display text-[15px] font-bold tracking-tight text-white">
                {summary?.trackedReels ?? 0} reels
                <span className="mx-1 text-slate-600">·</span>
                {summary?.trackedCreators ?? 0} creators
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500">
                Synced {relativeTime(lastSyncedAt)}
              </p>
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] py-1.5 text-[10px] font-semibold text-slate-200 transition hover:bg-white/[0.1] disabled:opacity-60"
              >
                {isSyncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {isSyncing ? 'Syncing…' : 'Sync now'}
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10.5px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
              API settings
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              title="Sync data"
              aria-label="Sync data"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              title="API settings"
              aria-label="API settings"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
