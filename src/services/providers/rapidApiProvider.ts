import type {
  AudioTrack,
  CategoryId,
  MetricSet,
  MetricsByTimeframe,
  Platform,
  Reel,
} from '../../types'
import { ProviderNotWiredError, type RapidApiConfig, type ReelProvider } from './types'

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_HOST = 'instagram-scraper-api2.p.rapidapi.com'
const DEFAULT_COUNT = 20

/** Multipliers used to extrapolate weekly / monthly metrics from today's snapshot. */
const WEEK_FACTOR = 5.5
const MONTH_FACTOR = 18

/** Keywords that map captions / hashtags to a category. */
const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  comedy: ['funny', 'comedy', 'meme', 'lol', 'humor', 'laugh', 'joke', 'skit', 'prank', 'parody'],
  tech: ['tech', 'coding', 'programming', 'developer', 'ai', 'software', 'startup', 'gadget', 'computer', 'app'],
  fitness: ['fitness', 'gym', 'workout', 'exercise', 'health', 'gains', 'muscle', 'yoga', 'crossfit', 'training'],
  food: ['food', 'recipe', 'cooking', 'chef', 'foodie', 'baking', 'meal', 'kitchen', 'restaurant', 'delicious'],
  fashion: ['fashion', 'style', 'outfit', 'ootd', 'beauty', 'makeup', 'clothing', 'trend', 'model', 'designer'],
  travel: ['travel', 'wanderlust', 'vacation', 'explore', 'adventure', 'trip', 'destination', 'tourism', 'backpack', 'beach'],
  gaming: ['gaming', 'gamer', 'game', 'esports', 'twitch', 'streamer', 'playstation', 'xbox', 'nintendo', 'fortnite'],
  finance: ['finance', 'money', 'investing', 'stock', 'crypto', 'bitcoin', 'wealth', 'trading', 'budget', 'savings'],
  music: ['music', 'song', 'singer', 'rapper', 'dj', 'hiphop', 'concert', 'guitar', 'beats', 'album'],
  education: ['education', 'learn', 'study', 'school', 'teacher', 'student', 'science', 'math', 'knowledge', 'tutorial'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Detect category from caption text and hashtags.
 * Returns the category with the highest keyword hit-count, falling back to 'comedy'.
 */
function detectCategory(caption: string, hashtags: string[]): CategoryId {
  const blob = `${caption} ${hashtags.join(' ')}`.toLowerCase()

  let bestCategory: CategoryId = 'comedy'
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    const score = keywords.reduce((acc, kw) => acc + (blob.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }
  return bestCategory
}

/** Safely read a nested property that might be at multiple paths. */
function dig(obj: Record<string, unknown>, ...paths: string[]): unknown {
  for (const path of paths) {
    const parts = path.split('.')
    let cur: unknown = obj
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') { cur = undefined; break }
      cur = (cur as Record<string, unknown>)[p]
    }
    if (cur !== undefined && cur !== null) return cur
  }
  return undefined
}

/** Coerce a value to number, returning `fallback` when it's not a valid number. */
function toNum(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

/** Extract hashtags from a caption string. */
function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\w\u00C0-\u024F]+/g)
  return matches ? matches.map((h) => h.slice(1).toLowerCase()) : []
}

/**
 * Derive a plausible first-sentence "hook" from a caption.
 * Returns up to the first sentence or the first 100 chars, whichever is shorter.
 */
function extractHook(caption: string): string {
  if (!caption) return ''
  const firstLine = caption.split('\n')[0]
  const firstSentence = firstLine.split(/[.!?]/)[0]
  return firstSentence.length > 100 ? `${firstSentence.slice(0, 97)}...` : firstSentence
}

/** Build `MetricsByTimeframe` by extrapolating from a single snapshot. */
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

/** Generate a synthetic 7-point sparkline trending upward from a base view count. */
function buildViewTrend(views: number): number[] {
  const points = 7
  const trend: number[] = []
  for (let i = 0; i < points; i++) {
    // Simulate an upward-trending curve with mild noise
    const progress = i / (points - 1)
    const base = views * (0.3 + 0.7 * progress)
    const noise = base * (Math.random() * 0.15 - 0.075)
    trend.push(Math.round(base + noise))
  }
  return trend
}

/**
 * Calculate a "velocity" score (views-per-hour since posting).
 * Falls back to a synthetic estimate when timestamp is missing.
 */
function computeVelocity(views: number, postedAtMs: number): number {
  const ageMs = Date.now() - postedAtMs
  const ageHours = Math.max(ageMs / 3_600_000, 1)
  return Math.round(views / ageHours)
}

