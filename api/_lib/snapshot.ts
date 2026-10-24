/**
 * Snapshot orchestration for the Facebook scrape functions.
 *
 * A single in-memory snapshot lives on `globalThis` so warm serverless
 * instances reuse it. Behavior per request:
 *
 *  - fresh snapshot (< TTL)       → serve it immediately.
 *  - stale snapshot               → serve it instantly, then refresh in the
 *                                   background (`waitUntil` keeps the function
 *                                   alive after the response).
 *  - no snapshot yet (cold start) → scrape synchronously (bounded) and serve.
 *
 * A single shared in-flight promise prevents parallel polls from starting
 * duplicate scrapes. The payload always carries the real `syncedAt` age of
 * the data.
 */
import { waitUntil } from '@vercel/functions'
import type { Reel } from '../../src/types'
import {
  loadConfig,
  missingPrerequisites,
  resolveConfig,
  type RequestOverrides,
  type ScrapeConfig,
} from './config'
import {
  buildActorInput,
  datasetItems,
  latestSuccessfulRun,
  RUN_WAIT_MS,
  startActorRun,
} from './apify'
import { scrapePageReelsViaRapidApi } from './rapidapi'
import { normalizeRows } from './normalize'

export interface Snapshot {
  reels: Reel[]
  /** ISO timestamp of when these rows were scraped. */
  syncedAt: string
  /** Which upstream produced the rows ('apify' | 'rapidapi'). */
  via: string
  /** Epoch ms at scrape time (used for TTL math). */
  scrapedAt: number
}

export interface SnapshotPayload {
  reels: Reel[]
  syncedAt: string | null
  via: string
  /** True when the served data is older than the configured TTL. */
  stale: boolean
  /** True when a background refresh has been kicked off for the next poll. */
  refreshing: boolean
  warning?: string
}

interface SnapshotCache {
  key: string
  value: Snapshot | null
  inFlight: Promise<Snapshot> | null
  lastFailure: string | null
}

const CACHE_KEY = 'reelpulse.snapshot.v1' as const

function loadCache(): SnapshotCache {
  const host = globalThis as typeof globalThis & Record<string, unknown>
  if (!host[CACHE_KEY]) {
    host[CACHE_KEY] = {
      key: '',
      value: null,
      inFlight: null,
      lastFailure: null,
    } satisfies SnapshotCache
  }
  return host[CACHE_KEY] as SnapshotCache
}

/** Stable identity of a scrape scope so differing overrides don't share rows. */
function configKey(config: ScrapeConfig): string {
  return JSON.stringify({
    via: config.via,
    actor: config.via === 'apify' ? config.apifyActorId : config.rapidApiHost,
    pages: [...config.pages].sort(),
    limit: config.resultsLimit,
  })
}

// ─── Upstream calls ───────────────────────────────────────────────────────

async function scrape(config: ScrapeConfig): Promise<Snapshot> {
  if (config.via === 'apify') {
    return scrapeViaApify(config)
  }
  const rows = await scrapePageReelsViaRapidApi({
    apiKey: config.rapidApiKey,
    host: config.rapidApiHost,
    resultsLimit: config.resultsLimit,
    pages: config.pages,
  })
  return finishScrape(rows, config)
}

/** On-demand Apify run (used for forced sync or the very first load). */
async function scrapeViaApify(config: ScrapeConfig): Promise<Snapshot> {
  const input = buildActorInput(config.apifyActorInput, {
    startUrls: config.pages,
    resultsLimit: config.resultsLimit,
  })
  const run = await startActorRun(config.apifyToken, config.apifyActorId, input)
  const rows = await datasetItems(
    config.apifyToken,
    run.defaultDatasetId,
    resultBudget(config),
  )
  if (rows.length === 0) {
    throw new Error(
      `Apify actor run ${run.id} (status ${run.status}) produced no rows for the tracked pages.`,
    )
  }
  return finishScrape(rows, config)
}

/**
 * Cheap read path: reuse the latest finished run's dataset instead of
 * starting a new scrape. Only meaningful for the Apify provider.
 */
async function scrapeViaApifyCheap(
  config: ScrapeConfig,
  maxAgeMs: number,
): Promise<Snapshot | null> {
  if (config.via !== 'apify') return null
  try {
    const run = await latestSuccessfulRun(config.apifyToken, config.apifyActorId)
    if (!run) return null
    const finishedMs = Date.parse(run.finishedAt ?? run.startedAt)
    if (!Number.isNaN(finishedMs) && Date.now() - finishedMs > maxAgeMs) {
      return null
    }
    const rows = await datasetItems(
      config.apifyToken,
      run.defaultDatasetId,
      resultBudget(config),
    )
    if (rows.length === 0) return null
    return finishScrape(rows, config)
  } catch {
    return null
  }
}

