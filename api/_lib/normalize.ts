/**
 * Tolerant scraped-row → normalized `Reel` mapping.
 *
 * Handles the output shapes of the known Facebook Reels actors/endpoints:
 *  - `dami_studio/facebook-reels-scraper` (primary): reelId/caption/hashtags/
 *    viewCount/reactionsCount/commentsCount/audioTitle/pageName/…
 *  - `apify/facebook-reels-scraper` and community actors: url/text/plays/…
 *  - RapidAPI Facebook pages-reels rows (nested `data` envelopes, metrics
 *    under `metrics` or top level).
 *
 * Unknown fields degrade gracefully; Facebook never publishes `saves`, so
 * that metric stays 0 for scraped rows. Views/shares are rounded by
 * Facebook itself ("65K" precision) — that round-trip is documented in the
 * admin UI, not hidden.
 */
import type { MetricSet, MetricsByTimeframe, Reel } from '../../src/types'
import { detectCategory, extractHashtags, extractHook } from '../../src/lib/classify'
import { asBoolean, asString, dig, toNum } from './parse'

/** Multipliers used to extrapolate weekly / monthly metrics from a snapshot. */
const WEEK_FACTOR = 5.5
const MONTH_FACTOR = 18

const VIEW_PATHS = [
  'viewCount', 'playCount', 'play_count', 'plays', 'video_view_count',
  'view_count', 'metrics.views', 'metrics.plays', 'playCountString', 'feedback.view_count',
]
const LIKE_PATHS = [
  'reactionsCount', 'like_count', 'likeCount', 'likes', 'metrics.likes',
  'feedback.reaction_count.total_count', 'feedback.reaction_count', 'feedback.likes',
]
const COMMENT_PATHS = [
  'commentsCount', 'comment_count', 'comments_count', 'comments', 'metrics.comments',
  'feedback.comment_count.total_count', 'feedback.comment_count',
]
const SHARE_PATHS = [
  'sharesCount', 'share_count', 'shares', 'metrics.shares',
  'feedback.share_count.total_count', 'feedback.share_count',
]
const SAVE_PATHS = ['save_count', 'saves', 'metrics.saves', 'feedback.save_count']

// ─── Field extraction ──────────────────────────────────────────────────────

function extractId(row: Record<string, unknown>): string {
  const candidate = asString(
    dig(row, 'reelId', 'id', 'post_id', 'postId', 'videoId', 'video_id', 'pk'),
  )
  if (candidate) return candidate
  const url = asString(
    dig(row, 'reelUrl', 'topLevelReelUrl', 'topLevelUrl', 'shareable_url', 'url', 'link'),
  )
  const match = url.match(/\/reel\/(\d+)/) ?? url.match(/[?=/](\d{6,})/)
  if (match) return match[1]
  return `fb_${stableHash(url || JSON.stringify(row).slice(0, 200))}`
}

/** Pull the caption text out of the many caption/text shapes. */
function extractCaption(row: Record<string, unknown>): string {
  const candidate = dig(row, 'caption.text', 'caption', 'text', 'description', 'title')
  if (candidate && typeof candidate === 'object') {
    return asString(dig(candidate, 'text', 'value'))
  }
  return asString(candidate)
}

