import { CATEGORY_MAP } from '../data/categories'
import { CATEGORY_IDS } from '../types'
import type {
  AudioSummary,
  CategoryId,
  DashboardSummary,
  FeedFilters,
  Reel,
  SortKey,
  SyncResult,
  Timeframe,
} from '../types'
import { engagementRateValue } from '../lib/format'
import { demoProvider } from './providers/demoProvider'
import type { ReelProvider } from './providers/types'

let activeProvider: ReelProvider = demoProvider

export function setReelProvider(provider: ReelProvider): void {
  activeProvider = provider
  invalidateDataCache()
}

export function getReelProvider(): ReelProvider {
  return activeProvider
}

interface DatasetCache {
  providerId: string
  cachedAt: number
  reels: Reel[]
}

const CACHE_TTL_MS = 60_000
const DEMO_LATENCY_MS = 60

let datasetCache: DatasetCache | null = null
let inFlight: Promise<Reel[]> | null = null

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function invalidateDataCache(): void {
  datasetCache = null
  inFlight = null
}

async function loadDataset(): Promise<Reel[]> {
  const now = Date.now()
  if (
    datasetCache &&
    datasetCache.providerId === activeProvider.id &&
    now - datasetCache.cachedAt < CACHE_TTL_MS
  ) {
    return datasetCache.reels
  }

  if (inFlight) return inFlight

  const providerId = activeProvider.id
  inFlight = activeProvider
    .fetchReels()
    .then((reels) => {
      datasetCache = { providerId, cachedAt: Date.now(), reels }
      return reels
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@#]/g, '')
}

function searchTokens(query: string): string[] {
  return normalizeSearch(query).split(/\s+/).filter(Boolean)
}

function matchesQuery(reel: Reel, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const haystack = normalizeSearch(
    [
      reel.creator.name,
      reel.creator.handle,
      reel.caption,
      reel.hook,
      reel.audio.title,
      reel.audio.artist,
      CATEGORY_MAP[reel.category]?.label ?? '',
      ...reel.hashtags,
    ].join(' '),
  )
  return tokens.every((token) => haystack.includes(token))
}

function metricFor(reel: Reel, timeframe: Timeframe) {
  return reel.metrics[timeframe]
}

function sortValue(reel: Reel, sortBy: SortKey, timeframe: Timeframe): number {
  const metrics = metricFor(reel, timeframe)
  switch (sortBy) {
    case 'views':
      return metrics.views
    case 'likes':
      return metrics.likes
    case 'comments':
      return metrics.comments
    case 'engagement':
      return engagementRateValue(metrics.likes, metrics.comments, metrics.views)
    default:
      return metrics.views
  }
}

export function filterAndSortReels(reels: Reel[], filters: FeedFilters): Reel[] {
  const tokens = searchTokens(filters.search)

  return reels
    .filter((reel) => filters.platform === 'all' || reel.platform === filters.platform)
    .filter((reel) => filters.category === 'all' || reel.category === filters.category)
    .filter((reel) => matchesQuery(reel, tokens))
    .sort((a, b) => {
      const primary =
        sortValue(b, filters.sortBy, filters.timeframe) -
        sortValue(a, filters.sortBy, filters.timeframe)
      if (primary !== 0) return primary
      const byViews = metricFor(b, filters.timeframe).views - metricFor(a, filters.timeframe).views
      if (byViews !== 0) return byViews
      return a.id.localeCompare(b.id)
    })
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function summarizeFor(
  reels: Reel[],
  platform: FeedFilters['platform'],
  timeframe: Timeframe,
): DashboardSummary {
  const scoped = reels.filter((reel) => platform === 'all' || reel.platform === platform)

  const categoryCounts = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, 0]),
  ) as Record<CategoryId, number>
  const categoryGrowth = new Map<
    CategoryId,
    { weightedVelocity: number; views: number; count: number }
  >()

  let totalViews = 0
  let previousViews = 0
  let sparklineSum = Array.from({ length: 12 }, () => 0)

  for (const reel of scoped) {
    const metrics = metricFor(reel, timeframe)
    totalViews += metrics.views
    if (categoryCounts[reel.category] !== undefined) {
      categoryCounts[reel.category] += 1
    }

    const safeGrowth = 1 + reel.velocity / 100
    previousViews += safeGrowth > 0.05 ? metrics.views / safeGrowth : metrics.views

    const growth = categoryGrowth.get(reel.category) ?? {
      weightedVelocity: 0,
      views: 0,
      count: 0,
    }
    growth.weightedVelocity += reel.velocity * metrics.views
    growth.views += metrics.views
    growth.count += 1
    categoryGrowth.set(reel.category, growth)

    sparklineSum = sparklineSum.map(
      (value, index) => value + (reel.viewTrend[index] ?? 100),
    )
  }

  const sortedByViews = [...scoped].sort(
    (a, b) => metricFor(b, timeframe).views - metricFor(a, timeframe).views,
  )
  const topReel = sortedByViews[0] ?? null

  let fastestCategory: DashboardSummary['fastestCategory'] = null
  for (const [category, growth] of categoryGrowth) {
    if (growth.views === 0) continue
    const avgVelocity = growth.weightedVelocity / growth.views
    if (!fastestCategory || avgVelocity > fastestCategory.avgVelocity) {
      fastestCategory = { category, avgVelocity, reelCount: growth.count }
    }
  }

  const audioGroups = new Map<
    string,
    { audio: Reel['audio']; trackedViews: number; trackedReels: number }
  >()
  for (const reel of scoped) {
    const key = `${reel.audio.title}::${reel.audio.artist}`
    const entry = audioGroups.get(key) ?? {
      audio: reel.audio,
      trackedViews: 0,
      trackedReels: 0,
    }
    entry.trackedViews += metricFor(reel, timeframe).views
    entry.trackedReels += 1
    audioGroups.set(key, entry)
  }
  const trendingAudio =
    [...audioGroups.values()].sort((a, b) => b.trackedViews - a.trackedViews)[0] ?? null

  const creators = new Set(scoped.map((reel) => `${reel.platform}:${reel.creator.handle}`))
  const sparkline = sparklineSum.map((value) =>
    scoped.length > 0 ? Math.round(value / scoped.length) : 0,
  )

  return {
    topReel,
    fastestCategory,
    totalViews,
    viewsDelta: previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0,
    sparkline,
    trendingAudio,
    trackedReels: scoped.length,
    trackedCreators: creators.size,
    categoryCounts,
  }
}

