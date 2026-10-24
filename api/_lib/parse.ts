/**
 * Tolerant parsing primitives shared by the Facebook scrape functions.
 *
 * Upstream scrapers (Apify actors, RapidAPI endpoints) return wildly varying
 * row shapes, so every accessor digs across multiple candidate paths instead
 * of trusting one schema.
 */

/** Safely read a nested property that might exist at multiple paths. */
export function dig(obj: unknown, ...paths: string[]): unknown {
  for (const path of paths) {
    const parts = path.split('.')
    let cur: unknown = obj
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') {
        cur = undefined
        break
      }
      cur = (cur as Record<string, unknown>)[part]
    }
    const value = cur
    if (value !== undefined && value !== null) return value
  }
  return undefined
}

/** Coerce a value to a finite number, returning `fallback` otherwise. */
export function toNum(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    // Facebook sometimes publishes compact strings such as "65K" / "1.2M".
    const compact = parseCompactNumber(value)
    if (compact !== null) return compact
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Parse "1.2K" / "345K" / "65K" style compact numbers into real numbers. */
export function parseCompactNumber(value: string): number | null {
  const match = value.trim().match(/^([\d.,]+)\s*([KMBkmb])$/)
  if (!match) return null
  const base = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(base)) return null
  const suffix = match[2].toUpperCase()
  const multiplier = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : 1_000_000_000
  return Math.round(base * multiplier)
}

export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

/**
 * Extract the array of reel items from whichever envelope shape a scraper
 * returns. Known shapes:
 *  - `[...]`
 *  - `{ items: [...] }`
 *  - `{ data: [...] }` / `{ data: { items: [...] } }`
 *  - `{ rows: [...] }`
 */
export function extractItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[]

  const obj = json as Record<string, unknown> | null
  if (!obj || typeof obj !== 'object') return []

  const data = obj.data
  if (Array.isArray(data)) return data as unknown as Record<string, unknown>[]
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.items)) return nested.items as Record<string, unknown>[]
    if (Array.isArray(nested.rows)) return nested.rows as Record<string, unknown>[]
    if (Array.isArray(nested.edges)) {
      return (nested.edges as Record<string, unknown>[]).map(
        (edge) => (edge.node as Record<string, unknown>) ?? edge,
      )
    }
  }

  if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[]
  if (Array.isArray(obj.rows)) return obj.rows as Record<string, unknown>[]
  if (Array.isArray(obj.edges)) {
    return (obj.edges as Record<string, unknown>[]).map(
      (edge) => (edge.node as Record<string, unknown>) ?? edge,
    )
  }

  return []
}

/**
 * Fetch JSON with a hard timeout so one slow upstream can never pin a
 * serverless invocation to the full duration limit.
 */
export async function fetchJson(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<unknown> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Upstream ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ''}`,
    )
  }
  return response.json()
}
