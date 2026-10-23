import type { Reel } from '../../types'
import { ProviderNotWiredError, type MetaConfig, type ReelProvider } from './types'

/**
 * Meta Graph API adapter scaffold.
 *
 * Example live flow:
 *   GET https://graph.facebook.com/v23.0/{igUserId}/media
 *       ?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,
 *               like_count,comments_count,insights.metric(plays,shares,saves)
 *       &access_token={token}
 *
 * This must run through a server proxy in production — never ship a token to the
 * browser. Map the rows into `Reel` and return the normalized array.
 */
export function createMetaProvider(config: MetaConfig): ReelProvider {
  return {
    id: 'meta',
    label: 'Meta Graph',
    isLive: true,
    async fetchReels(): Promise<Reel[]> {
      if (!config.accessToken || !config.igUserId) {
        throw new ProviderNotWiredError('Meta Graph')
      }
      throw new ProviderNotWiredError('Meta Graph')
    },
  }
}

/**
 * Extract a playable video URL from a Meta Graph media row.
 *
 * Reels return `media_url` (direct CDN link) for REEL media_type entries. When
 * only a permalink is present, the player falls back to the simulated preview
 * and the "View original" button carries the real destination.
 */
export function extractMetaVideoUrl(row: Record<string, unknown>): string | undefined {
  const url = row.media_url
  if (typeof url === 'string' && url.trim()) return url
  return undefined
}
