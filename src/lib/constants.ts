import type { SortKey, Timeframe } from '../types'

export const TIMEFRAME_META: Record<
  Timeframe,
  { label: string; short: string; description: string }
> = {
  today: { label: 'Today (24h)', short: 'Today', description: 'Last 24 hours' },
  week: { label: 'This Week', short: '7d', description: 'Last 7 days' },
  month: { label: 'This Month', short: '30d', description: 'Last 30 days' },
}

export const SORT_META: Record<SortKey, { label: string; short: string }> = {
  views: { label: 'Most Views', short: 'Views' },
  likes: { label: 'Most Likes', short: 'Likes' },
  comments: { label: 'Most Comments', short: 'Comments' },
  engagement: { label: 'Engagement Rate', short: 'Engagement' },
}

export const SORT_ORDER: SortKey[] = ['views', 'likes', 'comments', 'engagement']
export const TIMEFRAME_ORDER: Timeframe[] = ['today', 'week', 'month']

export function timeframeNoun(timeframe: Timeframe): string {
  if (timeframe === 'week') return 'this week'
  if (timeframe === 'month') return 'this month'
  return 'today'
}

export const PLATFORM_LABEL = {
  all: 'All platforms',
  instagram: 'Instagram',
  facebook: 'Facebook',
} as const