/**
 * Extract a playable video URL from the many shapes the Instagram / Facebook
 * scrapers return. Falls back to `undefined` when no video URL is present.
 *
 * Known shapes:
 *  - `video_url` (string)
 *  - `video_versions[].url` (array of progressive URLs)
 *  - `reel_media.video_url`
 *  - `dash_info.video_url`
 */
function extractVideoUrl(row: Record<string, unknown>): string | undefined {
  const direct = dig(row, 'video_url', 'reel_media.video_url', 'dash_info.video_url')
  if (typeof direct === 'string' && direct.trim()) return direct

  const versions = dig(row, 'video_versions', 'reel_media.video_versions')
  if (Array.isArray(versions)) {
    const urls = (versions as Record<string, unknown>[])
      .map((entry) => dig(entry, 'url'))
      .filter((u): u is string => typeof u === 'string' && u.trim())
    if (urls.length > 0) return urls[0]
  }

  return undefined
}

/** Build AudioTrack from assorted API shapes. */
function extractAudio(row: Record<string, unknown>): AudioTrack {
  // Path 1 – music_metadata.music_info.music_asset_info
  const musicInfo = dig(row, 'music_metadata.music_info.music_asset_info') as Record<string, unknown> | undefined
  if (musicInfo) {
    return {
      title: String(musicInfo.title ?? 'Original Audio'),
      artist: String(musicInfo.display_artist ?? musicInfo.artist_name ?? 'Unknown'),
      uses: toNum(musicInfo.ig_username ? 1 : dig(row, 'music_metadata.music_info.music_consumption_info.ig_artist') ?? 0),
    }
  }

  // Path 2 – clips_metadata.original_sound_info
  const soundInfo = dig(row, 'clips_metadata.original_sound_info') as Record<string, unknown> | undefined
  if (soundInfo) {
    return {
      title: String(soundInfo.original_audio_title ?? 'Original Audio'),
      artist: String(dig(soundInfo, 'ig_artist.username') ?? 'Unknown'),
      uses: toNum(soundInfo.consumption_info ?? 0),
    }
  }

  // Fallback
  return { title: 'Original Audio', artist: 'Unknown', uses: 0 }
}

// ─── Row → Reel mapping ─────────────────────────────────────────────────────

function mapRowToReel(row: Record<string, unknown>, platform: Platform): Reel | null {
  try {
    const id = String(dig(row, 'id', 'pk', 'media_id') ?? `reel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

    const rawCaption =
      typeof dig(row, 'caption.text') === 'string'
        ? String(dig(row, 'caption.text'))
        : typeof dig(row, 'caption') === 'string'
          ? String(dig(row, 'caption'))
          : ''

    const hashtags = extractHashtags(rawCaption)
    const category = detectCategory(rawCaption, hashtags)
    const hook = extractHook(rawCaption)

    const user = (dig(row, 'user') ?? dig(row, 'owner') ?? {}) as Record<string, unknown>
    const creator = {
      name: String(user.full_name ?? user.username ?? 'Unknown'),
      handle: String(user.username ?? 'unknown'),
      verified: Boolean(user.is_verified ?? false),
    }

    const views = toNum(dig(row, 'play_count', 'video_view_count', 'view_count'), 10_000)
    const likes = toNum(dig(row, 'like_count', 'edge_media_preview_like.count'), 500)
    const comments = toNum(dig(row, 'comment_count', 'edge_media_to_comment.count'), 50)
    const shares = toNum(dig(row, 'share_count'), Math.round(likes * 0.15))
    const saves = toNum(dig(row, 'save_count'), Math.round(likes * 0.25))

    const todayMetrics: MetricSet = { views, likes, comments, shares, saves }
    const metrics = buildMetrics(todayMetrics)

    // Timestamp
    const rawTs = toNum(dig(row, 'taken_at', 'taken_at_timestamp'), 0)
    const postedAtMs = rawTs > 1e12 ? rawTs : rawTs > 0 ? rawTs * 1000 : Date.now() - 86_400_000
    const postedAt = new Date(postedAtMs).toISOString()

    const durationSeconds = toNum(dig(row, 'video_duration'), 30)

    const shortcode = String(dig(row, 'code', 'shortcode') ?? '')
    const externalUrl = platform === 'facebook'
      ? (shortcode ? `https://www.facebook.com/reel/${shortcode}` : `https://www.facebook.com/watch/?v=${id}`)
      : (shortcode ? `https://www.instagram.com/reel/${shortcode}/` : `https://www.instagram.com/p/${id}/`)

    const audio = extractAudio(row)
    const velocity = computeVelocity(views, postedAtMs)
    const viewTrend = buildViewTrend(views)
    const videoUrl = extractVideoUrl(row)

    return {
      id,
      platform,
      category,
      creator,
      caption: rawCaption,
      hashtags,
      hook,
      audio,
      durationSeconds,
      postedAt,
      metrics,
      velocity,
      viewTrend,
      externalUrl,
      videoUrl,
    }
  } catch {
    console.warn('[RapidAPI] Failed to map row:', row)
    return null
  }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

interface FetchOptions {
  apiKey: string
  host: string
}

async function apiFetch(url: string, opts: FetchOptions): Promise<unknown> {
  let targetUrl = url
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    url.includes(DEFAULT_HOST)
  ) {
    targetUrl = url.replace(`https://${DEFAULT_HOST}`, '/api/rapidapi')
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': opts.apiKey,
        'x-rapidapi-host': opts.host,
      },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`RapidAPI ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
    }

    return res.json()
  } catch (err) {
    if (targetUrl !== url) {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': opts.apiKey,
          'x-rapidapi-host': opts.host,
        },
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`RapidAPI ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
      }
      return res.json()
    }
    throw err
  }
}

