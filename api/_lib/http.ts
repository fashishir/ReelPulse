import type { VercelRequest } from '@vercel/node'
import type { RequestOverrides } from './config'
import { SnapshotError } from './snapshot'

/** Optional shared-secret guard. When `SNAPSHOT_ACCESS_KEY` is set on the
 * server, requests must carry `x-reelpulse-key` (header) or `?key=` (query).
 * Deliberately optional so plain GET reads keep working for personal deployments.
 */
export function assertAccessKey(
  req: VercelRequest,
  expectedKey: string | undefined,
): void {
  if (!expectedKey) return
  const headerKey = req.headers['x-reelpulse-key']
  const queryKey = req.query?.key
  const expected = expectedKey
  const provided =
    typeof headerKey === 'string'
      ? headerKey
      : Array.isArray(queryKey)
        ? queryKey[0]
        : queryKey
  if (provided !== expected) {
    throw new SnapshotError('Access key missing or wrong (SNAPSHOT_ACCESS_KEY).')
  }
}

/** Read the JSON request body defensively (Vercel may pre-parse or pass raw). */
export function readOverrides(req: VercelRequest): RequestOverrides | undefined {
  const body = req.body
  if (!body) return undefined
  if (typeof body === 'object') return body as RequestOverrides
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body)
      return parsed && typeof parsed === 'object' ? (parsed as RequestOverrides) : undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

/** Scope override from the query string (?via=rapidapi&limit=30&pages=…) for GETs. */
export function queryOverrides(req: VercelRequest): RequestOverrides {
  const via = req.query?.via
  const limit = req.query?.limit
  const pages = req.query?.pages

  const overrides: RequestOverrides = {}
  if (typeof via === 'string' && (via === 'apify' || via === 'rapidapi')) {
    overrides.via = via
  }
  if (typeof limit === 'string' && Number.isFinite(Number(limit))) {
    overrides.limit = Number(limit)
  }
  if (typeof pages === 'string' && pages.trim()) {
    overrides.pages = pages.split(',').map((entry) => entry.trim()).filter(Boolean)
  }
  return overrides
}
