/**
 * RapidAPI Facebook adapter (secondary scrape route).
 *
 * Default host is `facebook-scraper7.p.rapidapi.com` (page → tabs → reels
 * listing). The row shapes are normalized downstream, so any host that
 * returns reel rows with views/reactions works with the tolerant mapper.
 *
 * RAPIDAPI_FACEBOOK_HOST + RAPIDAPI_KEY come from server env vars; the
 * browser never holds a RapidAPI key in this flow.
 */
import { asString, dig, extractItems, fetchJson } from './parse'

const FETCH_TIMEOUT_MS = 20_000
/** Reels listing pages to walk when a cursor is present (dami-style pagers can be deep). */
const MAX_REMOTE_PAGES = 3

export interface RapidApiConfig {
  apiKey: string
  host: string
  resultsLimit: number
  pages: string[]
}

function headers(apiKey: string, host: string): Record<string, string> {
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': host,
  }
}

async function rapidFetch(
  url: string,
  config: RapidApiConfig,
  init: RequestInit = {},
): Promise<unknown> {
  return fetchJson(
    url,
    {
      ...init,
      headers: { ...headers(config.apiKey, config.host), ...init.headers },
    },
    FETCH_TIMEOUT_MS,
  )
}

/** "https://www.facebook.com/9gag" → "9gag"; bare handles pass through. */
function slugFromPageUrl(pageUrl: string): string {
  return asString(pageUrl)
    .replace(/^https?:\/\/(www\.|m\.)?facebook\.com\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/^@/, '')
    .trim()
}

interface PageTarget {
  slug: string
  label: string
}

/**
 * Resolve a page's numeric/secondary id. Falls back to the slug itself when
 * the resolver endpoint is unavailable — some hosts accept the slug id path.
 */
async function resolvePage(
  config: RapidApiConfig,
  target: PageTarget,
): Promise<string> {
  const url = `https://${config.host}/api/pages/id?name=${encodeURIComponent(target.slug)}`
  try {
    const json = await rapidFetch(url, config)
    const id = asString(dig(json, 'data.id', 'data.page_id', 'id', 'data.data.id'))
    return id || target.slug
  } catch {
    return target.slug
  }
}

/** Find the reels section id among the page's tab list. */
async function resolveReelSection(
  config: RapidApiConfig,
  pageId: string,
): Promise<string | null> {
  const url = `https://${config.host}/api/pages/${encodeURIComponent(pageId)}/tabs`
  const json = await rapidFetch(url, config)
  const tabs = extractItems(json)

  for (const tab of tabs) {
    const label = `${asString(dig(tab, 'label', 'type', 'key', 'name', 'title'))}`.toLowerCase()
    const sectionId = asString(dig(tab, 'section_id', 'id', 'collection_id'))
    if (sectionId && (label.includes('reel') || label.includes('video'))) {
      return sectionId
    }
  }
  return null
}

/** Walk the reels collection, following cursors for a couple of pages. */
async function fetchReelRows(
  config: RapidApiConfig,
  pageId: string,
  sectionId: string,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = []
  let cursor = ''

  for (let page = 0; page < MAX_REMOTE_PAGES; page += 1) {
    const cursorQuery = cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
    const url =
      `https://${config.host}/api/pages/${encodeURIComponent(pageId)}` +
      `/reels/${encodeURIComponent(sectionId)}${cursorQuery}`
    const json = await rapidFetch(url, config)
    rows.push(...extractItems(json))

    cursor = asString(dig(json, 'data.next_cursor', 'meta.next_cursor', 'next_cursor', 'page_info.end_cursor'))
    if (!cursor) break
  }

  return rows
}

/**
 * Scrape reels rows for every tracked page. Individual page failures are
 * logged and skipped; only a total failure throws.
 */
export async function scrapePageReelsViaRapidApi(
  config: RapidApiConfig,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = []
  const failures: string[] = []

  for (const page of config.pages) {
    const target: PageTarget = { slug: slugFromPageUrl(page), label: page }
    if (!target.slug) {
      failures.push(`${page}: unresolvable page identifier`)
      continue
    }

    try {
      const pageId = await resolvePage(config, target)
      const sectionId = await resolveReelSection(config, pageId)
      if (!sectionId) {
        failures.push(`${target.slug}: no reels section found on this page`)
        continue
      }

      const pageRows = await fetchReelRows(config, pageId, sectionId)
      rows.push(...pageRows)
    } catch (cause) {
      failures.push(
        `${target.slug}: ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    }
  }

  if (rows.length === 0) {
    throw new Error(
      `RapidAPI scrape produced no reels for ${config.pages.length} page(s). ` +
        (failures.length > 0 ? failures.slice(0, 3).join(' | ') : ''),
    )
  }

  return rows
}