function extractHashtagList(row: Record<string, unknown>, caption: string): string[] {
  const raw = dig(row, 'hashtags')
  if (Array.isArray(raw)) {
    const list = raw
      .map((entry) =>
        asString(entry).replace(/^#/, '').toLowerCase(),
      )
      .filter(Boolean)
    if (list.length > 0) return list
  }
  return extractHashtags(caption)
}

/** Extract timestamp as epoch ms from ISO strings or numeric epochs. */
function extractPostedAtMs(row: Record<string, unknown>): number {
  const iso = asString(dig(row, 'time', 'createdAt', 'created_time', 'publishedAt'))
  if (iso) {
    const parsed = Date.parse(iso)
    if (!Number.isNaN(parsed)) return parsed
  }

  const raw = toNum(dig(row, 'timestamp', 'creation_time', 'taken_at', 'taken_at_timestamp'), 0)
  if (raw > 1e12) return raw
  if (raw > 1e9) return raw * 1000
  return 0
}

function extractPermalink(row: Record<string, unknown>): string {
  return asString(
    dig(
      row,
      'reelUrl', 'topLevelReelUrl', 'topLevelUrl', 'shareable_url',
      'permalink', 'url', 'link', 'facebookUrl',
    ),
  )
}

function extractVideoUrl(row: Record<string, unknown>): string | undefined {
  const direct = asString(dig(row, 'videoUrl', 'video_url', 'video.download_url', 'source'))
  if (direct) return direct

  const versions = dig(row, 'video_versions', 'variants')
  if (Array.isArray(versions)) {
    for (const entry of versions as Record<string, unknown>[]) {
      const url = asString(dig(entry, 'url', 'link'))
      if (url) return url
    }
  }
  return undefined
}

function extractThumbnailUrl(row: Record<string, unknown>): string | undefined {
  const candidate = asString(
    dig(row, 'thumbnailUrl', 'thumbnail_url', 'previewImageUrl', 'image', 'cover_photo', 'picture'),
  )
  return candidate || undefined
}

function extractOwnerHandle(row: Record<string, unknown>): string {
  const handle = asString(dig(row, 'pageName', 'username', 'owner.username', 'author.handle'))
  if (handle) return handle
  const pageUrl = asString(
    dig(row, 'pageUrl', 'facebookUrl', 'video_owner.url', 'owner.url', 'profile_url'),
  )
  if (pageUrl) {
    const slug = pageUrl
      .replace(/^https?:\/\/(www\.|m\.)?facebook\.com\//i, '')
      .replace(/[/?#].*$/, '')
      .replace(/^@/, '')
      .trim()
    if (slug && slug !== 'profile.php') return slug
  }
  return 'facebook'
}

// ─── Reel assembly ─────────────────────────────────────────────────────────

function buildMetrics(today: MetricSet): MetricsByTimeframe {
  const scale = (set: MetricSet, factor: number): MetricSet => ({
    views: Math.round(set.views * factor),
    likes: Math.round(set.likes * factor),
    comments: Math.round(set.comments * factor),
    shares: Math.round(set.shares * factor),
    saves: Math.round(set.saves * factor),
  })

  return {
    today,
    week: scale(today, WEEK_FACTOR),
    month: scale(today, MONTH_FACTOR),
  }
}

/** Views-per-hour since posting; used as the "velocity" signal. */
function computeVelocity(views: number, postedAtMs: number): number {
  const ageMs = Date.now() - postedAtMs
  const ageHours = Math.max(ageMs / 3_600_000, 1)
  return Math.round(views / ageHours)
}

/** Twelve synthetic points trending upward from a base view count. */
function buildViewTrend(views: number): number[] {
  const points = 12
  const trend: number[] = []
  for (let i = 0; i < points; i += 1) {
    const progress = i / (points - 1)
    const base = views * (0.35 + 0.65 * progress)
    const noise = base * (Math.random() * 0.12 - 0.06)
    trend.push(Math.max(0, Math.round(base + noise)))
  }
  return trend
}

function mapRowToReel(row: Record<string, unknown>): Reel | null {
  try {
    // Diagnostic rows (profile errors, no-charge samples) are not reels.
    if (asString(dig(row, 'type')) === 'profile_error') return null

    const id = extractId(row)
    const caption = extractCaption(row)
    if (!id || (!caption && !extractPermalink(row))) return null

    const hashtags = extractHashtagList(row, caption)
    const category = detectCategory(caption, hashtags)
    const creator = {
      name: asString(dig(row, 'pageName', 'video_owner.name', 'owner.name', 'author.name'), 'Facebook page'),
      handle: extractOwnerHandle(row),
      verified: asBoolean(dig(row, 'pageIsVerified', 'verified', 'is_verified', 'owner.is_verified')),
    }

    const audioTitle = asString(dig(row, 'audioTitle', 'music_title', 'audio.title'))
    const audioIsOriginal = asBoolean(dig(row, 'audioIsOriginal', 'audio.is_original'))
    const audio = {
      title: audioTitle || 'Original audio',
      artist: creator.name,
      uses: audioTitle && !audioIsOriginal ? 1 : 0,
    }

    const durationMs = toNum(dig(row, 'durationMs'), 0)
    const durationSeconds =
      toNum(dig(row, 'durationSeconds', 'video_duration', 'duration'), 0) ||
      (durationMs > 0 ? Math.round(durationMs / 1000) : 0)

    const postedAtMs = extractPostedAtMs(row)
    const postedAt = new Date(postedAtMs || Date.now()).toISOString()

    const shares = toNum(dig(row, ...SHARE_PATHS), 0)
    const likes = toNum(dig(row, ...LIKE_PATHS), 0)
    const comments = toNum(dig(row, ...COMMENT_PATHS), 0)
    const views = toNum(dig(row, ...VIEW_PATHS), 0)
    const today: MetricSet = {
      views,
      likes,
      comments,
      shares,
      saves: toNum(dig(row, ...SAVE_PATHS), 0),
    }

    const externalUrl =
      extractPermalink(row) ||
      `https://www.facebook.com/watch/?v=${id}`

    const reel: Reel = {
      id,
      platform: 'facebook',
      category,
      creator,
      caption,
      hashtags,
      hook: extractHook(caption),
      audio,
      durationSeconds,
      postedAt,
      metrics: buildMetrics(today),
      velocity: computeVelocity(views, postedAtMs),
      viewTrend: buildViewTrend(views),
      externalUrl,
      videoUrl: extractVideoUrl(row) ?? undefined,
      thumbnailUrl: extractThumbnailUrl(row),
    }
    return reel
  } catch {
    return null
  }
}

export interface NormalizeResult {
  reels: Reel[]
  skipped: number
}

/**
 * Normalize arbitrary scraped rows: drops diagnostic/error rows, de-dupes
 * by reel id, and keeps valid items.
 */
export function normalizeRows(rows: unknown[]): NormalizeResult {
  const reels: Reel[] = []
  const seen = new Set<string>()
  let skipped = 0

  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      skipped += 1
      continue
    }
    const reel = mapRowToReel(row as Record<string, unknown>)
    if (!reel || seen.has(reel.id)) {
      skipped += 1
      continue
    }
    seen.add(reel.id)
    reels.push(reel)
  }

  return { reels, skipped }
}

function stableHash(value: string): string {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}
