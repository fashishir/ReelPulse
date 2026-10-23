export const PLATFORM_FILTERS = ['all', 'instagram', 'facebook'] as const
export type PlatformFilter = (typeof PLATFORM_FILTERS)[number]
export type Platform = Exclude<PlatformFilter, 'all'>

export const TIMEFRAME_VALUES = ['today', 'week', 'month'] as const
export type Timeframe = (typeof TIMEFRAME_VALUES)[number]

export const SORT_KEYS = ['views', 'likes', 'comments', 'engagement'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const CATEGORY_IDS = [
  'comedy',
  'tech',
  'fitness',
  'food',
  'fashion',
  'travel',
  'gaming',
  'finance',
  'music',
  'education',
] as const
export type CategoryId = (typeof CATEGORY_IDS)[number]
export type CategoryFilter = CategoryId | 'all'

export type DataSource = 'demo' | 'rapidapi' | 'apify' | 'meta'

export interface Creator {
  name: string
  handle: string
  verified: boolean
}

export interface AudioTrack {
  title: string
  artist: string
  uses: number
}

export interface MetricSet {
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
}

export type MetricsByTimeframe = Record<Timeframe, MetricSet>

export interface Reel {
  id: string
  platform: Platform
  category: CategoryId
  creator: Creator
  caption: string
  hashtags: string[]
  hook: string
  audio: AudioTrack
  durationSeconds: number
  postedAt: string
  metrics: MetricsByTimeframe
  velocity: number
  viewTrend: number[]
  externalUrl: string
  thumbnailUrl?: string
}

export interface FeedFilters {
  platform: PlatformFilter
  category: CategoryFilter
  sortBy: SortKey
  timeframe: Timeframe
  search: string
}

export interface FastestCategory {
  category: CategoryId
  avgVelocity: number
  reelCount: number
}

export interface TrendingAudioSummary {
  audio: AudioTrack
  trackedViews: number
  trackedReels: number
}

export interface DashboardSummary {
  topReel: Reel | null
  fastestCategory: FastestCategory | null
  totalViews: number
  viewsDelta: number
  sparkline: number[]
  trendingAudio: TrendingAudioSummary | null
  trackedReels: number
  trackedCreators: number
  categoryCounts: Record<CategoryId, number>
}

export interface AudioSummary {
  audio: AudioTrack
  trackedViews: number
  trackedReels: number
  platforms: Platform[]
}

export interface ApiSettings {
  source: DataSource
  rapidApiKey: string
  rapidApiHost: string
  apifyToken: string
  apifyActorId: string
  metaAccessToken: string
  metaIgUserId: string
  autoSync: boolean
  defaultTimeframe: Timeframe
}

export interface SyncState {
  lastSyncedAt: string
  syncCount: number
}

export interface SyncResult {
  syncedAt: string
  reels: number
}
