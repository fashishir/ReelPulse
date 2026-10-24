import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type {
  ApiSettings,
  CategoryFilter,
  CategoryId,
  FeedFilters,
  PlatformFilter,
  Reel,
  SyncState,
  Timeframe,
} from './types'
import { CATEGORY_IDS } from './types'
import { PLATFORM_LABEL, SORT_META, TIMEFRAME_META } from './lib/constants'
import { cn } from './lib/cn'
import { useDashboard } from './hooks/useDashboard'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  loadSettings,
  loadSyncState,
  resetWorkspaceStorage,
  saveSettings,
  saveSyncState,
} from './services/settingsService'
import { syncNow, setReelProvider, getReelProvider } from './services/dataService'
import { createRapidApiProvider } from './services/providers/rapidApiProvider'
import {
  createFacebookProvider,
  FACEBOOK_SNAPSHOT_EVENT,
  type FacebookProviderConfig,
  type FacebookSnapshotEvent,
} from './services/providers/facebookProvider'
import { demoProvider } from './services/providers/demoProvider'
import { useToast } from './components/ui/Toast'
import { Sidebar } from './components/shell/Sidebar'
import { Header } from './components/shell/Header'
import { MobileNav } from './components/shell/MobileNav'
import { BackgroundFX } from './components/shell/BackgroundFX'
import { PageIntro } from './components/dashboard/PageIntro'
import { KpiRow } from './components/dashboard/KpiRow'
import { FeedToolbar } from './components/filters/FeedToolbar'
import { ReelGrid } from './components/dashboard/ReelGrid'
import { ReelModal } from './components/overlay/ReelModal'
import { AdminModal } from './components/overlay/AdminModal'
import { ExploreSheet } from './components/overlay/ExploreSheet'

const EMPTY_COUNTS = Object.fromEntries(
  CATEGORY_IDS.map((id) => [id, 0]),
) as Record<CategoryId, number>

const AUTO_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000

const MIN_FACEBOOK_REFRESH_MINUTES = 3

/** The initial-sync threshold follows the active source. */
function autoSyncIntervalMs(settings: ApiSettings): number {
  if (settings.source !== 'facebook') return AUTO_SYNC_INTERVAL_MS
  return Math.max(MIN_FACEBOOK_REFRESH_MINUTES, settings.fbRefreshMinutes) * 60_000
}

/** Parse the settings textarea into a page list (empty list = server env). */
function parseSettingsPages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 50)
}

