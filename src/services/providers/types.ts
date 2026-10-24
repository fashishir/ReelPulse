import type { Reel } from '../../types'

/**
 * Optional per-call flags a provider may support.
 *
 * `refresh: true` asks the provider to fetch fresh upstream data instead of
 * serving its local snapshot/cache. Providers that have no cache layer
 * (demo, RapidAPI) can ignore it.
 */
export interface FetchReelsOptions {
  refresh?: boolean
}

/**
 * The single seam between the UI and its data source.
 *
 * A live integration only has to return the normalized `Reel` shape below.
 * Filtering, sorting, KPI aggregation and audio summaries stay inside
 * `dataService`, so swapping providers never touches component code.
 */
export interface ReelProvider {
  id: string
  label: string
  isLive: boolean
  fetchReels(options?: FetchReelsOptions): Promise<Reel[]>
}

export class ProviderNotWiredError extends Error {
  constructor(provider: string) {
    super(
      `The ${provider} adapter is scaffolded but not wired to a live endpoint yet. ` +
        'Add the request + response mapping inside its provider file.',
    )
    this.name = 'ProviderNotWiredError'
  }
}

export interface RapidApiConfig {
  apiKey: string
  host: string
}

export interface ApifyConfig {
  token: string
  actorId: string
}

export interface MetaConfig {
  accessToken: string
  igUserId: string
}
