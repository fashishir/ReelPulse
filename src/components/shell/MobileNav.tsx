import { Compass, Home, Loader2, Music4, RefreshCw, Settings2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export type MobileSection = 'feed' | 'explore' | 'audio' | 'settings'

export function MobileNav({
  active,
  isSyncing,
  onFeed,
  onExplore,
  onAudio,
  onSync,
  onSettings,
}: {
  active: MobileSection
  isSyncing: boolean
  onFeed: () => void
  onExplore: () => void
  onAudio: () => void
  onSync: () => void
  onSettings: () => void
}) {
  const items = [
    { id: 'feed' as const, label: 'Feed', icon: Home, onClick: onFeed },
    { id: 'explore' as const, label: 'Explore', icon: Compass, onClick: onExplore },
    { id: 'sync' as const, label: 'Sync', icon: RefreshCw, onClick: onSync },
    { id: 'audio' as const, label: 'Audio', icon: Music4, onClick: onAudio },
    { id: 'settings' as const, label: 'Settings', icon: Settings2, onClick: onSettings },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080e1b]/95 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-end justify-around px-2 pb-1.5 pt-2">
        {items.map((item) => {
          const Icon = item.icon
          const isSync = item.id === 'sync'
          const isActive = item.id === active

          if (isSync) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={isSyncing}
                className="group relative -mt-5 flex w-14 flex-col items-center gap-1 disabled:opacity-80"
                aria-label={isSyncing ? 'Syncing data' : 'Sync data'}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-ig-orange via-ig-pink to-ig-indigo shadow-[0_8px_24px_-8px_rgba(214,41,118,0.9)] ring-4 ring-[#080e1b] transition-transform duration-200 group-active:scale-95">
                  {isSyncing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-white" />
                  )}
                </span>
                <span className="text-[9px] font-semibold text-slate-300">
                  {isSyncing ? 'Syncing' : 'Sync'}
                </span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                'flex w-14 flex-col items-center gap-1 rounded-xl py-1 transition-colors',
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300',
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-ig-pink')} strokeWidth={2} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
