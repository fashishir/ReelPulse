/**
 * GET/POST /api/reels — the single data endpoint ReelPulse's Facebook
 * provider talks to.
 *
 *  - GET: read the current snapshot using server env config (cron/health
 *    friendly). Optional `?via=` / `?limit=` / `?pages=` scope overrides.
 *  - POST (what the browser provider uses): JSON body `{ via?, pages?, limit? }`
 *    overrides the *scope* (never credentials) and returns the snapshot,
 *    triggering a server-side refresh when the cached snapshot is overdue.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadConfig } from './_lib/config'
import { assertAccessKey, queryOverrides, readOverrides } from './_lib/http'
import { getSnapshot } from './_lib/snapshot'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' })
    return
  }

  const config = loadConfig()
  const overrides = readOverrides(req) ?? queryOverrides(req)

  try {
    assertAccessKey(req, config.accessKey)

    const payload = await getSnapshot({ overrides })
    res.status(200).json(payload)
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'Unknown snapshot error'
    res.status(502).json({
      error: message,
      reels: [],
      stale: true,
      refreshing: false,
    })
  }
}