export function audioLeaderboardFor(
  reels: Reel[],
  platform: FeedFilters['platform'],
  timeframe: Timeframe,
): AudioSummary[] {
  const scoped = reels.filter((reel) => platform === 'all' || reel.platform === platform)
  const groups = new Map<
    string,
    {
      audio: Reel['audio']
      trackedViews: number
      trackedReels: number
      platforms: Set<Reel['platform']>
    }
  >()

  for (const reel of scoped) {
    const key = `${reel.audio.title}::${reel.audio.artist}`
    const entry = groups.get(key) ?? {
      audio: reel.audio,
      trackedViews: 0,
      trackedReels: 0,
      platforms: new Set<Reel['platform']>(),
    }
    entry.trackedViews += metricFor(reel, timeframe).views
    entry.trackedReels += 1
    entry.platforms.add(reel.platform)
    groups.set(key, entry)
  }

  return [...groups.values()]
    .sort((a, b) => b.trackedViews - a.trackedViews)
    .map((entry) => ({
      audio: entry.audio,
      trackedViews: entry.trackedViews,
      trackedReels: entry.trackedReels,
      platforms: [...entry.platforms],
    }))
}

export interface SummaryQuery {
  platform: FeedFilters['platform']
  timeframe: Timeframe
}

export interface AudioQuery extends SummaryQuery {}

export async function fetchTrendingReels(filters: FeedFilters): Promise<Reel[]> {
  const isDemo = activeProvider.id === 'demo'
  const [reels] = await Promise.all([
    loadDataset(),
    isDemo ? sleep(DEMO_LATENCY_MS) : Promise.resolve(),
  ])
  return filterAndSortReels(reels, filters)
}

export async function fetchDashboardSummary(query: SummaryQuery): Promise<DashboardSummary> {
  const reels = await loadDataset()
  return summarizeFor(reels, query.platform, query.timeframe)
}

export async function fetchAudioLeaderboard(query: AudioQuery): Promise<AudioSummary[]> {
  const reels = await loadDataset()
  return audioLeaderboardFor(reels, query.platform, query.timeframe)
}

export async function syncNow(): Promise<SyncResult> {
  const isDemo = activeProvider.id === 'demo'
  if (isDemo) {
    await sleep(350)
  }
  invalidateDataCache()
  const reels = await loadDataset()
  return { syncedAt: new Date().toISOString(), reels: reels.length }
}

export function meanTrend(points: number[]): number {
  return mean(points)
}