/** Dataset read budget: all pages × limit, plus a little slack. */
function resultBudget(config: ScrapeConfig): number {
  return config.resultsLimit * Math.max(config.pages.length, 1) + 10
}

function finishScrape(rows: unknown[], config: ScrapeConfig): Snapshot {
  const { reels } = normalizeRows(rows)
  if (reels.length === 0) {
    throw new Error(
      `The ${config.via} upstream returned rows but none could be normalized into reels. ` +
        'Check that the tracked pages are public Facebook pages.',
    )
  }
  return {
    reels,
    syncedAt: new Date().toISOString(),
    via: config.via,
    scrapedAt: Date.now(),
  }
}

// ─── Cache-aware orchestration ────────────────────────────────────────────

export class SnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SnapshotError'
  }
}

export interface GetSnapshotOptions {
  overrides?: RequestOverrides
  /** POST /api/refresh — start a scrape right now and wait for it. */
  force?: boolean
}

async function refreshSnapshot(
  config: ScrapeConfig,
  key: string,
  cache: SnapshotCache,
  allowCheapRead: boolean,
): Promise<Snapshot> {
  if (cache.inFlight) return cache.inFlight

  const promise = (async () => {
    try {
      // Background refresh of an existing scope: try the cheap read of the
      // last Apify dataset first (scheduled runs make this the common hit).
      // A forced sync (allowCheapRead === false) always starts a fresh run.
      let snapshot: Snapshot | null = null
      if (allowCheapRead && cache.key === key && cache.value) {
        snapshot = await scrapeViaApifyCheap(
          config,
          Math.max(config.ttlMs, RUN_WAIT_MS),
        )
      }
      if (!snapshot) {
        snapshot = await scrape(config)
      }
      cache.value = snapshot
      cache.key = key
      cache.lastFailure = null
      return snapshot
    } catch (cause) {
      cache.lastFailure = cause instanceof Error ? cause.message : String(cause)
      throw cause
    } finally {
      cache.inFlight = null
    }
  })()

  cache.inFlight = promise
  return promise
}

function buildPayload(
  snapshot: Snapshot,
  config: ScrapeConfig,
  refreshing: boolean,
  cache: SnapshotCache,
): SnapshotPayload {
  const payload: SnapshotPayload = {
    reels: snapshot.reels,
    syncedAt: snapshot.syncedAt,
    via: snapshot.via,
    stale: Date.now() - snapshot.scrapedAt > config.ttlMs,
    refreshing,
  }
  if (cache.lastFailure) {
    payload.warning = `Last scrape attempt failed: ${cache.lastFailure.slice(0, 200)}`
  }
  return payload
}

/**
 * Central entrypoint for both endpoints. Throws SnapshotError when nothing
 * can be served at all.
 */
export async function getSnapshot(options: GetSnapshotOptions = {}): Promise<SnapshotPayload> {
  const cache = loadCache()
  const base = resolveConfig(loadConfig(), options.overrides ?? {})
  const config = resolveConfig(base, options.overrides ?? {})

  const prerequisitesError = missingPrerequisites(config)
  if (prerequisitesError) {
    throw new SnapshotError(prerequisitesError)
  }

  const key = configKey(config)

  if (options.force) {
    const snapshot = await refreshSnapshot(config, key, cache, false)
    return buildPayload(snapshot, config, false, cache)
  }

  // Fresh cached snapshot → instant serve.
  if (
    cache.value &&
    cache.key === key &&
    Date.now() - cache.value.scrapedAt < config.ttlMs
  ) {
    return buildPayload(cache.value, config, false, cache)
  }

  // No cached snapshot for this scope yet → must scrape before answering.
  if (!cache.value || cache.key !== key) {
    const snapshot = await refreshSnapshot(config, key, cache, false)
    return buildPayload(snapshot, config, false, cache)
  }

  // Stale snapshot → serve it now, keep refreshing in the background.
  if (!cache.inFlight) {
    waitUntil(
      refreshSnapshot(config, key, cache, true).catch(() => {
        // lastFailure is already recorded; a later serve surfaces it.
      }),
    )
  }

  return buildPayload(cache.value, config, true, cache)
}
