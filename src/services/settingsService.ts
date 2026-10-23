import type { ApiSettings, DataSource, SyncState, Timeframe } from '../types'

const SETTINGS_KEY = 'reelpulse.settings.v1'
const SYNC_KEY = 'reelpulse.sync.v1'
const SOURCES: DataSource[] = ['demo', 'rapidapi', 'apify', 'meta']
const TIMEFRAMES: Timeframe[] = ['today', 'week', 'month']

export const DEFAULT_SETTINGS: ApiSettings = {
  source: 'demo',
  rapidApiKey: '',
  rapidApiHost: '',
  apifyToken: '',
  apifyActorId: '',
  metaAccessToken: '',
  metaIgUserId: '',
  autoSync: true,
  defaultTimeframe: 'today',
}

export function loadSettings(): ApiSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<ApiSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      source: SOURCES.includes(parsed.source as DataSource)
        ? (parsed.source as DataSource)
        : DEFAULT_SETTINGS.source,
      defaultTimeframe: TIMEFRAMES.includes(parsed.defaultTimeframe as Timeframe)
        ? (parsed.defaultTimeframe as Timeframe)
        : DEFAULT_SETTINGS.defaultTimeframe,
      autoSync:
        typeof parsed.autoSync === 'boolean' ? parsed.autoSync : DEFAULT_SETTINGS.autoSync,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: ApiSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage can be unavailable in private/incognito contexts. The in-memory
    // session still works; settings just won't survive a reload.
  }
}

export function loadSyncState(): SyncState {
  try {
    const raw = window.localStorage.getItem(SYNC_KEY)
    if (!raw) {
      return {
        lastSyncedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        syncCount: 4,
      }
    }
    const parsed = JSON.parse(raw) as Partial<SyncState>
    const parsedDate = parsed.lastSyncedAt ? new Date(parsed.lastSyncedAt) : null
    return {
      lastSyncedAt:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString()
          : new Date().toISOString(),
      syncCount: typeof parsed.syncCount === 'number' ? parsed.syncCount : 1,
    }
  } catch {
    return { lastSyncedAt: new Date().toISOString(), syncCount: 1 }
  }
}

export function saveSyncState(state: SyncState): void {
  try {
    window.localStorage.setItem(SYNC_KEY, JSON.stringify(state))
  } catch {
    // See saveSettings.
  }
}

export function maskSecret(value: string): string {
  if (!value) return ''
  if (value.length <= 4) return '•'.repeat(value.length)
  return `${'•'.repeat(Math.min(12, Math.max(4, value.length - 4)))}${value.slice(-4)}`
}

export function resetWorkspaceStorage(): void {
  try {
    const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index),
    ).filter((key): key is string => Boolean(key?.startsWith('reelpulse.')))
    keys.forEach((key) => window.localStorage.removeItem(key))
    saveSettings({ ...DEFAULT_SETTINGS })
    saveSyncState({
      lastSyncedAt: new Date().toISOString(),
      syncCount: 0,
    })
  } catch {
    // No-op when storage is unavailable.
  }
}