function App() {
  const toast = useToast()
  const [settings, setSettings] = useState<ApiSettings>(loadSettings)
  const [filters, setFilters] = useState<FeedFilters>(() => ({
    platform: 'all',
    category: 'all',
    sortBy: 'views',
    timeframe: settings.defaultTimeframe,
    search: '',
  }))
  const [syncState, setSyncState] = useState<SyncState>(loadSyncState)
  const [syncNonce, setSyncNonce] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    'reelpulse.sidebar.v1',
    false,
  )
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [exploreTab, setExploreTab] = useState<'categories' | 'audio'>('categories')

  // Auto-switch provider based on settings
  useEffect(() => {
    if (settings.source === 'facebook') {
      const config: FacebookProviderConfig = {
        via: settings.fbVia,
      }
      const pages = parseSettingsPages(settings.fbPages)
      if (pages.length > 0) {
        config.pages = pages
      }
      setReelProvider(createFacebookProvider(config))
    } else if (settings.source === 'rapidapi' && settings.rapidApiKey) {
      setReelProvider(
        createRapidApiProvider({
          apiKey: settings.rapidApiKey,
          host: settings.rapidApiHost || 'instagram-scraper-api2.p.rapidapi.com',
        }),
      )
    } else {
      setReelProvider(demoProvider)
    }
  }, [
    settings.source,
    settings.rapidApiKey,
    settings.rapidApiHost,
    settings.fbVia,
    settings.fbPages,
  ])

  const feedRef = useRef<HTMLElement>(null)
  const isSyncingRef = useRef(false)
  const syncStateRef = useRef(syncState)
  const autoSyncCheckedRef = useRef(false)

  const { reels, summary, audio, isLoading, isRefreshing, error, retry } = useDashboard(
    filters,
    syncNonce,
  )

  useEffect(() => {
    syncStateRef.current = syncState
  }, [syncState])

  const updateFilters = useCallback((patch: Partial<FeedFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }, [])

  const scrollToFeed = useCallback(() => {
    window.setTimeout(() => {
      feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [])

  const runSync = useCallback(
    async (options?: { silent?: boolean }) => {
      if (isSyncingRef.current) return
      isSyncingRef.current = true
      setIsSyncing(true)
      try {
        const result = await syncNow()
        const nextState: SyncState = {
          lastSyncedAt: result.syncedAt,
          syncCount: syncStateRef.current.syncCount + 1,
        }
        syncStateRef.current = nextState
        setSyncState(nextState)
        saveSyncState(nextState)
        setSyncNonce((nonce) => nonce + 1)
        toast({
          title: options?.silent ? 'Background sync complete' : 'Feed synced',
          description: `${result.reels} reels refreshed via ${getReelProvider().label}. Rankings are up to date.`,
          tone: 'success',
        })
      } catch (cause) {
        toast({
          title: 'Sync failed',
          description:
            cause instanceof Error ? cause.message : 'Something went wrong. Please try again.',
          tone: 'warning',
        })
      } finally {
        isSyncingRef.current = false
        setIsSyncing(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (autoSyncCheckedRef.current) return
    autoSyncCheckedRef.current = true
    if (!settings.autoSync) return
    const intervalMs = autoSyncIntervalMs(settings)
    const elapsed = Date.now() - new Date(syncStateRef.current.lastSyncedAt).getTime()
    if (elapsed >= intervalMs) {
      void runSync({ silent: true })
    }
  }, [settings.autoSync, runSync, settings.source, settings.fbRefreshMinutes])

  // While the Live Facebook source is active, keep polling the server
  // snapshot every N minutes — but only while the tab is visible. The
  // server serves instantly and refreshes in the background, so a poll
  // never blocks the UI.
  useEffect(() => {
    if (settings.source !== 'facebook') return
    const intervalMs = Math.max(
      MIN_FACEBOOK_REFRESH_MINUTES,
      settings.fbRefreshMinutes,
    ) * 60_000
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      if (isSyncingRef.current) return
      setSyncNonce((nonce) => nonce + 1)
    }, intervalMs)
    return () => window.clearInterval(intervalId)
  }, [settings.source, settings.fbRefreshMinutes])

  // The Facebook provider reports the true snapshot age on every fetch,
  // including silent polls. Reflect it in the sync state (without inflating
  // the sync counter) and warn once when the snapshot goes stale.
  const staleToastRef = useRef(false)
  useEffect(() => {
    if (settings.source !== 'facebook') return
    const handleSnapshotEvent = (event: Event) => {
      const detail = (event as FacebookSnapshotEvent).detail
      if (!detail?.syncedAt) return

      const nextState: SyncState = {
        lastSyncedAt: detail.syncedAt,
        syncCount: syncStateRef.current.syncCount,
      }
      syncStateRef.current = nextState
      setSyncState(nextState)
      saveSyncState(nextState)

      if (detail.stale && !staleToastRef.current) {
        staleToastRef.current = true
        toast({
          title: 'Snapshot is a few minutes old',
          description:
            detail.warning ??
            'The fresh Facebook scrape failed on the server; showing the last good snapshot. Try Sync now.',
          tone: 'warning',
        })
      } else if (!detail.stale && staleToastRef.current) {
        staleToastRef.current = false
      }
    }
    window.addEventListener(FACEBOOK_SNAPSHOT_EVENT, handleSnapshotEvent)
    return () => window.removeEventListener(FACEBOOK_SNAPSHOT_EVENT, handleSnapshotEvent)
  }, [settings.source, toast])

  const handleSync = useCallback(() => {
    void runSync()
  }, [runSync])

  const handleTrendingNow = useCallback(() => {
    updateFilters({ category: 'all', search: '' })
    scrollToFeed()
  }, [scrollToFeed, updateFilters])

  const handleSelectCategory = useCallback(
    (category: CategoryFilter) => {
      updateFilters({ category })
      scrollToFeed()
    },
    [scrollToFeed, updateFilters],
  )

  const handleSelectAudio = useCallback(
    (title: string) => {
      updateFilters({ search: title, category: 'all' })
      scrollToFeed()
      toast({
        title: 'Audio filter applied',
        description: `Showing every reel using “${title}”.`,
        tone: 'info',
      })
    },
    [scrollToFeed, toast, updateFilters],
  )

  const openExplore = useCallback((tab: 'categories' | 'audio') => {
    setExploreTab(tab)
    setExploreOpen(true)
    setAdminOpen(false)
    setSelectedReel(null)
  }, [])

  const openAdmin = useCallback(() => {
    setAdminOpen(true)
    setExploreOpen(false)
  }, [])

  const handleSaveSettings = useCallback((nextSettings: ApiSettings) => {
    setSettings(nextSettings)
    saveSettings(nextSettings)
    setSyncNonce((nonce) => nonce + 1)
  }, [])

  const handleResetWorkspace = useCallback(() => {
    resetWorkspaceStorage()
    window.location.reload()
  }, [])

  const closeReel = useCallback(() => setSelectedReel(null), [])
  const closeAdmin = useCallback(() => setAdminOpen(false), [])
  const closeExplore = useCallback(() => setExploreOpen(false), [])
  const selectReel = useCallback((reel: Reel) => setSelectedReel(reel), [])
  const handleOpenReel = useCallback((reel: Reel) => setSelectedReel(reel), [])

  const mobileActive = adminOpen
    ? 'settings'
    : exploreOpen
      ? exploreTab === 'audio'
        ? 'audio'
        : 'explore'
      : 'feed'

  const counts = summary?.categoryCounts ?? EMPTY_COUNTS
  const hasError = Boolean(error)

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />

      <a
        href="#feed"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-slate-950"
      >
        Skip to trending feed
      </a>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        filters={filters}
        summary={summary}
        audio={audio}
        lastSyncedAt={syncState.lastSyncedAt}
        isSyncing={isSyncing}
        onSelectCategory={handleSelectCategory}
        onTrendingNow={handleTrendingNow}
        onSelectAudio={handleSelectAudio}
        onOpenAudio={() => openExplore('audio')}
        onOpenAdmin={openAdmin}
        onSync={handleSync}
      />

      <div
        className={cn(
          'relative z-10 flex min-h-screen flex-col transition-[padding-left] duration-300 ease-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[264px]',
        )}
      >
        <Header
          filters={filters}
          isSyncing={isSyncing}
          isRefreshing={isRefreshing}
          onPlatformChange={(platform: PlatformFilter) => updateFilters({ platform })}
          onTimeframeChange={(timeframe: Timeframe) => updateFilters({ timeframe })}
          onSearchChange={(search: string) => updateFilters({ search })}
          onSync={handleSync}
          onOpenAdmin={openAdmin}
        />

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-6 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4 sm:gap-5">
            <PageIntro
              timeframe={filters.timeframe}
              trackedReels={summary?.trackedReels ?? 0}
              lastSyncedAt={syncState.lastSyncedAt}
              isRefreshing={isRefreshing || isSyncing}
            />

            <KpiRow
              summary={summary}
              filters={filters}
              isLoading={isLoading}
              onOpenReel={handleOpenReel}
              onSelectCategory={handleSelectCategory}
              onOpenAudio={() => openExplore('audio')}
            />

            {hasError && (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-rose-200/80">
                  {error}. Showing the last successful feed where possible.
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-rose-200 transition hover:bg-rose-400/[0.14]"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}

            <section
              id="feed"
              ref={feedRef}
              aria-label="Trending reel feed"
              className="scroll-mt-24 space-y-3.5"
            >
              <FeedToolbar
                filters={filters}
                counts={counts}
                resultCount={reels.length}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onFiltersChange={updateFilters}
                onReset={() => updateFilters({ platform: 'all', category: 'all', search: '' })}
              />

              <div className="flex items-end justify-between gap-3 px-0.5 pt-0.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-[17px] font-extrabold tracking-[-0.025em] text-white sm:text-lg">
                      Trending now
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Ranked
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Sorted by {SORT_META[filters.sortBy].label} ·{' '}
                    {TIMEFRAME_META[filters.timeframe].description.toLowerCase()}
                  </p>
                </div>
                <p className="hidden shrink-0 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-500 sm:block">
                  {PLATFORM_LABEL[filters.platform]} ·{' '}
                  {settings.source === 'demo'
                    ? 'Real Curated Data'
                    : settings.source === 'facebook'
                      ? 'Live Facebook scraping'
                      : 'Live RapidAPI'}
                </p>
              </div>

              <ReelGrid
                reels={reels}
                filters={filters}
                isLoading={isLoading}
                onOpen={handleOpenReel}
                onReset={() =>
                  updateFilters({ platform: 'all', category: 'all', search: '' })
                }
              />
            </section>

            <footer className="mt-2 flex flex-col gap-1.5 border-t border-white/[0.06] py-5 text-[9px] leading-relaxed text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                ReelPulse · Trending Reels intelligence across Facebook and Instagram.
              </p>
              <p className="shrink-0">
                React + Tailwind · switch data providers in API settings
              </p>
            </footer>
          </div>
        </main>
      </div>

      <MobileNav
        active={mobileActive}
        isSyncing={isSyncing}
        onFeed={() => {
          setExploreOpen(false)
          setAdminOpen(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onExplore={() => openExplore('categories')}
        onAudio={() => openExplore('audio')}
        onSync={handleSync}
        onSettings={openAdmin}
      />

      <ReelModal
        reel={selectedReel}
        list={reels}
        timeframe={filters.timeframe}
        onClose={closeReel}
        onSelect={selectReel}
      />

      <AdminModal
        open={adminOpen}
        settings={settings}
        lastSyncedAt={syncState.lastSyncedAt}
        syncCount={syncState.syncCount}
        isSyncing={isSyncing}
        onClose={closeAdmin}
        onSave={handleSaveSettings}
        onSync={handleSync}
        onResetWorkspace={handleResetWorkspace}
      />

      <ExploreSheet
        open={exploreOpen}
        initialTab={exploreTab}
        onClose={closeExplore}
        counts={counts}
        audio={audio}
        currentCategory={filters.category}
        timeframe={filters.timeframe}
        onSelectCategory={handleSelectCategory}
        onSelectAudio={handleSelectAudio}
      />
    </div>
  )
}

export default App
