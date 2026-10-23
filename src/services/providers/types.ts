import type { Reel } from '../../types'

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
  fetchReels(): Promise<Reel[]>
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