/**
 * Extract the array of reel items from whichever shape the API returns.
 * Known shapes:
 *  - `{ data: { items: [...] } }`
 *  - `{ items: [...] }`
 *  - `{ data: [...] }`
 *  - `[...]`
 */
function extractItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[]

  const obj = json as Record<string, unknown> | null
  if (!obj || typeof obj !== 'object') return []

  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>
    if (Array.isArray(data.items)) return data.items as Record<string, unknown>[]
    if (Array.isArray(data)) return data as unknown as Record<string, unknown>[]
  }

  if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[]
  if (Array.isArray(obj.edges)) {
    return (obj.edges as Record<string, unknown>[]).map(
      (e) => ((e.node as Record<string, unknown>) ?? e),
    )
  }

  return []
}

// ─── Popular hashtag fallback endpoints ──────────────────────────────────────

const FALLBACK_HASHTAGS = ['trending', 'viral', 'explore', 'fyp', 'reels']

// ─── Provider factory ────────────────────────────────────────────────────────

export function createRapidApiProvider(config: RapidApiConfig): ReelProvider {
  return {
    id: 'rapidapi',
    label: 'RapidAPI',
    isLive: true,

    async fetchReels(): Promise<Reel[]> {
      if (!config.apiKey) {
        throw new ProviderNotWiredError('RapidAPI')
      }

      const host = config.host || DEFAULT_HOST
      const opts: FetchOptions = { apiKey: config.apiKey, host }
      const baseUrl = `https://${host}`

      const reels: Reel[] = []

      // ── 1. Fetch trending Instagram Reels ──────────────────────────────
      try {
        const trendingUrl = `${baseUrl}/v1/trending?count=${DEFAULT_COUNT}`
        const trendingJson = await apiFetch(trendingUrl, opts)
        const items = extractItems(trendingJson)

        for (const item of items) {
          const reel = mapRowToReel(item, 'instagram')
          if (reel) reels.push(reel)
        }
      } catch (err) {
        console.warn('[RapidAPI] Trending endpoint failed, trying hashtag fallback:', err)

        // Fallback – fetch from popular hashtags
        for (const tag of FALLBACK_HASHTAGS) {
          try {
            const tagUrl = `${baseUrl}/v1/hashtag?hashtag=${tag}&count=5`
            const tagJson = await apiFetch(tagUrl, opts)
            const items = extractItems(tagJson)

            for (const item of items) {
              const reel = mapRowToReel(item, 'instagram')
              if (reel) reels.push(reel)
            }
          } catch (tagErr) {
            console.warn(`[RapidAPI] Hashtag fallback "${tag}" failed:`, tagErr)
          }
        }
      }

      // ── 2. Fetch Facebook Reels (via Instagram scraper) ────────────────
      try {
        const fbUrl = `${baseUrl}/v1/reels?username_or_id_or_url=facebook&count=${DEFAULT_COUNT}`
        const fbJson = await apiFetch(fbUrl, opts)
        const items = extractItems(fbJson)

        for (const item of items) {
          const reel = mapRowToReel(item, 'facebook')
          if (reel) reels.push(reel)
        }
      } catch (err) {
        console.warn('[RapidAPI] Facebook reels endpoint failed:', err)
      }

      if (reels.length === 0) {
        throw new Error(
          'RapidAPI returned no reels. Verify your API key is valid and you have an active subscription to instagram-scraper-api2.',
        )
      }

      return reels
    },
  }
}
