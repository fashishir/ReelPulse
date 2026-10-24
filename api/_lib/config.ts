/**
 * Configuration resolution for the Facebook scrape functions.
 *
 * Credentials and the tracked-pages list live in Vercel env vars so they
 * never reach the browser. The frontend can send per-request overrides
 * (via / pages / limit) which never override credentials — only scope
 * the scrape.
 */
import { asString, dig } from './parse'

export type ScrapeVia = 'apify' | 'rapidapi'

export interface ScrapeConfig {
  via: ScrapeVia
  apifyToken: string
  apifyActorId: string
  apifyActorInput: Record<string, unknown> | null
  rapidApiKey: string
  rapidApiHost: string
  pages: string[]
  resultsLimit: number
  ttlMs: number
  accessKey: string
}

export interface RequestOverrides {
  via?: unknown
  pages?: unknown
  limit?: unknown
}

export const DEFAULT_APIFY_ACTOR = 'dami_studio/facebook-reels-scraper'
export const DEFAULT_RAPIDAPI_HOST = 'facebook-scraper7.p.rapidapi.com'
/** Cap mirrors what Facebook Reels actors accept per page (up to 50 pages). */
export const MAX_PAGES = 50
export const MAX_RESULTS_LIMIT = 200

function readPagesEnv(value: string | undefined): string[] {
  return parsePageList(value)
}

/**
 * Parse a tracked-pages list. Accepts:
 *  - a JSON array: ["https://www.facebook.com/9gag", "9gag"]
 *  - newline separated entries
 *  - comma separated entries
 */
export function parsePageList(raw: string | string[] | undefined | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((entry) => asString(entry)).filter(Boolean).map(normalizePageUrl)
  }

  const trimmed = raw.trim()
  if (!trimmed) return []

  let entries: string[]
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      entries = Array.isArray(parsed) ? parsed.map((entry) => asString(entry)) : []
    } catch {
      entries = splitEntries(trimmed)
    }
  } else {
    entries = splitEntries(trimmed)
  }

  return entries.map(normalizePageUrl).filter(Boolean)
}

function splitEntries(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

/** Normalize bare handles into full page URLs ("9gag" → facebook.com/…). */
function normalizePageUrl(entry: string): string {
  const value = entry.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (/^m\./i.test(value) || value.includes('facebook.com/')) {
    return `https://${value.replace(/^\/+/, '')}`
  }
  return `https://www.facebook.com/${value.replace(/^@/, '')}`
}

/** Parse and clamp a positive integer env value. */
function envInt(value: string | undefined, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.floor(n)
}

export function loadConfig(): ScrapeConfig {
  const viaEnv = (process.env.SCRAPE_VIA as ScrapeVia | undefined) ?? 'apify'
  const actorInputRaw = process.env.APIFY_ACTOR_INPUT

  return {
    via: viaEnv === 'rapidapi' ? 'rapidapi' : 'apify',
    apifyToken: process.env.APIFY_TOKEN ?? '',
    apifyActorId: process.env.APIFY_ACTOR_ID || DEFAULT_APIFY_ACTOR,
    apifyActorInput:
      actorInputRaw && actorInputRaw.trim().startsWith('{')
        ? safeJsonObject(actorInputRaw)
        : null,
    rapidApiKey: process.env.RAPIDAPI_KEY ?? '',
    rapidApiHost: process.env.RAPIDAPI_FACEBOOK_HOST || DEFAULT_RAPIDAPI_HOST,
    pages: readPagesEnv(process.env.FB_PAGES),
    resultsLimit: envInt(process.env.RESULTS_LIMIT, 30),
    ttlMs: envInt(process.env.SNAPSHOT_TTL_MINUTES, 5) * 60_000,
    accessKey: process.env.SNAPSHOT_ACCESS_KEY ?? '',
  }
}

function safeJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/**
 * Merge the request body into the base config.
 *
 * Only scope fields (via/pages/limit) are overridable per request — secrets
 * (tokens) always come from env vars, so the browser can never supply them.
 */
export function resolveConfig(base: ScrapeConfig, overrides: RequestOverrides): ScrapeConfig {
  const rawPages = overrides.pages
  const pages = Array.isArray(rawPages)
    ? parsePageList(rawPages as string[])
    : typeof rawPages === 'string'
      ? parsePageList(rawPages)
      : []
  const via = overrides.via === 'rapidapi' || overrides.via === 'apify'
    ? (overrides.via as ScrapeVia)
    : base.via
  const limitOverride = dig(overrides, 'limit')
  const limitNum = Number(limitOverride)

  return {
    ...base,
    via,
    pages: (pages.length > 0 ? pages : base.pages).slice(0, MAX_PAGES),
    resultsLimit: Number.isFinite(limitNum) && limitNum > 0
      ? Math.min(Math.floor(limitNum), MAX_RESULTS_LIMIT)
      : base.resultsLimit,
  }
}

export function missingPrerequisites(config: ScrapeConfig): string | null {
  if (config.pages.length === 0) {
    return 'No tracked Facebook pages configured. Set FB_PAGES (or send a pages override).'
  }
  if (config.via === 'apify' && !config.apifyToken) {
    return 'APIFY_TOKEN is not configured on the server.'
  }
  if (config.via === 'rapidapi' && !config.rapidApiKey) {
    return 'RAPIDAPI_KEY is not configured on the server.'
  }
  return null
}
