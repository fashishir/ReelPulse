import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AudioSummary,
  DashboardSummary,
  FeedFilters,
  Reel,
} from '../types'
import {
  fetchAudioLeaderboard,
  fetchDashboardSummary,
  fetchTrendingReels,
} from '../services/dataService'
import { useDebouncedValue } from './useDebouncedValue'

export interface DashboardState {
  reels: Reel[]
  summary: DashboardSummary | null
  audio: AudioSummary[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  retry: () => void
}

export function useDashboard(filters: FeedFilters, syncNonce: number): DashboardState {
  const debouncedSearch = useDebouncedValue(filters.search, 220)
  const [reels, setReels] = useState<Reel[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [audio, setAudio] = useState<AudioSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const hasLoadedRef = useRef(false)
  const requestRef = useRef(0)

  const query = useMemo<FeedFilters>(
    () => ({ ...filters, search: debouncedSearch }),
    [
      filters.platform,
      filters.category,
      filters.sortBy,
      filters.timeframe,
      debouncedSearch,
    ],
  )

  useEffect(() => {
    const requestId = ++requestRef.current

    if (!hasLoadedRef.current) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    Promise.all([
      fetchTrendingReels(query),
      fetchDashboardSummary({ platform: query.platform, timeframe: query.timeframe }),
      fetchAudioLeaderboard({ platform: query.platform, timeframe: query.timeframe }),
    ])
      .then(([nextReels, nextSummary, nextAudio]) => {
        if (requestId !== requestRef.current) return
        hasLoadedRef.current = true
        setReels(nextReels)
        setSummary(nextSummary)
        setAudio(nextAudio)
        setIsLoading(false)
        setIsRefreshing(false)
      })
      .catch((cause: unknown) => {
        if (requestId !== requestRef.current) return
        const message =
          cause instanceof Error ? cause.message : 'Could not load the trending feed.'
        setError(message)
        setIsLoading(false)
        setIsRefreshing(false)
      })
  }, [query, syncNonce, retryKey])

  const retry = useCallback(() => {
    setRetryKey((value) => value + 1)
  }, [])

  return { reels, summary, audio, isLoading, isRefreshing, error, retry }
}
