/**
 * POST /api/refresh — force a fresh Facebook scrape right now and wait for
 * it (bounded by the Apify run wait, ~45s, inside the 60s function budget).
 *
 * Body (all optional): `{ via?, pages?, limit? }` — scope overrides, same
 * as /api/reels. Returns the same payload shape; when the scrape can't
 * finish in time the client receives the previous snapshot with
 * `refreshing: true` and lets the next poll pick up the completed run.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadConfig } from './_lib/config'
import { assertAccessKey, readOverrides } from './_lib/http'
import { getSnapshot } from './_lib/snapshot'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' })
    return
  }

  const config = loadConfig()
  const overrides = readOverrides(req)

  try {
    assertAccessKey(req, config.accessKey)

    const payload = await getSnapshot({ overrides, force: true })
    res.status(200).json(payload)
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'Unknown refresh error'
    res.status(502).json({
      error: message,
      reels: [],
      stale: true,
      refreshing: false,
    })
  }
}
