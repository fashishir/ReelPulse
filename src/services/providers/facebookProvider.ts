import type { Reel } from '../../types'
import type { FetchReelsOptions, ReelProvider } from './types'

/**
 * Live Facebook provider.
 *
 * Talks to the serverless functions in `api/` (deployed on Vercel, or
 * proxied to `vercel dev` in local development). All scraping and all
 * credentials stay server-side; the browser only ever sees normalized,
 * already-scraped reels plus snapshot metadata.
 */
export interface FacebookSnapshotMeta {
  /** ISO timestamp of when the snapshot was scraped. */
  syncedAt: string
  /** True when the served data is older than the configured TTL. */
  stale: boolean
  /** True when a background server refresh is still running. */
  refreshing: boolean
  /** Upstream that produced the rows ('apify' | 'rapidapi'). */
  via: string
  warning?: string
}

/** Dispatched on `window` after every snapshot fetch (successful or not-free). */
export const FACEBOOK_SNAPSHOT_EVENT = 'reelpulse:snapshot'

export type FacebookSnapshotEvent = CustomEvent<FacebookSnapshotMeta>

export interface FacebookProviderConfig {
  /** Base URL of the serverless API. Default `/api`. */
  apiUrl?: string
  /** Scope override — which upstream the server should scrape through. */
  via?: 'apify' | 'rapidapi'
  /** Scope override — tracked pages. Empty = server env (FB_PAGES). */
  pages?: string[]
  /** Scope override — reels per page. */
  limit?: number
}

interface SnapshotPayload {
  reels: Reel[]
  syncedAt: string | null
  via: string
  stale: boolean
  refreshing: boolean
  warning?: string
  error?: string
}

let lastMeta: FacebookSnapshotMeta | null = null

export function getLastFacebookSnapshot(): FacebookSnapshotMeta | null {
  return lastMeta
}

export function createFacebookProvider(config: FacebookProviderConfig = {}): ReelProvider {
  const baseUrl = (config.apiUrl ?? '/api').replace(/\/+$/, '')

  const overrides = () => ({
    via: config.via,
    pages: config.pages && config.pages.length > 0 ? config.pages : undefined,
    limit: config.limit && config.limit > 0 ? config.limit : undefined,
  })

  const request = async (options?: FetchReelsOptions): Promise<SnapshotPayload> => {
    const endpoint = options?.refresh ? `${baseUrl}/refresh` : `${baseUrl}/reels`

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides()),
      })
    } catch {
      throw new Error(
        'The ReelPulse API is unreachable. Start it alongside the dev server with `npx vercel dev` ' +
          '(or deploy to Vercel) — browsing happens through /api/reels.',
      )
    }

    const payload = (await response.json().catch(() => null)) as SnapshotPayload | null

    if (!response.ok) {
      const detail = payload?.error ?? `HTTP ${response.status} ${response.statusText}`
      throw new Error(`Facebook scrape failed: ${detail}`)
    }
    if (!payload) {
      throw new Error('Facebook scrape returned an empty payload.')
    }
    if (!Array.isArray(payload.reels) || payload.reels.length === 0) {
      throw new Error(
        payload.error ??
          'The snapshot contains no reels yet. Try Sync now once the scrape completes.',
      )
    }

    lastMeta = {
      syncedAt: payload.syncedAt ?? new Date().toISOString(),
      stale: payload.stale,
      refreshing: payload.refreshing,
      via: payload.via,
      warning: payload.warning,
    }

    // Let the app surface the honest data age without polluting `syncCount`.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(FACEBOOK_SNAPSHOT_EVENT, { detail: lastMeta }),
      )
    }

    return payload
  }

  return {
    id: 'facebook',
    label: 'Facebook scrape (server)',
    isLive: true,

    async fetchReels(options?: FetchReelsOptions): Promise<Reel[]> {
      const payload = await request(options)
      return payload.reels
    },
  }
}
